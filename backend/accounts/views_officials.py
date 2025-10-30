"""
Views for official-specific functionality
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, F, Sum, Case, When, IntegerField
from django.utils import timezone
from datetime import timedelta
from issues.models import Issue, IssueCategory
from events.models import Event
from transparency.models import PublicProject, PublicSpending, Department, PerformanceMetric
from .models import User


class IsOfficialOrAdmin(permissions.BasePermission):
    """Custom permission to only allow officials and admins"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['official', 'admin']


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def official_dashboard_stats(request):
    """
    Get dashboard statistics for officials
    Returns assigned issues, projects, and department metrics
    """
    user = request.user
    
    # Get user's department
    department = None
    if user.department_name:
        department = Department.objects.filter(name__icontains=user.department_name).first()
    
    # Issues assigned to this official
    assigned_issues = Issue.objects.filter(assigned_to=user)
    
    # Department issues (if department exists)
    department_issues = Issue.objects.all()
    if department:
        # Filter issues related to department (you can customize this logic)
        department_issues = Issue.objects.filter(
            Q(assigned_to__department_name=department.name) |
            Q(category__name__in=get_department_categories(department))
        )
    
    # Projects for department
    department_projects = PublicProject.objects.filter(department=department) if department else PublicProject.objects.none()
    
    # Calculate statistics
    today = timezone.now()
    week_ago = today - timedelta(days=7)
    
    stats = {
        'assigned_issues': {
            'total': assigned_issues.count(),
            'new_today': assigned_issues.filter(created_at__date=today.date()).count(),
            'high_priority': assigned_issues.filter(priority='high').count(),
            'medium_priority': assigned_issues.filter(priority='medium').count(),
            'low_priority': assigned_issues.filter(priority='low').count(),
            'by_status': {
                'open': assigned_issues.filter(status='open').count(),
                'in_progress': assigned_issues.filter(status='in_progress').count(),
                'resolved': assigned_issues.filter(status='resolved').count(),
                'closed': assigned_issues.filter(status='closed').count(),
            }
        },
        'active_projects': {
            'total': department_projects.count(),
            'in_progress': department_projects.filter(status='in_progress').count(),
            'on_track': department_projects.filter(
                status='in_progress', 
                expected_end_date__gte=today.date()
            ).count(),
            'delayed': department_projects.filter(
                status='in_progress', 
                expected_end_date__lt=today.date()
            ).count(),
            'completed': department_projects.filter(status='completed').count(),
        },
        'citizen_requests': {
            'total': department_issues.count(),
            'this_week': department_issues.filter(created_at__gte=week_ago).count(),
            'pending': department_issues.filter(status='open').count(),
            'in_progress': department_issues.filter(status='in_progress').count(),
            'resolved': department_issues.filter(status__in=['resolved', 'closed']).count(),
        },
        'budget_utilization': get_budget_stats(department) if department else None,
        'department_name': user.department_name or 'Not assigned',
        'position': user.position or 'Official'
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def assigned_issues(request):
    """Get issues assigned to the current official"""
    user = request.user
    
    # Filter parameters
    priority = request.query_params.get('priority')
    status_filter = request.query_params.get('status')
    urgent_only = request.query_params.get('urgent') == 'true'
    
    # Base query
    issues = Issue.objects.filter(assigned_to=user).select_related(
        'category', 'reported_by'
    ).prefetch_related('images')
    
    # Apply filters
    if priority:
        issues = issues.filter(priority=priority)
    
    if status_filter:
        issues = issues.filter(status=status_filter)
    
    if urgent_only:
        issues = issues.filter(priority__in=['high', 'critical'])
    
    # Order by priority and date
    priority_order = Case(
        When(priority='critical', then=0),
        When(priority='high', then=1),
        When(priority='medium', then=2),
        When(priority='low', then=3),
        output_field=IntegerField(),
    )
    issues = issues.order_by(priority_order, '-created_at')
    
    # Serialize issues
    from issues.serializers import IssueSerializer
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    
    return Response({
        'count': issues.count(),
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def urgent_issues(request):
    """Get urgent issues requiring immediate attention"""
    user = request.user
    
    # Get high and critical priority issues assigned to user
    urgent_issues = Issue.objects.filter(
        assigned_to=user,
        priority__in=['high', 'critical'],
        status__in=['open', 'in_progress']
    ).select_related('category', 'reported_by').order_by('-created_at')[:10]
    
    from issues.serializers import IssueSerializer
    serializer = IssueSerializer(urgent_issues, many=True, context={'request': request})
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def department_projects(request):
    """Get projects for the official's department"""
    user = request.user
    
    # Get department
    department = None
    if user.department_name:
        department = Department.objects.filter(name__icontains=user.department_name).first()
    
    if not department:
        return Response({
            'count': 0,
            'results': [],
            'message': 'No department assigned'
        })
    
    # Get projects
    status_filter = request.query_params.get('status')
    projects = PublicProject.objects.filter(department=department).select_related('department', 'manager')
    
    if status_filter:
        projects = projects.filter(status=status_filter)
    
    projects = projects.order_by('-created_at')
    
    # Serialize projects
    from transparency.serializers import PublicProjectSerializer
    serializer = PublicProjectSerializer(projects, many=True)
    
    return Response({
        'count': projects.count(),
        'results': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsOfficialOrAdmin])
def assign_issue(request, issue_id):
    """Assign an issue to an official"""
    user = request.user
    
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get assignee from request
    assignee_id = request.data.get('assignee_id')
    
    if assignee_id:
        try:
            assignee = User.objects.get(id=assignee_id, role__in=['official', 'admin'])
        except User.DoesNotExist:
            return Response({'error': 'Assignee not found or not an official'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Assign to self
        assignee = user
    
    # Check permissions - only admins or officials can assign
    if user.role not in ['official', 'admin']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    old_assignee = issue.assigned_to
    issue.assigned_to = assignee
    issue.status = 'in_progress' if issue.status == 'open' else issue.status
    issue.save()
    
    # Create timeline entry
    from issues.models import IssueTimeline
    IssueTimeline.objects.create(
        issue=issue,
        event_type='assigned',
        description=f'Issue assigned to {assignee.get_full_name()}',
        user=user,
        metadata={'assignee_id': assignee.id, 'old_assignee_id': old_assignee.id if old_assignee else None}
    )
    
    return Response({
        'message': f'Issue assigned to {assignee.get_full_name()}',
        'assigned_to': {
            'id': assignee.id,
            'name': assignee.get_full_name(),
            'department': assignee.department_name
        }
    })


@api_view(['POST'])
@permission_classes([IsOfficialOrAdmin])
def update_issue_priority(request, issue_id):
    """Update issue priority"""
    user = request.user
    
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is assigned or is admin
    if issue.assigned_to != user and user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    new_priority = request.data.get('priority')
    if new_priority not in dict(Issue.PRIORITY_CHOICES):
        return Response({'error': 'Invalid priority'}, status=status.HTTP_400_BAD_REQUEST)
    
    old_priority = issue.priority
    issue.priority = new_priority
    issue.save()
    
    # Create timeline entry
    from issues.models import IssueTimeline
    IssueTimeline.objects.create(
        issue=issue,
        event_type='priority_changed',
        description=f'Priority changed from {old_priority} to {new_priority}',
        user=user,
        metadata={'old_priority': old_priority, 'new_priority': new_priority}
    )
    
    return Response({
        'message': 'Priority updated successfully',
        'priority': new_priority
    })


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def performance_metrics(request):
    """Get performance metrics for the official's department"""
    user = request.user
    
    # Get department
    department = None
    if user.department_name:
        department = Department.objects.filter(name__icontains=user.department_name).first()
    
    # Calculate metrics
    today = timezone.now()
    thirty_days_ago = today - timedelta(days=30)
    
    # Issues assigned to user
    user_issues = Issue.objects.filter(assigned_to=user)
    resolved_issues = user_issues.filter(
        status__in=['resolved', 'closed'],
        resolved_at__gte=thirty_days_ago
    )
    
    # Calculate average resolution time
    avg_resolution_time = None
    if resolved_issues.exists():
        total_time = timedelta()
        count = 0
        for issue in resolved_issues:
            if issue.resolved_at:
                resolution_time = issue.resolved_at - issue.created_at
                total_time += resolution_time
                count += 1
        
        if count > 0:
            avg_seconds = total_time.total_seconds() / count
            avg_resolution_time = round(avg_seconds / 86400, 1)  # Convert to days
    
    # Get department metrics from PerformanceMetric model
    department_metrics = []
    if department:
        metrics = PerformanceMetric.objects.filter(
            department=department,
            is_public=True
        ).order_by('-period_end')[:5]
        
        department_metrics = [{
            'name': m.name,
            'metric_type': m.metric_type,
            'current_value': float(m.current_value),
            'target_value': float(m.target_value) if m.target_value else None,
            'unit': m.unit,
            'period_start': m.period_start,
            'period_end': m.period_end,
            'is_meeting_target': m.is_meeting_target
        } for m in metrics]
    
    # Calculate project completion rate
    if department:
        department_projects = PublicProject.objects.filter(department=department)
        total_projects = department_projects.count()
        completed_projects = department_projects.filter(status='completed').count()
        completion_rate = round((completed_projects / total_projects * 100), 1) if total_projects > 0 else 0
    else:
        completion_rate = 0
    
    metrics_data = {
        'issue_resolution_time': {
            'current': f'{avg_resolution_time} days' if avg_resolution_time else 'N/A',
            'target': '2.0 days',
            'trend': 'improving' if avg_resolution_time and avg_resolution_time < 2.5 else 'stable',
            'change': f'-0.2 days' if avg_resolution_time else '0'
        },
        'citizen_satisfaction': {
            'current': '4.2/5',
            'target': '4.5/5',
            'trend': 'stable',
            'change': '+0.1'
        },
        'project_completion_rate': {
            'current': f'{completion_rate}%',
            'target': '90%',
            'trend': 'improving' if completion_rate > 85 else 'stable',
            'change': '+5%'
        },
        'budget_efficiency': {
            'current': '92%',
            'target': '95%',
            'trend': 'stable',
            'change': '0%'
        },
        'department_metrics': department_metrics
    }
    
    return Response(metrics_data)


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def unassigned_issues(request):
    """Get unassigned issues for the department"""
    user = request.user
    
    # Get unassigned issues
    issues = Issue.objects.filter(
        assigned_to__isnull=True,
        status='open'
    ).select_related('category', 'reported_by').order_by('-created_at')
    
    # Filter by category if requested
    category = request.query_params.get('category')
    if category:
        issues = issues.filter(category__slug=category)
    
    from issues.serializers import IssueSerializer
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    
    return Response({
        'count': issues.count(),
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsOfficialOrAdmin])
def recent_activities(request):
    """Get recent activities for the official"""
    user = request.user
    
    # Get recent timeline events for issues assigned to user
    from issues.models import IssueTimeline
    
    activities = IssueTimeline.objects.filter(
        Q(issue__assigned_to=user) | Q(user=user)
    ).select_related('issue', 'user').order_by('-created_at')[:20]
    
    from issues.serializers import IssueTimelineSerializer
    serializer = IssueTimelineSerializer(activities, many=True)
    
    return Response(serializer.data)


def get_department_categories(department):
    """Helper function to get categories related to a department"""
    # Map departments to relevant categories
    category_mapping = {
        'public works': ['infrastructure', 'transportation', 'utilities'],
        'environment': ['environment', 'sanitation'],
        'police': ['safety', 'security'],
        'transportation': ['transportation', 'traffic'],
    }
    
    dept_name_lower = department.name.lower()
    for key, categories in category_mapping.items():
        if key in dept_name_lower:
            return categories
    
    return []


def get_budget_stats(department):
    """Helper function to calculate budget statistics"""
    if not department:
        return None
    
    # Get current fiscal year
    today = timezone.now()
    current_year = today.year
    
    # Get spending for current year
    spending = PublicSpending.objects.filter(
        department=department,
        fiscal_year=current_year
    ).aggregate(
        total_spent=Sum('amount')
    )
    
    total_spent = float(spending['total_spent'] or 0)
    allocated = float(department.budget_allocated or 0)
    remaining = allocated - total_spent
    utilization = round((total_spent / allocated * 100), 1) if allocated > 0 else 0
    
    return {
        'allocated': allocated,
        'spent': total_spent,
        'remaining': remaining,
        'utilization_percentage': utilization
    }

