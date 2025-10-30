from django.contrib import admin
from .models import (
    Department, BudgetCategory, PublicSpending, PublicProject,
    ProjectMilestone, PerformanceMetric, PublicDocument
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'head', 'budget_allocated', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['head']


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['parent']


@admin.register(PublicSpending)
class PublicSpendingAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'category', 'amount', 'fiscal_year', 'transaction_date', 'is_approved']
    list_filter = ['department', 'category', 'fiscal_year', 'is_approved', 'transaction_date']
    search_fields = ['title', 'description', 'vendor_name']
    list_editable = ['is_approved']
    date_hierarchy = 'transaction_date'
    raw_id_fields = ['department', 'category', 'approved_by']


@admin.register(PublicProject)
class PublicProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'status', 'progress_percentage', 'budget_allocated', 'budget_spent', 'start_date', 'expected_end_date']
    list_filter = ['department', 'status', 'is_public', 'start_date']
    search_fields = ['name', 'description']
    list_editable = ['status', 'progress_percentage']
    date_hierarchy = 'start_date'
    raw_id_fields = ['department', 'category', 'manager']


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'target_date', 'completion_date', 'is_completed']
    list_filter = ['is_completed', 'target_date']
    search_fields = ['title', 'description']
    list_editable = ['is_completed']
    date_hierarchy = 'target_date'
    raw_id_fields = ['project']


@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    list_display = ['name', 'metric_type', 'department', 'current_value', 'target_value', 'unit', 'period_end', 'is_public']
    list_filter = ['metric_type', 'department', 'is_public', 'period_end']
    search_fields = ['name', 'description']
    date_hierarchy = 'period_end'
    raw_id_fields = ['department', 'project']


@admin.register(PublicDocument)
class PublicDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'document_type', 'department', 'date_created', 'is_public', 'requires_request']
    list_filter = ['document_type', 'department', 'is_public', 'requires_request', 'date_created']
    search_fields = ['title', 'description', 'tags']
    date_hierarchy = 'date_created'
    raw_id_fields = ['department', 'uploaded_by']

