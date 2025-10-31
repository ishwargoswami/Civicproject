"""
Quick diagnostic check for WhatsApp setup
"""
import os
import sys
import django

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from notifications.whatsapp_service import whatsapp_service
from accounts.models import User
from accounts.notification_models import NotificationPreference
from django.db.models.signals import post_save
from events.models import Event

print("\n" + "=" * 70)
print(" WhatsApp Notification System - Diagnostic Check")
print("=" * 70)

# 1. Check Twilio Configuration
print("\n[1] Twilio Configuration")
print("-" * 70)
if whatsapp_service.is_configured:
    print("[OK] Twilio service is configured")
    print(f"    Sandbox Number: {whatsapp_service.whatsapp_number}")
else:
    print("[ERROR] Twilio service NOT configured")
    print("    Action: Check .env file has TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,")
    print("            and TWILIO_WHATSAPP_NUMBER variables")

# 2. Check User Roles
print("\n[2] User Roles")
print("-" * 70)
citizens = User.objects.filter(role='citizen', is_active=True)
officials = User.objects.filter(role='official', is_active=True)

print(f"Active Citizens: {citizens.count()}")
print(f"Active Officials: {officials.count()}")

if officials.count() == 0:
    print("[WARNING] No officials found!")
    print("    Action: Create an official user or change a user's role to 'official'")

# 3. Check Citizens with Phone Numbers
print("\n[3] Citizens - Phone Numbers")
print("-" * 70)
citizens_with_phone = citizens.exclude(phone_number__isnull=True).exclude(phone_number='')
print(f"Citizens with phone numbers: {citizens_with_phone.count()}/{citizens.count()}")

if citizens_with_phone.count() > 0:
    print("\nPhone numbers:")
    for citizen in citizens_with_phone[:5]:  # Show first 5
        print(f"    - {citizen.email}: {citizen.phone_number}")
else:
    print("[WARNING] No citizens have added phone numbers")
    print("    Action: Citizens need to add phone in Profile Settings")

# 4. Check WhatsApp Verification Status
print("\n[4] WhatsApp Verification Status")
print("-" * 70)
verified_citizens = NotificationPreference.objects.filter(
    user__role='citizen',
    user__is_active=True,
    whatsapp_verified=True
)
print(f"Citizens with verified WhatsApp: {verified_citizens.count()}/{citizens.count()}")

if verified_citizens.count() > 0:
    print("\nVerified users:")
    for pref in verified_citizens[:5]:
        print(f"    - {pref.user.email}: {pref.user.phone_number}")
else:
    print("[WARNING] No citizens have verified their WhatsApp numbers")
    print("    Action: Citizens need to:")
    print("      1. Go to Settings > Notification Preferences")
    print("      2. Click 'Send Verification Code'")
    print("      3. Enter the 6-digit code from WhatsApp")

# 5. Check WhatsApp Notifications Enabled
print("\n[5] WhatsApp Notifications Enabled")
print("-" * 70)
enabled_citizens = NotificationPreference.objects.filter(
    user__role='citizen',
    user__is_active=True,
    whatsapp_enabled=True,
    whatsapp_verified=True
)
print(f"Citizens with WhatsApp notifications ON: {enabled_citizens.count()}/{citizens.count()}")

if enabled_citizens.count() > 0:
    print("\nUsers ready to receive notifications:")
    for pref in enabled_citizens[:5]:
        print(f"    - {pref.user.email}: Events={pref.whatsapp_event_reminders}")
else:
    print("[WARNING] No citizens will receive WhatsApp notifications")
    print("    Action: After verification, citizens need to toggle WhatsApp ON")

# 6. Check Django Signals
print("\n[6] Django Signals for Event Creation")
print("-" * 70)
try:
    receivers = post_save._live_receivers(Event)
    if len(receivers) > 0:
        print(f"[OK] Event creation signals registered ({len(receivers)} receiver(s))")
    else:
        print("[ERROR] No signals registered!")
        print("    Action: Restart Django server")
except Exception as e:
    print(f"[ERROR] Could not check signals: {e}")

# Summary
print("\n" + "=" * 70)
print(" SUMMARY")
print("=" * 70)

issues = []
if not whatsapp_service.is_configured:
    issues.append("Twilio not configured")
if officials.count() == 0:
    issues.append("No officials exist")
if citizens_with_phone.count() == 0:
    issues.append("No citizens have phone numbers")
if verified_citizens.count() == 0:
    issues.append("No citizens have verified WhatsApp")
if enabled_citizens.count() == 0:
    issues.append("No citizens have WhatsApp notifications enabled")

if len(issues) == 0:
    print("[SUCCESS] System is ready!")
    print("\nTo test:")
    print("1. Make sure you've joined the Twilio WhatsApp sandbox")
    print("   (Send 'join [code]' to +14155238886 on WhatsApp)")
    print("2. Login as an official")
    print("3. Create a new event")
    print("4. Citizens should receive WhatsApp notifications!")
else:
    print(f"[ISSUES FOUND] {len(issues)} issue(s) need attention:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
    
    print("\n[MOST COMMON ISSUE]")
    print("  Have you joined the Twilio WhatsApp Sandbox?")
    print("  1. Open WhatsApp on your phone")
    print("  2. Send a message to: +1 415 523 8886")
    print("  3. Message content: join [your-sandbox-code]")
    print("  4. You should get a confirmation message")
    print("  5. Then verify your phone on the platform")

print("\n" + "=" * 70)
print()

