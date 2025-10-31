# WhatsApp Notifications - Quick Start Guide ⚡

Get WhatsApp notifications running in 5 minutes!

## 📦 Step 1: Install Dependencies (1 min)

```bash
cd backend
pip install twilio==9.0.4
```

## 🔑 Step 2: Get Twilio Credentials (2 min)

1. Sign up: https://www.twilio.com/try-twilio
2. Copy from Console:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click eye icon to reveal)
3. WhatsApp Sandbox: 
   - Go to Messaging → Try it out → WhatsApp
   - Note the sandbox number: `+1 415 523 8886`

## ⚙️ Step 3: Configure (30 sec)

Add to `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## 🗄️ Step 4: Database Setup (30 sec)

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## 🚀 Step 5: Start Everything (30 sec)

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
npm run dev
```

## 📱 Step 6: Test It! (1 min)

### A. Join WhatsApp Sandbox
Send this message to `+1 415 523 8886` on WhatsApp:
```
join correct-president
```
(Your code will be different - check Twilio Console)

### B. Add Your Phone
1. Go to: http://localhost:5173
2. Login → Settings → Profile Settings
3. Phone: `+1234567890` (with your number)
4. Save

### C. Verify WhatsApp
1. Settings → Notification Preferences
2. Click "Send Verification Code"
3. Check WhatsApp for 6-digit code
4. Enter code → Verify
5. ✅ See green "Verified" badge!

### D. Test Event Notification
1. Change your role to 'official' in Django admin:
   ```bash
   python manage.py shell
   ```
   ```python
   from accounts.models import User
   user = User.objects.get(email='your@email.com')
   user.role = 'official'
   user.save()
   ```
2. Create an event in the platform
3. 🎉 **You get a WhatsApp notification!**

## ✅ Success Checklist

- [ ] Twilio account created
- [ ] Joined WhatsApp sandbox
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Phone verified
- [ ] Received test notification

## 🆘 Quick Troubleshooting

**Not receiving WhatsApp?**
→ Did you join the sandbox? Send "join [code]" first

**"Service not configured" error?**
→ Check `.env` file and restart Django server

**"Invalid phone number"?**
→ Must include `+` and country code: `+1234567890`

**Verification code expired?**
→ Codes expire in 10 minutes, request a new one

## 📚 Full Documentation

- **Setup Guide**: `WHATSAPP_SETUP_GUIDE.md`
- **Implementation Details**: `WHATSAPP_IMPLEMENTATION_SUMMARY.md`
- **Migration Notes**: `backend/MIGRATION_NOTES.md`

## 🎯 What You Get

✅ Automatic WhatsApp notifications to citizens when officials create events
✅ Secure phone verification via OTP
✅ Customizable notification preferences
✅ Quiet hours support
✅ Beautiful verification UI
✅ Complete error handling

**Happy notifying!** 🚀📱

---

**Need Help?**
- Check Twilio Console logs
- Review `backend/logs/django.log`
- See full setup guide for detailed troubleshooting

