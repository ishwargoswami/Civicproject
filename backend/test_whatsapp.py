"""
Test script to verify WhatsApp notification setup
Run this with: python test_whatsapp.py
"""
import os
import sys
import django

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from notifications.whatsapp_service import whatsapp_service
from decouple import config

print("=" * 60)
print("WhatsApp Service Configuration Check")
print("=" * 60)

# Check if service is configured
print(f"\n1. Service Configured: {whatsapp_service.is_configured}")

if whatsapp_service.is_configured:
    print(f"   [OK] Twilio credentials are loaded")
    
    # Show masked credentials (for security)
    account_sid = config('TWILIO_ACCOUNT_SID', default='')
    if account_sid:
        print(f"   Account SID: {account_sid[:5]}...{account_sid[-5:]}")
    
    whatsapp_number = config('TWILIO_WHATSAPP_NUMBER', default='')
    if whatsapp_number:
        print(f"   WhatsApp Number: {whatsapp_number}")
else:
    print("   [ERROR] Twilio credentials NOT configured")
    print("\n   Missing environment variables:")
    
    account_sid = config('TWILIO_ACCOUNT_SID', default='')
    auth_token = config('TWILIO_AUTH_TOKEN', default='')
    whatsapp_number = config('TWILIO_WHATSAPP_NUMBER', default='')
    
    if not account_sid:
        print("   - TWILIO_ACCOUNT_SID")
    if not auth_token:
        print("   - TWILIO_AUTH_TOKEN")
    if not whatsapp_number:
        print("   - TWILIO_WHATSAPP_NUMBER")
    
    print("\n   Please add these to your .env file in the backend directory")

# Test sending a message (if configured)
print("\n" + "=" * 60)
print("2. Test Sending WhatsApp Message")
print("=" * 60)

if whatsapp_service.is_configured:
    phone = input("\nEnter your phone number (with country code, e.g., +919725032474): ").strip()
    
    if phone:
        print(f"\nSending test message to {phone}...")
        
        result = whatsapp_service.send_verification_code(phone, "123456")
        
        if result['success']:
            print(f"[SUCCESS] Message sent successfully!")
            print(f"   Message SID: {result['message_sid']}")
            print(f"\n[INFO] Check your WhatsApp for the verification code!")
        else:
            print(f"[ERROR] Failed to send message")
            print(f"   Error: {result.get('error')}")
            
            if 'error_code' in result:
                print(f"   Error Code: {result['error_code']}")
            
            print("\n[TIP] Common issues:")
            print("   1. Have you joined the Twilio WhatsApp sandbox?")
            print("      Send 'join [your-code]' to the sandbox number")
            print("   2. Is your phone number correct? (must include +)")
            print("   3. Check Twilio Console for detailed logs")
    else:
        print("[WARNING] No phone number entered, skipping test")
else:
    print("[WARNING] Cannot test - service not configured")

# Check user setup
print("\n" + "=" * 60)
print("3. Checking User Setup")
print("=" * 60)

from accounts.models import User
from accounts.notification_models import NotificationPreference

# Count users by role
citizens = User.objects.filter(role='citizen', is_active=True).count()
officials = User.objects.filter(role='official', is_active=True).count()

print(f"\nTotal active citizens: {citizens}")
print(f"Total active officials: {officials}")

# Check citizens with WhatsApp enabled
citizens_with_whatsapp = NotificationPreference.objects.filter(
    user__role='citizen',
    user__is_active=True,
    whatsapp_enabled=True,
    whatsapp_verified=True
).count()

citizens_with_phone = User.objects.filter(
    role='citizen',
    is_active=True,
    phone_number__isnull=False
).exclude(phone_number='').count()

print(f"\nCitizens with phone numbers: {citizens_with_phone}")
print(f"Citizens with WhatsApp verified & enabled: {citizens_with_whatsapp}")

if citizens_with_whatsapp == 0:
    print("\n[WARNING] No citizens have WhatsApp notifications enabled!")
    print("   Citizens need to:")
    print("   1. Add phone number in Profile Settings")
    print("   2. Verify via WhatsApp OTP in Notification Preferences")
    print("   3. Enable WhatsApp notifications")

# Check if signals are registered
print("\n" + "=" * 60)
print("4. Checking Django Signals")
print("=" * 60)

try:
    from django.db.models.signals import post_save
    from events.models import Event
    
    # Get all receivers for Event post_save signal
    receivers = post_save._live_receivers(Event)
    
    if receivers:
        print(f"[OK] Event creation signals registered: {len(receivers)} receiver(s)")
    else:
        print("[ERROR] No signals registered for Event creation!")
        print("   Check if events app is properly configured in INSTALLED_APPS")
except Exception as e:
    print(f"[ERROR] Error checking signals: {e}")

print("\n" + "=" * 60)
print("Setup Check Complete!")
print("=" * 60)
print("\n[NEXT STEPS]")
print("1. If service is configured, test sending a message above")
print("2. Ensure citizens have verified their WhatsApp numbers")
print("3. Create a test event as an official to trigger notifications")
print("4. Check backend/logs/django.log for detailed error messages")
print("\n")

