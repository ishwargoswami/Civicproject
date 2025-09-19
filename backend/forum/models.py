from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import User
import uuid


class ForumCategory(models.Model):
    """Categories for forum posts"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_categories'
        verbose_name = 'Forum Category'
        verbose_name_plural = 'Forum Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class ForumPost(models.Model):
    """Forum posts for community discussions"""
    
    POST_TYPES = [
        ('discussion', 'Discussion'),
        ('poll', 'Poll'),
        ('petition', 'Petition'),
        ('announcement', 'Announcement'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='posts')
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='discussion')
    
    # User Information
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    
    # Engagement
    views = models.PositiveIntegerField(default=0)
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)
    
    # Settings
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_posts'
        verbose_name = 'Forum Post'
        verbose_name_plural = 'Forum Posts'
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['category', 'post_type']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['is_pinned', 'created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def total_votes(self):
        return self.upvotes + self.downvotes
    
    @property
    def score(self):
        return self.upvotes - self.downvotes
    
    @property
    def comments_count(self):
        return self.comments.count()


class ForumPostVote(models.Model):
    """Votes on forum posts"""
    
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_post_votes'
        verbose_name = 'Forum Post Vote'
        verbose_name_plural = 'Forum Post Votes'
        unique_together = ['post', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} {self.vote_type}voted {self.post.title}"


class Poll(models.Model):
    """Poll attached to forum posts"""
    
    post = models.OneToOneField(ForumPost, on_delete=models.CASCADE, related_name='poll')
    question = models.CharField(max_length=300)
    allow_multiple = models.BooleanField(default=False)
    ends_at = models.DateTimeField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'polls'
        verbose_name = 'Poll'
        verbose_name_plural = 'Polls'
    
    def __str__(self):
        return f"Poll: {self.question}"
    
    @property
    def total_votes(self):
        return sum(option.votes for option in self.options.all())
    
    @property
    def is_active(self):
        from django.utils import timezone
        if self.ends_at:
            return timezone.now() < self.ends_at
        return True


class PollOption(models.Model):
    """Options for polls"""
    
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    votes = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'poll_options'
        verbose_name = 'Poll Option'
        verbose_name_plural = 'Poll Options'
        ordering = ['order']
    
    def __str__(self):
        return self.text
    
    @property
    def percentage(self):
        total = self.poll.total_votes
        if total == 0:
            return 0
        return round((self.votes / total) * 100, 1)


class PollVote(models.Model):
    """User votes on poll options"""
    
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='user_votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'poll_votes'
        verbose_name = 'Poll Vote'
        verbose_name_plural = 'Poll Votes'
        unique_together = ['poll', 'option', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} voted for {self.option.text}"


class Petition(models.Model):
    """Petition attached to forum posts"""
    
    post = models.OneToOneField(ForumPost, on_delete=models.CASCADE, related_name='petition')
    target = models.CharField(max_length=200, help_text="Who is this petition directed to?")
    goal = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    signatures = models.PositiveIntegerField(default=0)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'petitions'
        verbose_name = 'Petition'
        verbose_name_plural = 'Petitions'
    
    def __str__(self):
        return f"Petition: {self.post.title}"
    
    @property
    def progress_percentage(self):
        if self.goal == 0:
            return 0
        return min(round((self.signatures / self.goal) * 100, 1), 100)
    
    @property
    def is_successful(self):
        return self.signatures >= self.goal
    
    @property
    def is_active(self):
        from django.utils import timezone
        if self.deadline:
            return timezone.now() < self.deadline
        return True


class PetitionSignature(models.Model):
    """Signatures on petitions"""
    
    petition = models.ForeignKey(Petition, on_delete=models.CASCADE, related_name='user_signatures')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField(blank=True, max_length=500)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'petition_signatures'
        verbose_name = 'Petition Signature'
        verbose_name_plural = 'Petition Signatures'
        unique_together = ['petition', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} signed {self.petition.post.title}"


class ForumComment(models.Model):
    """Comments on forum posts"""
    
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    # Engagement
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_comments'
        verbose_name = 'Forum Comment'
        verbose_name_plural = 'Forum Comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.post.title}"
    
    @property
    def score(self):
        return self.upvotes - self.downvotes


class ForumCommentVote(models.Model):
    """Votes on forum comments"""
    
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    comment = models.ForeignKey(ForumComment, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_comment_votes'
        verbose_name = 'Forum Comment Vote'
        verbose_name_plural = 'Forum Comment Votes'
        unique_together = ['comment', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} {self.vote_type}voted comment"
