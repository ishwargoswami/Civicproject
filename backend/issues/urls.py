from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet, IssueCategoryViewSet, issue_stats

router = DefaultRouter()
router.register(r'categories', IssueCategoryViewSet)
router.register(r'', IssueViewSet)

urlpatterns = [
    path('stats/', issue_stats, name='issue-stats'),
    path('', include(router.urls)),
]
