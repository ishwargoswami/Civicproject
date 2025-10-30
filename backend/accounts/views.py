from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.utils import timezone
from .models import User, UserProfile, UserActivity, OTPVerification
from .notification_models import NotificationPreference
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserProfileUpdateSerializer, ExtendedUserProfileSerializer,
    UserActivitySerializer, PasswordChangeSerializer, PublicUserSerializer,
    OTPVerificationSerializer, OTPVerifySerializer, NotificationPreferenceSerializer
)


class UserRegistrationView(APIView):
    """User registration endpoint"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access = refresh.access_token
                
                # Try to log activity (optional)
                try:
                    UserActivity.objects.create(
                        user=user,
                        activity_type='login',
                        description='User registered and logged in',
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                except Exception as e:
                    print(f"Warning: Could not log user activity: {e}")
                
                # Return basic user data
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_verified': getattr(user, 'is_verified', True),
                    'full_name': f"{user.first_name} {user.last_name}".strip()
                }
                
                return Response({
                    'user': user_data,
                    'token': str(access),
                    'refresh': str(refresh),
                    'message': 'Registration successful'
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                print(f"Registration error: {e}")
                import traceback
                traceback.print_exc()
                return Response({
                    'message': 'Registration failed due to server error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLoginView(APIView):
    """User login endpoint"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.validated_data['user']
                
                # Update last active (optional)
                try:
                    user.last_active = timezone.now()
                    user.save()
                except Exception as e:
                    print(f"Warning: Could not update last_active: {e}")
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access = refresh.access_token
                
                # Try to log activity (optional)
                try:
                    UserActivity.objects.create(
                        user=user,
                        activity_type='login',
                        description='User logged in',
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                except Exception as e:
                    print(f"Warning: Could not log user activity: {e}")
                
                # Return basic user data
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_verified': getattr(user, 'is_verified', True),
                    'full_name': f"{user.first_name} {user.last_name}".strip()
                }
                
                return Response({
                    'user': user_data,
                    'token': str(access),
                    'refresh': str(refresh),
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                print(f"Login error: {e}")
                import traceback
                traceback.print_exc()
                return Response({
                    'message': 'Login failed due to server error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLogoutView(APIView):
    """User logout endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='logout',
                description='User logged out'
            )
            
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(RetrieveUpdateAPIView):
    """Get and update user profile"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserProfileSerializer
        return UserProfileUpdateSerializer
    
    def get_object(self):
        return self.request.user
    
    def perform_update(self, serializer):
        serializer.save()
        
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='profile_updated',
            description='User updated their profile'
        )


class ExtendedUserProfileView(RetrieveUpdateAPIView):
    """Get and update extended user profile"""
    
    serializer_class = ExtendedUserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class PasswordChangeView(APIView):
    """Change user password"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='profile_updated',
                description='User changed their password'
            )
            
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserActivityView(ListAPIView):
    """Get user activity history"""
    
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)


class PublicUserListView(ListAPIView):
    """Get list of public user profiles"""
    
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(is_active=True)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_user(request, user_id):
    """Verify a user (admin only)"""
    if not request.user.is_platform_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.is_verified = True
        user.save()
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='profile_updated',
            description=f'Admin verified user {user.full_name}',
            metadata={'verified_user_id': user_id}
        )
        
        return Response({'message': f'User {user.full_name} verified successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class SendOTPView(APIView):
    """Send OTP for verification"""
    permission_classes = []  # Allow unauthenticated access for registration OTP
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.save()
            return Response({
                'message': f'OTP sent to {otp.email}',
                'expires_in': '10 minutes'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """Verify OTP code"""
    permission_classes = []  # Allow unauthenticated access for registration OTP verification
    
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            otp_verified = serializer.save()
            if otp_verified:
                return Response({
                    'message': 'OTP verified successfully',
                    'verified': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'OTP verification failed',
                    'verified': False
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


