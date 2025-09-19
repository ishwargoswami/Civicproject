# 🔗 Frontend-Backend Connection Guide

## ✅ **What's Already Done**

1. **✅ Django Backend**: Fully functional with API endpoints
2. **✅ Authentication API**: Real login/register endpoints at `/auth/`
3. **✅ Issues API**: Complete CRUD operations at `/issues/`
4. **✅ Frontend Updated**: Using real API calls instead of mock data
5. **✅ Redux Store**: Connected to real backend

## 🚀 **Quick Setup**

### 1. **Create Environment File**
Create a `.env` file in your project root with:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. **Start Both Servers**

**Backend** (in one terminal):
```bash
cd backend
python manage.py runserver
```

**Frontend** (in another terminal):
```bash
npm run dev
```

## 🎯 **Test the Real Connection**

1. **Visit**: `http://localhost:5173`
2. **Click**: "Get Involved" → Goes to Dashboard
3. **Try Login**: Any email/password will attempt real authentication
4. **Create Account**: Register with real data
5. **Report Issue**: Create real issues that save to database

## 🔐 **Test Users Available**

- **Admin**: `admin@example.com` / `admin123`
- **You can create new users** through the registration form

## 📊 **Real Data Flow**

- **Registration**: Creates real user in Django database
- **Login**: Gets JWT token from Django
- **Issues**: Real CRUD operations with Django backend
- **Dashboard**: Shows real data from your database

## 🎉 **You're Ready!**

Your frontend is now connected to the real Django backend. You can:
- Register real users
- Login with real authentication
- Create real issues
- View real data in the admin panel at `http://localhost:8000/admin/`

**No more mock data - everything is real!** 🚀
