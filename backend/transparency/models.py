from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
import uuid


class Department(models.Model):
    """Government departments"""
    
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    head = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'official'}
    )
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BudgetCategory(models.Model):
    """Budget categories for spending tracking"""
    
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'budget_categories'
        verbose_name = 'Budget Category'
        verbose_name_plural = 'Budget Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class PublicSpending(models.Model):
    """Public spending records"""
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='spending')
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, related_name='spending')
    
    # Financial Information
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default='USD')
    
    # Vendor Information
    vendor_name = models.CharField(max_length=300, blank=True)
    vendor_contact = models.TextField(blank=True)
    
    # Contract Information
    contract_number = models.CharField(max_length=100, blank=True)
    contract_date = models.DateField(null=True, blank=True)
    
    # Timeline
    fiscal_year = models.PositiveIntegerField()
    transaction_date = models.DateField()
    
    # Documentation
    documents = models.JSONField(default=list, blank=True)  # URLs to documents
    
    # Status
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_spending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_spending'
        verbose_name = 'Public Spending Record'
        verbose_name_plural = 'Public Spending Records'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['department', 'fiscal_year']),
            models.Index(fields=['category', 'fiscal_year']),
            models.Index(fields=['transaction_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - ${self.amount}"


class PublicProject(models.Model):
    """Public projects and initiatives"""
    
    PROJECT_STATUSES = [
        ('planned', 'Planned'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300)
    description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='projects')
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, related_name='projects')
    
    # Project Manager
    manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='managed_projects'
    )
    
    # Financial Information
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    budget_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Timeline
    start_date = models.DateField()
    expected_end_date = models.DateField()
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=PROJECT_STATUSES, default='planned')
    progress_percentage = models.PositiveIntegerField(
        default=0, 
        validators=[MaxValueValidator(100)]
    )
    
    # Public Information
    is_public = models.BooleanField(default=True)
    website = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_projects'
        verbose_name = 'Public Project'
        verbose_name_plural = 'Public Projects'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def budget_remaining(self):
        return self.budget_allocated - self.budget_spent
    
    @property
    def is_over_budget(self):
        return self.budget_spent > self.budget_allocated
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        if self.status not in ['completed', 'cancelled']:
            return timezone.now().date() > self.expected_end_date
        return False


class ProjectMilestone(models.Model):
    """Milestones for public projects"""
    
    project = models.ForeignKey(PublicProject, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_milestones'
        verbose_name = 'Project Milestone'
        verbose_name_plural = 'Project Milestones'
        ordering = ['target_date']
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"


class PerformanceMetric(models.Model):
    """Performance metrics for departments and projects"""
    
    METRIC_TYPES = [
        ('efficiency', 'Efficiency'),
        ('satisfaction', 'Satisfaction'),
        ('response_time', 'Response Time'),
        ('completion_rate', 'Completion Rate'),
        ('budget_utilization', 'Budget Utilization'),
        ('custom', 'Custom'),
    ]
    
    name = models.CharField(max_length=200)
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPES)
    description = models.TextField(blank=True)
    
    # Related objects
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='metrics'
    )
    project = models.ForeignKey(
        PublicProject, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='metrics'
    )
    
    # Value and target
    current_value = models.DecimalField(max_digits=10, decimal_places=2)
    target_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    
    # Time period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Metadata
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'performance_metrics'
        verbose_name = 'Performance Metric'
        verbose_name_plural = 'Performance Metrics'
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.name} - {self.current_value} {self.unit}"
    
    @property
    def is_meeting_target(self):
        if self.target_value:
            return self.current_value >= self.target_value
        return None


class PublicDocument(models.Model):
    """Public documents and records"""
    
    DOCUMENT_TYPES = [
        ('meeting_minutes', 'Meeting Minutes'),
        ('budget_report', 'Budget Report'),
        ('policy_document', 'Policy Document'),
        ('contract', 'Contract'),
        ('proposal', 'Proposal'),
        ('report', 'Report'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='documents')
    
    # File information
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    file_size = models.PositiveIntegerField(default=0)  # in bytes
    file_type = models.CharField(max_length=50, blank=True)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    date_created = models.DateField()
    
    # Access control
    is_public = models.BooleanField(default=True)
    requires_request = models.BooleanField(default=False)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'public_documents'
        verbose_name = 'Public Document'
        verbose_name_plural = 'Public Documents'
        ordering = ['-date_created']
    
    def __str__(self):
        return self.title
