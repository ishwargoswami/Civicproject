from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile, UserActivity, OTPVerification
from .notification_models import NotificationPreference
from django.core.mail import send_mail
from django.conf import settings


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password', 
            'password_confirm', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user with basic fields only
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'citizen')
        )
        user.set_password(password)
        user.save()
        
        # Create user profile
        try:
            UserProfile.objects.create(user=user)
        except:
            pass  # Profile creation is optional
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Use email for authentication
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    full_name = serializers.ReadOnlyField()
    is_citizen = serializers.ReadOnlyField()
    is_official = serializers.ReadOnlyField()
    is_platform_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'avatar', 'phone_number', 'address', 'bio', 'department_name',
            'position', 'is_verified', 'email_notifications', 'sms_notifications',
            'is_citizen', 'is_official', 'is_platform_admin', 'date_joined',
            'last_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'date_joined', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'avatar', 'phone_number', 'address', 
            'bio', 'email_notifications', 'sms_notifications'
        ]
    
    def validate_avatar(self, value):
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Avatar file size cannot exceed 5MB.")
            
            # Check file type
            if not value.content_type.startswith('image/'):
                raise serializers.ValidationError("Avatar must be an image file.")
        
        return value


class ExtendedUserProfileSerializer(serializers.ModelSerializer):
    """Serializer for extended user profile information"""
    
    class Meta:
        model = UserProfile
        fields = [
            'website', 'twitter', 'linkedin', 'github', 'timezone', 'language',
            'theme', 'issues_reported', 'issues_resolved', 'forum_posts',
            'events_attended', 'community_score', 'show_email', 'show_phone',
            'show_address'
        ]
        read_only_fields = [
            'issues_reported', 'issues_resolved', 'forum_posts', 
            'events_attended', 'community_score'
        ]


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activity"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_name', 'activity_type', 'description', 
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user information (limited fields)"""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'avatar', 'role', 'is_verified', 'date_joined']


class OTPVerificationSerializer(serializers.ModelSerializer):
    """Serializer for OTP verification"""
    
    class Meta:
        model = OTPVerification
        fields = ['email', 'purpose']
    
    def create(self, validated_data):
        # Invalidate any existing OTPs for this email and purpose
        OTPVerification.objects.filter(
            email=validated_data['email'],
            purpose=validated_data['purpose'],
            is_verified=False
        ).delete()
        
        # Create new OTP
        otp = OTPVerification.objects.create(**validated_data)
        
        # Send OTP via email (simple console output for now)
        self.send_otp_email(otp)
        
        return otp
    
    def send_otp_email(self, otp):
        """Send OTP via email"""
        subject = f"🔐 Your Security Code for {otp.purpose.title()} - Civic Platform"
        
        # Create a professional HTML email template
        html_message = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification - Civic Platform</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ Civic Platform</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Secure Verification Code</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin-top: 0;">Verification Required</h2>
                <p>Hello,</p>
                <p>You requested a verification code for <strong>{otp.purpose}</strong> on our platform. Please use the code below to proceed:</p>
                
                <div style="background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                    <h3 style="color: #3b82f6; margin: 0 0 10px 0;">Your Verification Code</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        {otp.otp_code}
                    </div>
                </div>
                
                <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;"><strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for your security.</p>
                </div>
                
                <p><strong>Security Notice:</strong></p>
                <ul style="color: #64748b;">
                    <li>Never share this code with anyone</li>
                    <li>Our team will never ask for this code</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Best regards,<br>
                    <strong>The Civic Platform Team</strong><br>
                    Building stronger communities together
                </p>
            </div>
        </body>
        </html>
        '''
        
        # Plain text version for email clients that don't support HTML
        text_message = f'''
        Hello,
        
        You requested a verification code for {otp.purpose} on Civic Platform.
        
        Your verification code is: {otp.otp_code}
        
        This code will expire in 10 minutes for your security.
        
        Security Notice:
        - Never share this code with anyone
        - Our team will never ask for this code  
        - If you didn't request this, please ignore this email
        
        Best regards,
        The Civic Platform Team
        Building stronger communities together
        '''
        
        # For development, also print to console
        print(f"📧 OTP Email sent to {otp.email}: {otp.otp_code}")
        
        try:
            # Send the actual email
            from django.core.mail import send_mail
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[otp.email],
                fail_silently=False,
                html_message=html_message
            )
            print(f"✅ Email successfully sent to {otp.email}")
        except Exception as e:
            print(f"❌ Failed to send email to {otp.email}: {str(e)}")
            # Don't raise the exception to prevent OTP creation failure
            # The OTP is still created and can be used for development


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    purpose = serializers.CharField(max_length=20)
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        purpose = attrs.get('purpose')
        
        try:
            otp = OTPVerification.objects.get(
                email=email,
                otp_code=otp_code,
                purpose=purpose,
                is_verified=False
            )
            
            if otp.is_expired():
                raise serializers.ValidationError("OTP has expired.")
            
            attrs['otp_instance'] = otp
            return attrs
            
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP code.")
    
    def save(self):
        otp = self.validated_data['otp_instance']
        return otp.verify()


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'email_issue_updates', 'email_event_reminders',
            'email_forum_replies', 'email_system_updates', 'email_weekly_digest',
            'whatsapp_enabled', 'whatsapp_verified', 'whatsapp_issue_updates',
            'whatsapp_event_reminders', 'whatsapp_system_alerts',
            'push_enabled', 'push_issue_updates', 'push_event_reminders',
            'push_forum_replies', 'sms_enabled', 'sms_critical_only',
            'digest_frequency', 'quiet_hours_enabled', 'quiet_hours_start',
            'quiet_hours_end', 'created_at', 'updated_at'
        ]
        read_only_fields = ['whatsapp_verified', 'created_at', 'updated_at']
