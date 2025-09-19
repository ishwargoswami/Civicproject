from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.ForumCategoryViewSet)
router.register(r'posts', views.ForumPostViewSet)
router.register(r'comments', views.ForumCommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
