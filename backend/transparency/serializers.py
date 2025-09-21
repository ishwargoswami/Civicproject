from rest_framework import serializers
from django.db.models import Sum, Count, Avg
from .models import (
    Department, BudgetCategory, PublicSpending, PublicProject, 
    ProjectMilestone, PerformanceMetric, PublicDocument
)
from accounts.serializers import PublicUserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    head = PublicUserSerializer(read_only=True)
    total_spending = serializers.SerializerMethodField()
    active_projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'slug', 'description', 'head', 'budget_allocated',
            'contact_email', 'contact_phone', 'is_active', 'created_at',
            'total_spending', 'active_projects_count'
        ]
    
    def get_total_spending(self, obj):
        return obj.spending.aggregate(total=Sum('amount'))['total'] or 0
    
    def get_active_projects_count(self, obj):
        return obj.projects.filter(status__in=['approved', 'in_progress']).count()


class BudgetCategorySerializer(serializers.ModelSerializer):
    total_allocated = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetCategory
        fields = [
            'id', 'name', 'slug', 'description', 'parent', 'color',
            'total_allocated', 'total_spent', 'projects_count'
        ]
    
    def get_total_allocated(self, obj):
        return obj.projects.aggregate(total=Sum('budget_allocated'))['total'] or 0
    
    def get_total_spent(self, obj):
        return obj.spending.aggregate(total=Sum('amount'))['total'] or 0
    
    def get_projects_count(self, obj):
        return obj.projects.count()


class PublicSpendingSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    category = BudgetCategorySerializer(read_only=True)
    approved_by = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = PublicSpending
        fields = [
            'id', 'title', 'description', 'department', 'category', 'amount',
            'currency', 'vendor_name', 'vendor_contact', 'contract_number',
            'contract_date', 'fiscal_year', 'transaction_date', 'documents',
            'is_approved', 'approved_by', 'created_at', 'updated_at'
        ]


class PublicSpendingSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for spending summaries"""
    department_name = serializers.CharField(source='department.name')
    category_name = serializers.CharField(source='category.name')
    category_color = serializers.CharField(source='category.color')
    
    class Meta:
        model = PublicSpending
        fields = [
            'id', 'title', 'amount', 'fiscal_year', 'transaction_date',
            'department_name', 'category_name', 'category_color'
        ]


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = [
            'id', 'title', 'description', 'target_date', 'completion_date',
            'is_completed', 'created_at'
        ]


class PublicProjectSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    category = BudgetCategorySerializer(read_only=True)
    manager = PublicUserSerializer(read_only=True)
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    budget_remaining = serializers.ReadOnlyField()
    is_over_budget = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = PublicProject
        fields = [
            'id', 'name', 'description', 'department', 'category', 'manager',
            'budget_allocated', 'budget_spent', 'budget_remaining', 'is_over_budget',
            'start_date', 'expected_end_date', 'actual_end_date', 'is_overdue',
            'status', 'progress_percentage', 'is_public', 'website',
            'milestones', 'created_at', 'updated_at'
        ]


class PublicProjectSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for project summaries"""
    department_name = serializers.CharField(source='department.name')
    category_name = serializers.CharField(source='category.name')
    category_color = serializers.CharField(source='category.color')
    budget_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = PublicProject
        fields = [
            'id', 'name', 'status', 'progress_percentage', 'budget_allocated',
            'budget_spent', 'budget_remaining', 'is_overdue', 'start_date',
            'expected_end_date', 'department_name', 'category_name', 'category_color'
        ]


class PerformanceMetricSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    project = PublicProjectSummarySerializer(read_only=True)
    is_meeting_target = serializers.ReadOnlyField()
    
    class Meta:
        model = PerformanceMetric
        fields = [
            'id', 'name', 'metric_type', 'description', 'department', 'project',
            'current_value', 'target_value', 'unit', 'period_start', 'period_end',
            'is_meeting_target', 'is_public', 'created_at', 'updated_at'
        ]


class PublicDocumentSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    uploaded_by = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = PublicDocument
        fields = [
            'id', 'title', 'description', 'document_type', 'department',
            'file', 'file_size', 'file_type', 'tags', 'date_created',
            'is_public', 'requires_request', 'uploaded_by', 'created_at'
        ]


# Statistics Serializers
class SpendingByDepartmentSerializer(serializers.Serializer):
    department_name = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()


class SpendingByCategorySerializer(serializers.Serializer):
    category_name = serializers.CharField()
    category_color = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()


class SpendingTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()


class ProjectStatusDistributionSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)


class BudgetOverviewSerializer(serializers.Serializer):
    fiscal_year = serializers.IntegerField()
    total_allocated = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    utilization_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class TransparencyDashboardStatsSerializer(serializers.Serializer):
    total_spending = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    total_departments = serializers.IntegerField()
    total_documents = serializers.IntegerField()
    avg_project_completion = serializers.DecimalField(max_digits=5, decimal_places=2)
    budget_utilization = serializers.DecimalField(max_digits=5, decimal_places=2)
