from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone
from datetime import datetime, timedelta
import calendar

from .models import (
    Department, BudgetCategory, PublicSpending, PublicProject, 
    ProjectMilestone, PerformanceMetric, PublicDocument
)
from .serializers import (
    DepartmentSerializer, BudgetCategorySerializer, PublicSpendingSerializer,
    PublicSpendingSummarySerializer, PublicProjectSerializer, PublicProjectSummarySerializer,
    ProjectMilestoneSerializer, PerformanceMetricSerializer, PublicDocumentSerializer,
    SpendingByDepartmentSerializer, SpendingByCategorySerializer, SpendingTrendSerializer,
    ProjectStatusDistributionSerializer, BudgetOverviewSerializer,
    TransparencyDashboardStatsSerializer
)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]  # Allow public access for transparency


class BudgetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BudgetCategory.objects.filter(is_active=True)
    serializer_class = BudgetCategorySerializer
    permission_classes = [AllowAny]  # Allow public access for transparency


class PublicSpendingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicSpendingSerializer
    permission_classes = [AllowAny]  # Allow public access for transparency
    
    def get_queryset(self):
        queryset = PublicSpending.objects.filter(is_approved=True).select_related(
            'department', 'category', 'approved_by'
        )
        
        # Filter parameters
        year = self.request.query_params.get('year')
        department = self.request.query_params.get('department')
        category = self.request.query_params.get('category')
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        
        if year:
            queryset = queryset.filter(fiscal_year=year)
        if department:
            queryset = queryset.filter(department__slug=department)
        if category:
            queryset = queryset.filter(category__slug=category)
        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)
            
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PublicSpendingSummarySerializer
        return PublicSpendingSerializer
    
    @action(detail=False, methods=['get'])
    def by_department(self, request):
        """Get spending aggregated by department"""
        year = request.query_params.get('year')
        queryset = PublicSpending.objects.filter(is_approved=True)
        
        if year:
            queryset = queryset.filter(fiscal_year=year)
        
        data = queryset.values('department__name').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        # Rename fields for serializer
        formatted_data = [
            {
                'department_name': item['department__name'],
                'total_amount': item['total_amount'],
                'transaction_count': item['transaction_count']
            }
            for item in data
        ]
        
        serializer = SpendingByDepartmentSerializer(formatted_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get spending aggregated by category"""
        year = request.query_params.get('year')
        queryset = PublicSpending.objects.filter(is_approved=True)
        
        if year:
            queryset = queryset.filter(fiscal_year=year)
        
        data = queryset.values('category__name', 'category__color').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        # Rename fields for serializer
        formatted_data = [
            {
                'category_name': item['category__name'],
                'category_color': item['category__color'],
                'total_amount': item['total_amount'],
                'transaction_count': item['transaction_count']
            }
            for item in data
        ]
        
        serializer = SpendingByCategorySerializer(formatted_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get spending trends over time"""
        year = request.query_params.get('year', timezone.now().year)
        
        queryset = PublicSpending.objects.filter(
            is_approved=True,
            fiscal_year=year
        )
        
        # Group by month
        data = queryset.annotate(
            month=TruncMonth('transaction_date')
        ).values('month').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('month')
        
        # Format data with month names
        formatted_data = []
        for item in data:
            month_name = calendar.month_name[item['month'].month]
            formatted_data.append({
                'month': f"{month_name} {item['month'].year}",
                'total_amount': item['total_amount'],
                'transaction_count': item['transaction_count']
            })
        
        serializer = SpendingTrendSerializer(formatted_data, many=True)
        return Response(serializer.data)


class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicProjectSerializer
    permission_classes = [AllowAny]  # Allow public access for transparency
    
    def get_queryset(self):
        queryset = PublicProject.objects.filter(is_public=True).select_related(
            'department', 'category', 'manager'
        ).prefetch_related('milestones')
        
        # Filter parameters
        status = self.request.query_params.get('status')
        department = self.request.query_params.get('department')
        category = self.request.query_params.get('category')
        
        if status:
            queryset = queryset.filter(status=status)
        if department:
            queryset = queryset.filter(department__slug=department)
        if category:
            queryset = queryset.filter(category__slug=category)
            
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PublicProjectSummarySerializer
        return PublicProjectSerializer
    
    @action(detail=False, methods=['get'])
    def status_distribution(self, request):
        """Get project status distribution"""
        data = PublicProject.objects.filter(is_public=True).values('status').annotate(
            count=Count('id'),
            total_budget=Sum('budget_allocated')
        ).order_by('status')
        
        serializer = ProjectStatusDistributionSerializer(data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue projects"""
        today = timezone.now().date()
        queryset = PublicProject.objects.filter(
            is_public=True,
            expected_end_date__lt=today,
            status__in=['approved', 'in_progress']
        )
        
        serializer = PublicProjectSummarySerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def over_budget(self, request):
        """Get projects that are over budget"""
        queryset = PublicProject.objects.filter(
            is_public=True,
            budget_spent__gt=F('budget_allocated')
        )
        
        serializer = PublicProjectSummarySerializer(queryset, many=True)
        return Response(serializer.data)


class PerformanceMetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PerformanceMetric.objects.filter(is_public=True)
    serializer_class = PerformanceMetricSerializer
    permission_classes = [AllowAny]  # Allow public access for transparency
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter parameters
        metric_type = self.request.query_params.get('metric_type')
        department = self.request.query_params.get('department')
        
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        if department:
            queryset = queryset.filter(department__slug=department)
            
        return queryset


class PublicDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PublicDocument.objects.filter(is_public=True)
    serializer_class = PublicDocumentSerializer
    permission_classes = [AllowAny]  # Allow public access for transparency
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter parameters
        document_type = self.request.query_params.get('document_type')
        department = self.request.query_params.get('department')
        
        if document_type:
            queryset = queryset.filter(document_type=document_type)
        if department:
            queryset = queryset.filter(department__slug=department)
            
        return queryset


class TransparencyDashboardViewSet(viewsets.ViewSet):
    """Dashboard endpoints for transparency overview"""
    permission_classes = [AllowAny]  # Allow public access for transparency
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get dashboard overview statistics"""
        current_year = timezone.now().year
        
        # Calculate statistics
        total_spending = PublicSpending.objects.filter(
            is_approved=True,
            fiscal_year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_projects = PublicProject.objects.filter(is_public=True).count()
        active_projects = PublicProject.objects.filter(
            is_public=True,
            status__in=['approved', 'in_progress']
        ).count()
        completed_projects = PublicProject.objects.filter(
            is_public=True,
            status='completed'
        ).count()
        
        total_departments = Department.objects.filter(is_active=True).count()
        total_documents = PublicDocument.objects.filter(is_public=True).count()
        
        # Average project completion percentage
        avg_project_completion = PublicProject.objects.filter(
            is_public=True
        ).aggregate(avg=Avg('progress_percentage'))['avg'] or 0
        
        # Budget utilization (spent vs allocated for current year)
        budget_data = PublicProject.objects.filter(
            is_public=True,
            start_date__year=current_year
        ).aggregate(
            allocated=Sum('budget_allocated'),
            spent=Sum('budget_spent')
        )
        
        budget_utilization = 0
        if budget_data['allocated'] and budget_data['allocated'] > 0:
            budget_utilization = (budget_data['spent'] or 0) / budget_data['allocated'] * 100
        
        data = {
            'total_spending': total_spending,
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'total_departments': total_departments,
            'total_documents': total_documents,
            'avg_project_completion': round(avg_project_completion, 2),
            'budget_utilization': round(budget_utilization, 2)
        }
        
        serializer = TransparencyDashboardStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def budget_overview(self, request):
        """Get budget overview by fiscal year"""
        years = PublicSpending.objects.filter(is_approved=True).values_list(
            'fiscal_year', flat=True
        ).distinct().order_by('-fiscal_year')
        
        data = []
        for year in years:
            spending_data = PublicSpending.objects.filter(
                is_approved=True,
                fiscal_year=year
            ).aggregate(total_spent=Sum('amount'))
            
            project_data = PublicProject.objects.filter(
                start_date__year=year
            ).aggregate(total_allocated=Sum('budget_allocated'))
            
            total_spent = spending_data['total_spent'] or 0
            total_allocated = project_data['total_allocated'] or 0
            total_remaining = total_allocated - total_spent
            utilization_percentage = (total_spent / total_allocated * 100) if total_allocated > 0 else 0
            
            data.append({
                'fiscal_year': year,
                'total_allocated': total_allocated,
                'total_spent': total_spent,
                'total_remaining': total_remaining,
                'utilization_percentage': round(utilization_percentage, 2)
            })
        
        serializer = BudgetOverviewSerializer(data, many=True)
        return Response(serializer.data)
