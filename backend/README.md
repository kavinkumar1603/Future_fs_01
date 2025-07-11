# Portfolio Backend Server

## 🚀 Professional Node.js Backend for Portfolio Website

A robust, production-ready backend server for handling contact form submissions with email notifications and MongoDB storage.

### ✨ Features

- **📧 Email Integration**: Automatic email notifications using Gmail SMTP
- **🗄️ MongoDB Storage**: Secure contact form data storage with MongoDB Atlas
- **🛡️ Security**: Rate limiting, input validation, CORS protection, Helmet security
- **📊 Analytics**: Contact statistics and admin dashboard endpoints
- **🔄 Auto-Reply**: Professional auto-reply emails to form submissions
- **⚡ Performance**: Optimized with connection pooling and error handling
- **📱 CORS**: Ready for frontend integration

### 🏗️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Nodemailer** - Email service
- **Gmail SMTP** - Email delivery
- **Helmet** - Security middleware
- **Morgan** - Logging

### 📦 Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### 🔧 Configuration

The server is pre-configured with your credentials:

- **Email**: kavin88701@gmail.com ✅
- **MongoDB**: Atlas cluster connection ✅
- **Port**: 5000 (configurable)

### 🌐 API Endpoints

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/health`        | Server health check      |
| POST   | `/api/contact`       | Submit contact form      |
| GET    | `/api/contacts`      | Get all contacts (admin) |
| GET    | `/api/contact-stats` | Contact statistics       |

### 📨 Contact Form Usage

```javascript
// Frontend integration example
const response = await fetch("http://localhost:5000/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    subject: "Project Inquiry",
    message: "Hello, I would like to discuss a project...",
  }),
});

const result = await response.json();
```

### 🔒 Security Features

- **Rate Limiting**: 5 requests per 15 minutes per IP
- **Input Validation**: Sanitized and validated inputs
- **CORS Protection**: Configured for frontend domains
- **Helmet Security**: Security headers
- **Email Validation**: Regex-based email verification
- **Error Handling**: Comprehensive error management

### 📧 Email Features

**Notification Email (to you):**

- Professional HTML template
- Contact details and message
- IP address and timestamp
- Reference ID for tracking

**Auto-Reply Email (to sender):**

- Thank you message
- Response time expectation
- Social media links
- Professional signature

### 📊 Admin Features

- **Contact List**: View all form submissions
- **Statistics**: Daily activity and status tracking
- **Pagination**: Efficient data loading
- **Search**: Find specific contacts

### 🚀 Deployment Ready

- **Environment Variables**: Configured for different environments
- **Error Handling**: Production-ready error responses
- **Logging**: Morgan HTTP request logging
- **Health Checks**: Monitor server status
- **Graceful Shutdown**: Clean database connections

### 🔄 Database Schema

```javascript
{
  name: String (required, max 100 chars),
  email: String (required, validated),
  subject: String (required, max 200 chars),
  message: String (required, max 2000 chars),
  ipAddress: String,
  userAgent: String,
  submittedAt: Date,
  emailSent: Boolean,
  status: Enum ['pending', 'sent', 'failed']
}
```

### 🎯 Success Response

```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "data": {
    "submissionId": "507f1f77bcf86cd799439011",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "emailSent": true,
    "databaseSaved": true
  }
}
```

### 🛠️ Development

```bash
# Install nodemon for development
npm install -g nodemon

# Start with auto-reload
npm run dev
```

### 📝 Environment Variables

All sensitive data is stored in `.env`:

```env
PORT=5000
EMAIL_USER=kavin88701@gmail.com
EMAIL_PASS=lmqfvnhdpbodypiu
MONGODB_URI=mongodb+srv://...
```

### 🌟 Features in Action

1. **Contact Form Submission** → Server receives data
2. **Validation & Sanitization** → Clean and validate inputs
3. **Database Storage** → Save to MongoDB Atlas
4. **Email Notification** → Send to kavin88701@gmail.com
5. **Auto-Reply** → Send confirmation to user
6. **Success Response** → Confirm to frontend

### 🔧 Troubleshooting

**MongoDB Connection Issues:**

- Check IP whitelist in MongoDB Atlas
- Verify connection string
- Check network connectivity

**Email Issues:**

- Verify Gmail App Password
- Check SMTP settings
- Review firewall settings

**Rate Limiting:**

- Default: 5 requests per 15 minutes
- Adjustable in configuration

---

**🎉 Your backend is production-ready and fully configured!**

Start the server and test your contact form integration.
