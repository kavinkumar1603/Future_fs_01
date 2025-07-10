# Portfolio Backend Server Setup Guide

## 🎯 Current Status: ✅ WORKING!

Your backend server is now successfully running! Here's what you need to know:

## 📋 Quick Start

### 1. Start the Server
```bash
cd server
node "C:\VS CODE\Future_fs_1\portfolio\server\server.js"
```

### 2. Server Endpoints
- **Health Check**: http://localhost:5000/api/health
- **Contact Form**: http://localhost:5000/api/contact (POST)
- **View Contacts**: http://localhost:5000/api/contacts (GET)

## 🔧 Configuration Required

### Gmail App Password Setup
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for Gmail
4. Update `.env` file:
```env
EMAIL_PASS=your-actual-16-character-app-password
```

## 🗄️ Database

- **MongoDB**: Connected to your Atlas cluster
- **Database Name**: portfolio
- **Collection**: contacts

## 📧 Email Features

✅ **Automatic Email Notifications**: Sends emails to kavin88701@gmail.com
✅ **Auto-Reply**: Sends confirmation email to sender
✅ **Database Storage**: All messages saved to MongoDB
✅ **Rate Limiting**: Prevents spam (5 requests per 15 minutes)

## 🔒 Security Features

- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Email format validation
- ✅ IP address logging

## 🚀 Testing the Contact Form

### Test with PowerShell/Curl:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/contact" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name":"Test User","email":"test@example.com","subject":"Test Message","message":"This is a test message from the contact form."}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Message sent successfully! Thank you for reaching out.",
  "submissionId": "507f1f77bcf86cd799439011"
}
```

## 📱 Frontend Integration

Update your Contact component to send POST requests to:
```
http://localhost:5000/api/contact
```

## 🎉 What Happens When Someone Contacts You:

1. **Form Submission** → Saved to MongoDB
2. **Email to You** → Notification at kavin88701@gmail.com
3. **Auto-Reply** → Confirmation sent to sender
4. **Database Record** → Permanent storage with unique ID

## 🛠️ Troubleshooting

### If emails aren't sending:
- Check Gmail App Password in `.env`
- Verify EMAIL_USER is set to kavin88701@gmail.com

### If MongoDB isn't connecting:
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

## 📊 Admin Panel

Visit http://localhost:5000/api/contacts to see all submissions (for admin use).

---
**Server Status**: ✅ Running on Port 5000
**Database**: ✅ MongoDB Atlas Connected  
**Email Service**: ⚠️ Needs Gmail App Password
