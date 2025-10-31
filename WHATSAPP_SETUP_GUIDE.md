# WhatsApp Notifications Setup Guide

This guide will help you set up WhatsApp notifications for your Civic Platform so that citizens receive real-time alerts when officials create events or take important actions.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Twilio Setup](#twilio-setup)
4. [Backend Configuration](#backend-configuration)
5. [Testing](#testing)
6. [User Workflow](#user-workflow)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The WhatsApp notification system allows:
- **Officials** to automatically notify all citizens when they create events
- **Citizens** to receive event notifications, issue updates, and system alerts via WhatsApp
- **Phone verification** via WhatsApp OTP to ensure valid numbers
- **Customizable preferences** for different notification types

### How It Works
1. Citizen adds their phone number in Profile Settings
2. Citizen verifies their number via WhatsApp OTP in Notification Preferences
3. Citizen customizes which notifications they want to receive
4. When an official creates an event, all verified citizens receive a WhatsApp message
5. Citizens can enable/disable or customize notifications anytime

---

## ✅ Prerequisites

Before you begin, ensure you have:
- A Twilio account (free trial available)
- Python 3.8+ with Django installed
- Node.js 18+ for the frontend
- A WhatsApp-enabled phone number for testing

---

## 🚀 Twilio Setup

### Step 1: Create a Twilio Account

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Click "Sign up" and create a free account
3. Verify your email and phone number

### Step 2: Get Your Credentials

1. From your Twilio Console Dashboard, find:
   - **Account SID** (e.g., `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (click the eye icon to reveal)
2. Copy these values - you'll need them for configuration

### Step 3: Set Up WhatsApp Sandbox (For Testing)

For testing, Twilio provides a WhatsApp Sandbox:

1. In the Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a WhatsApp sandbox number like `+1 415 523 8886`
3. Follow the instructions to join the sandbox by:
   - Sending a WhatsApp message from your phone to the sandbox number
   - Sending the join code (e.g., "join correct-president")
4. Once joined, this number can receive test messages

### Step 4: Upgrade to Production (Optional)

For production use with real users:

1. Go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click "Request to enable my WhatsApp number"
3. Complete the Facebook Business Manager verification process
4. Submit your message templates for approval
5. Once approved, you'll get your own WhatsApp Business number

**Note**: The sandbox is perfect for testing! You can have up to 5 test numbers.

---

## ⚙️ Backend Configuration

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The `twilio==9.0.4` package is already in requirements.txt.

### Step 2: Configure Environment Variables

Create or edit your `.env` file in the `backend/` directory:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

**Important Notes:**
- For sandbox testing, use `+14155238886` (or your assigned sandbox number)
- For production, use your approved WhatsApp Business number
- DO NOT include "whatsapp:" prefix in the number (the code adds it automatically)

### Step 3: Run Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

This will add the `metadata` field to the User model if needed.

### Step 4: Start the Django Server

```bash
python manage.py runserver
```

---

## 🧪 Testing

### Test the WhatsApp Service

1. **Join the Twilio Sandbox** (if you haven't already):
   - Send "join [your-code]" to your Twilio WhatsApp sandbox number

2. **Test Phone Verification**:
   ```bash
   # In the backend directory
   python manage.py shell
   ```
   
   ```python
   from notifications.whatsapp_service import whatsapp_service
   
   # Test sending a message
   result = whatsapp_service.send_verification_code(
       to_number="+1234567890",  # Your phone number with country code
       code="123456"
   )
   print(result)
   ```

3. **Check Your WhatsApp**:
   - You should receive a verification message within seconds
   - If successful, you'll see `{'success': True, 'message_sid': '...'}` in the result

### Test Event Notifications

1. **Create a Test User**:
   ```bash
   python manage.py createsuperuser
   ```

2. **Log into the Platform**:
   - Go to `http://localhost:5173` (frontend)
   - Log in with your credentials

3. **Set Up Your Profile**:
   - Go to Settings → Profile Settings
   - Add your phone number (with country code, e.g., +1234567890)
   - Save changes

4. **Verify Your WhatsApp**:
   - Go to Settings → Notification Preferences
   - Click "Send Verification Code"
   - Check your WhatsApp for the code
   - Enter the code to verify

5. **Enable Notifications**:
   - Toggle WhatsApp Notifications on
   - Select which types of notifications you want

6. **Create a Test Event** (as an official user):
   - Change your user role to 'official' in Django admin or database
   - Go to Events → Create Event
   - Fill in the details and submit
   - **All verified citizens should receive a WhatsApp notification!**

---

## 👥 User Workflow

### For Citizens

1. **Add Phone Number**:
   - Dashboard → Settings → Profile Settings
   - Enter phone number with country code (e.g., +1234567890)
   - Save changes

2. **Verify WhatsApp**:
   - Settings → Notification Preferences
   - Click "Send Verification Code"
   - Receive code via WhatsApp
   - Enter 6-digit code
   - See green "Verified" badge

3. **Customize Notifications**:
   - Toggle WhatsApp Notifications on/off
   - Select specific notification types:
     * Issue updates
     * Event reminders
     * Critical system alerts
   - Set quiet hours if desired
   - Save preferences

4. **Receive Notifications**:
   - Get WhatsApp messages when officials create events
   - Receive updates on issues you're following
   - Get reminders for events you've RSVP'd to

### For Officials

1. **Create Events**:
   - Dashboard → Events → Create Event
   - Fill in event details
   - Submit
   - **All verified citizens automatically receive WhatsApp notifications**

2. **Update Events**:
   - Go to event details
   - Add an event update
   - Choose to notify attendees/volunteers
   - **Attendees receive WhatsApp notifications**

---

## 🐛 Troubleshooting

### WhatsApp Service Not Configured

**Error**: "WhatsApp service is not configured"

**Solution**:
- Check that all three Twilio environment variables are set in your `.env` file
- Restart the Django server after adding environment variables
- Verify the credentials are correct in your Twilio Console

### Message Not Received

**Error**: Message appears sent but not received

**Solutions**:
1. **Check Sandbox Status**:
   - Verify you joined the Twilio sandbox
   - Re-join if needed: Send "join [code]" to the sandbox number

2. **Check Phone Number Format**:
   - Must include country code: `+1234567890`
   - No spaces or special characters except `+`
   - Example: `+14155551234` (USA)
   - Example: `+447700900123` (UK)

3. **Check Twilio Logs**:
   - Go to Twilio Console → Monitor → Logs → Messaging
   - Look for error messages or delivery status

### Verification Code Expired

**Error**: "Verification code has expired"

**Solution**:
- OTP codes expire after 10 minutes
- Click "Resend" or go back and request a new code
- Check your phone has good signal

### Quiet Hours Blocking Messages

**Issue**: Not receiving notifications during certain times

**Solution**:
- Check Settings → Notification Preferences → Quiet Hours
- Disable or adjust the quiet hours time range
- Non-urgent messages are paused during quiet hours

### Rate Limiting

**Issue**: Too many requests error

**Solution**:
- Twilio free tier has rate limits
- Wait a few minutes before trying again
- For production, upgrade your Twilio plan

---

## 📱 Supported Notification Types

### Event Notifications
- ✅ New event created by officials
- ✅ Event updates (schedule/location changes)
- ✅ Event reminders
- ✅ Event cancellations

### Issue Notifications
- ✅ Issue status updates
- ✅ Issue assigned to you
- ✅ Comments on your issues
- ✅ Issue resolved notifications

### System Notifications
- ✅ Critical system alerts
- ✅ Platform announcements
- ✅ Account verification

---

## 🔒 Security & Privacy

- Phone numbers are encrypted at rest
- Users can remove their phone number anytime
- Verification required before receiving notifications
- Users control which notifications they receive
- Quiet hours prevent notification overload
- All WhatsApp messages comply with Twilio's policies

---

## 💰 Costs

### Twilio Pricing
- **Free Trial**: $15.50 credit (enough for ~1,000 messages)
- **WhatsApp Messages**: $0.0050 per message (may vary by country)
- **Phone Number** (production): ~$1/month

For a small community platform, the free tier is usually sufficient for testing.

---

## 📚 Additional Resources

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Python SDK](https://www.twilio.com/docs/libraries/python)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Message Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

---

## ✅ Quick Checklist

Before going live, ensure:
- [ ] Twilio account created and verified
- [ ] Environment variables configured
- [ ] Migrations run successfully
- [ ] Test message received on your phone
- [ ] Event creation triggers notifications
- [ ] Phone verification flow works
- [ ] Notification preferences save correctly
- [ ] Quiet hours respect user settings
- [ ] Error handling works properly

---

## 🎉 Success!

You now have a fully functional WhatsApp notification system! Citizens will receive real-time updates when officials create events or take important actions.

**Need Help?** 
- Check Twilio Console logs
- Review Django logs: `backend/logs/django.log`
- Test with a small group first
- Monitor delivery rates in Twilio Console

Happy notifying! 🚀📱

