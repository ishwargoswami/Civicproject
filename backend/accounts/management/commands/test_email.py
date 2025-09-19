from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import OTPVerification
from accounts.serializers import OTPVerificationSerializer


class Command(BaseCommand):
    help = 'Test email functionality by sending an OTP'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test OTP to',
            required=True
        )

    def handle(self, *args, **options):
        email = options['email']
        
        self.stdout.write(
            self.style.SUCCESS(f'Testing email functionality...')
        )
        
        # Print current email settings
        self.stdout.write(f"EMAIL_HOST: {settings.EMAIL_HOST}")
        self.stdout.write(f"EMAIL_PORT: {settings.EMAIL_PORT}")
        self.stdout.write(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        self.stdout.write(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        self.stdout.write(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        
        try:
            # Test basic email sending
            self.stdout.write("Testing basic email sending...")
            send_mail(
                subject='Test Email - Civic Platform',
                message='This is a test email to verify SMTP configuration.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            self.stdout.write(
                self.style.SUCCESS('✅ Basic email sent successfully!')
            )
            
            # Test OTP email sending
            self.stdout.write("Testing OTP email sending...")
            serializer = OTPVerificationSerializer(data={
                'email': email,
                'purpose': 'registration'
            })
            
            if serializer.is_valid():
                otp = serializer.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ OTP email sent successfully!')
                )
                self.stdout.write(f"OTP Code: {otp.otp_code}")
                self.stdout.write(f"Expires at: {otp.expires_at}")
            else:
                self.stdout.write(
                    self.style.ERROR(f'❌ OTP creation failed: {serializer.errors}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Email sending failed: {str(e)}')
            )
            self.stdout.write(
                self.style.WARNING('Check your email configuration in .env file')
            )
