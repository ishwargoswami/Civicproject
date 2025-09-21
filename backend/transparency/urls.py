from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, BudgetCategoryViewSet, PublicSpendingViewSet,
    PublicProjectViewSet, PerformanceMetricViewSet, PublicDocumentViewSet,
    TransparencyDashboardViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'categories', BudgetCategoryViewSet)
router.register(r'spending', PublicSpendingViewSet, basename='publicspending')
router.register(r'projects', PublicProjectViewSet, basename='publicproject')
router.register(r'metrics', PerformanceMetricViewSet)
router.register(r'documents', PublicDocumentViewSet)
router.register(r'dashboard', TransparencyDashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
