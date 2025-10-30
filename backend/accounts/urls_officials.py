"""
URL configuration for official-specific endpoints
"""
from django.urls import path
from .views_officials import (
    official_dashboard_stats,
    assigned_issues,
    urgent_issues,
    department_projects,
    assign_issue,
    update_issue_priority,
    performance_metrics,
    unassigned_issues,
    recent_activities
)

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', official_dashboard_stats, name='official-dashboard-stats'),
    path('performance-metrics/', performance_metrics, name='official-performance-metrics'),
    path('recent-activities/', recent_activities, name='official-recent-activities'),
    
    # Issues
    path('assigned-issues/', assigned_issues, name='official-assigned-issues'),
    path('urgent-issues/', urgent_issues, name='official-urgent-issues'),
    path('unassigned-issues/', unassigned_issues, name='official-unassigned-issues'),
    path('issues/<uuid:issue_id>/assign/', assign_issue, name='official-assign-issue'),
    path('issues/<uuid:issue_id>/priority/', update_issue_priority, name='official-update-priority'),
    
    # Projects
    path('projects/', department_projects, name='official-department-projects'),
]

