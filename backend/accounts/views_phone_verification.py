"""
Phone number verification for WhatsApp notifications
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import random
import string

from .models import User, OTPVerification
from notifications.whatsapp_service import whatsapp_service
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_phone_verification(request):
    """
    Send verification code to user's phone via WhatsApp
    """
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response(
            {'error': 'Phone number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate phone number format (should start with + and country code)
    if not phone_number.startswith('+'):
        return Response(
            {'error': 'Phone number must include country code (e.g., +1234567890)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if WhatsApp service is configured
    if not whatsapp_service.is_configured:
        return Response(
            {'error': 'WhatsApp service is not configured. Please contact administrator.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # Save OTP to database
    try:
        # Invalidate any existing OTPs for this user
        OTPVerification.objects.filter(
            user=request.user,
            purpose='phone_verification',
            is_verified=False
        ).update(is_verified=True)  # Mark old OTPs as used
        
        # Create new OTP
        otp_obj = OTPVerification.objects.create(
            user=request.user,
            email=request.user.email,
            otp_code=otp_code,
            purpose='phone_verification',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send WhatsApp verification code
        result = whatsapp_service.send_verification_code(phone_number, otp_code)
        
        if result['success']:
            # Temporarily store phone number in session or user metadata
            # We'll save it to user model after verification
            request.user.metadata = request.user.metadata or {}
            request.user.metadata['pending_phone_number'] = phone_number
            request.user.save()
            
            logger.info(f"Verification code sent to {phone_number} for user {request.user.email}")
            
            return Response({
                'message': 'Verification code sent to your WhatsApp',
                'expires_in': '10 minutes'
            }, status=status.HTTP_200_OK)
        else:
            logger.error(f"Failed to send verification code to {phone_number}: {result.get('error')}")
            return Response({
                'error': 'Failed to send verification code. Please check your phone number.',
                'details': result.get('error')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.error(f"Error in phone verification: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_phone_code(request):
    """
    Verify the code sent to user's phone
    """
    code = request.data.get('code')
    
    if not code:
        return Response(
            {'error': 'Verification code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find the OTP
        otp_obj = OTPVerification.objects.filter(
            user=request.user,
            otp_code=code,
            purpose='phone_verification',
            is_verified=False
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expired
        if otp_obj.is_expired():
            return Response(
                {'error': 'Verification code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        otp_obj.verify()
        
        # Get pending phone number and save to user
        user = request.user
        pending_phone = user.metadata.get('pending_phone_number') if user.metadata else None
        
        if pending_phone:
            user.phone_number = pending_phone
            user.save()
            
            # Update notification preferences to mark WhatsApp as verified
            from .notification_models import NotificationPreference
            prefs, created = NotificationPreference.objects.get_or_create(user=user)
            prefs.whatsapp_verified = True
            prefs.whatsapp_enabled = True  # Enable by default after verification
            prefs.save()
            
            # Clean up metadata
            if user.metadata:
                user.metadata.pop('pending_phone_number', None)
                user.save()
            
            logger.info(f"Phone verified for user {user.email}: {pending_phone}")
            
            return Response({
                'message': 'Phone number verified successfully!',
                'phone_number': pending_phone
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'No pending phone number found. Please start verification again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        logger.error(f"Error verifying phone code: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_phone_number(request):
    """
    Remove phone number and disable WhatsApp notifications
    """
    try:
        user = request.user
        user.phone_number = ''
        
        # Clean up metadata
        if user.metadata and 'pending_phone_number' in user.metadata:
            user.metadata.pop('pending_phone_number')
        
        user.save()
        
        # Update notification preferences
        from .notification_models import NotificationPreference
        try:
            prefs = user.notification_preferences
            prefs.whatsapp_verified = False
            prefs.whatsapp_enabled = False
            prefs.save()
        except NotificationPreference.DoesNotExist:
            pass
        
        logger.info(f"Phone number removed for user {user.email}")
        
        return Response({
            'message': 'Phone number removed successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error removing phone number: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

