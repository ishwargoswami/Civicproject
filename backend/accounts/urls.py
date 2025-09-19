from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.UserLogoutView.as_view(), name='user-logout'),
    
    # OTP Verification
    path('otp/send/', views.SendOTPView.as_view(), name='send-otp'),
    path('otp/verify/', views.VerifyOTPView.as_view(), name='verify-otp'),
    
    # Profile
    path('me/', views.current_user, name='current-user'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/extended/', views.ExtendedUserProfileView.as_view(), name='extended-profile'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    
    # Activity
    path('activity/', views.UserActivityView.as_view(), name='user-activity'),
    
    # Public
    path('users/', views.PublicUserListView.as_view(), name='public-users'),
    
    # Admin
    path('verify/<int:user_id>/', views.verify_user, name='verify-user'),
]
