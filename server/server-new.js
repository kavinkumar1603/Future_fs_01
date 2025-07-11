const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://kavin88701:LNYGENaMCfDhXmxD@cluster0.dfpaodr.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin';

let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  isMongoConnected = true;
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
  console.log('⚠️  Server will continue without MongoDB (emails will still work)');
  isMongoConnected = false;
});

// Contact Schema for MongoDB
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  ipAddress: String,
  userAgent: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date
});

const Contact = mongoose.model('Contact', contactSchema);

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions',
    details: 'Please wait 15 minutes before submitting another message.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email Configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'kavin88701@gmail.com',
      pass: 'lmqfvnhdpbodypiu', // Your Gmail App Password
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  });
};

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running perfectly! 🚀',
    timestamp: new Date().toISOString(),
    mongodb: isMongoConnected ? 'Connected ✅' : 'Disconnected ⚠️',
    emailService: 'Ready ✅',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Contact Form Endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`📨 New contact form submission from ${email} - ${subject}`);

    // Input Validation
    const validationErrors = [];
    
    if (!name || name.trim().length === 0) {
      validationErrors.push('Name is required');
    } else if (name.trim().length > 100) {
      validationErrors.push('Name must be less than 100 characters');
    }

    if (!email || email.trim().length === 0) {
      validationErrors.push('Email is required');
    } else if (!isValidEmail(email)) {
      validationErrors.push('Please provide a valid email address');
    }

    if (!subject || subject.trim().length === 0) {
      validationErrors.push('Subject is required');
    } else if (subject.trim().length > 200) {
      validationErrors.push('Subject must be less than 200 characters');
    }

    if (!message || message.trim().length === 0) {
      validationErrors.push('Message is required');
    } else if (message.trim().length > 2000) {
      validationErrors.push('Message must be less than 2000 characters');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Save to MongoDB (if connected)
    let savedContact = null;
    if (isMongoConnected) {
      try {
        const contactSubmission = new Contact({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          ipAddress,
          userAgent,
          emailSent: false
        });

        savedContact = await contactSubmission.save();
        console.log(`💾 Contact saved to database with ID: ${savedContact._id}`);
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
        // Continue without DB save - email is more important
      }
    }

    // Create Email Transporter
    const transporter = createEmailTransporter();

    // Email to you (Portfolio Owner)
    const ownerEmailOptions = {
      from: '"Portfolio Contact Form" <kavin88701@gmail.com>',
      to: 'kavin88701@gmail.com',
      subject: `🔔 New Portfolio Contact: ${subject.trim()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 New Contact Form Submission</h2>
              <p>You've received a new message through your portfolio website!</p>
            </div>
            <div class="content">
              <div class="detail-row">
                <span class="label">Name:</span> ${name.trim()}
              </div>
              <div class="detail-row">
                <span class="label">Email:</span> ${email.trim()}
              </div>
              <div class="detail-row">
                <span class="label">Subject:</span> ${subject.trim()}
              </div>
              ${savedContact ? `<div class="detail-row"><span class="label">Reference ID:</span> ${savedContact._id}</div>` : ''}
              <div class="detail-row">
                <span class="label">IP Address:</span> ${ipAddress}
              </div>
              <div class="detail-row">
                <span class="label">Submitted:</span> ${new Date().toLocaleString()}
              </div>
              
              <div class="message-box">
                <h3>Message:</h3>
                <p>${message.trim().replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your portfolio contact form.</p>
              <p>© ${new Date().getFullYear()} Kavinkumar Portfolio</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email.trim()
    };

    // Auto-reply email to sender
    const autoReplyOptions = {
      from: '"Kavinkumar - Portfolio" <kavin88701@gmail.com>',
      to: email.trim(),
      subject: `✅ Thank you for contacting me, ${name.trim()}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
            .message-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Message Received Successfully!</h2>
              <p>Thank you for reaching out!</p>
            </div>
            <div class="content">
              <p>Hi <strong>${name.trim()}</strong>,</p>
              
              <p>Thank you for your message! I've successfully received your inquiry about "<strong>${subject.trim()}</strong>" and I'll get back to you as soon as possible.</p>
              
              <p>I typically respond within <strong>24 hours</strong>. In the meantime, feel free to:</p>
              <ul>
                <li>Check out my projects on my portfolio</li>
                <li>Connect with me on LinkedIn or GitHub</li>
                <li>Follow my latest work and updates</li>
              </ul>
              
              <div class="message-summary">
                <h3>Your Message Summary:</h3>
                ${savedContact ? `<p><strong>Reference ID:</strong> ${savedContact._id}</p>` : ''}
                <p><strong>Subject:</strong> ${subject.trim()}</p>
                <p><strong>Message:</strong> ${message.trim().length > 100 ? message.trim().substring(0, 100) + '...' : message.trim()}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="signature">
                <p>Best regards,<br>
                <strong>Kavinkumar</strong><br>
                Full Stack Developer<br>
                🌐 Portfolio: <a href="#">Your Portfolio URL</a><br>
                💼 LinkedIn: <a href="https://www.linkedin.com/feed/">Connect with me</a><br>
                🔗 GitHub: <a href="https://github.com/kavinkumar1603">@kavinkumar1603</a></p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated response. Please do not reply directly to this email.</p>
              <p>© ${new Date().getFullYear()} Kavinkumar Portfolio. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send emails
    console.log('📧 Sending emails...');
    const emailPromises = [
      transporter.sendMail(ownerEmailOptions),
      transporter.sendMail(autoReplyOptions)
    ];

    await Promise.all(emailPromises);

    // Update database record if saved
    if (savedContact && isMongoConnected) {
      try {
        await Contact.findByIdAndUpdate(savedContact._id, {
          emailSent: true,
          emailSentAt: new Date()
        });
      } catch (updateError) {
        console.error('Error updating email status:', updateError.message);
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ Emails sent successfully in ${responseTime}ms`);

    // Success Response
    res.status(200).json({
      success: true,
      message: 'Message sent successfully! Thank you for reaching out.',
      details: {
        submissionId: savedContact ? savedContact._id : null,
        databaseSaved: !!savedContact,
        emailSent: true,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    const responseTime = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: 'There was an issue processing your request. Please try again or contact me directly.',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all contacts (Admin endpoint)
app.get('/api/contacts', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      message: 'MongoDB is not connected. Contact data is not available.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Contact.countDocuments();

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: contacts.length,
        totalRecords: total
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/contact',
      'GET /api/contacts'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('\n🚀 Portfolio Backend Server Started Successfully!');
  console.log('=' .repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📧 Email service: kavin88701@gmail.com`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📬 Contact endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/api/contacts`);
  console.log(`💾 MongoDB: ${isMongoConnected ? 'Connected ✅' : 'Disconnected ⚠️'}`);
  console.log(`🛡️  Rate limiting: 5 requests per 15 minutes`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(50));
  console.log('📝 Ready to receive contact form submissions!\n');
});

module.exports = app;
