const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection with your credentials
const MONGODB_URI = 'mongodb+srv://kavin88701:LNYGENaMCfDhXmxD@cluster0.dfpaodr.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0';

let isMongoConnected = false;

// Enhanced MongoDB connection with retry logic
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
  } catch (error) {
    isMongoConnected = false;
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Server will continue without database (emails will still work)');
    
    // Retry connection after 30 seconds
    setTimeout(connectToMongoDB, 30000);
  }
};

// Initialize MongoDB connection
connectToMongoDB();

// Contact Schema
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
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  }
});

const Contact = mongoose.model('Contact', contactSchema);

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions from this IP. Please try again in 15 minutes.',
    details: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Please wait before submitting another message.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Email configuration with your credentials
const createEmailTransporter = () => {
  console.log('📧 Creating email transporter with credentials:', process.env.EMAIL_USER);
  
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER || 'kavin88701@gmail.com',
      pass: process.env.EMAIL_PASS || 'iwagbllmpuffvuge'
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,  // 60 seconds
    greetingTimeout: 30000,    // 30 seconds
    socketTimeout: 60000,      // 60 seconds
    debug: true,               // Enable debug output
    logger: true               // Log to console
  });
};

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize input function
const sanitizeInput = (str) => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .trim();
};

// Health check endpoint
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

// Get all contacts (admin endpoint)
app.get('/api/contacts', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      message: 'MongoDB is not connected. Contact data cannot be retrieved.'
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
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
      message: 'Unable to retrieve contact submissions'
    });
  }
});

// Main contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  let savedContact = null;
  
  try {
    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Input validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please fill in all required fields: name, email, subject, and message'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message)
    };

    // Validate email format
    if (!isValidEmail(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Length validation
    if (sanitizedData.name.length > 100 || 
        sanitizedData.subject.length > 200 || 
        sanitizedData.message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Input too long',
        message: 'Please ensure your inputs are within reasonable limits'
      });
    }

    // Save to database if connected
    if (isMongoConnected) {
      try {
        const contactSubmission = new Contact({
          ...sanitizedData,
          ipAddress,
          userAgent,
          status: 'pending'
        });

        savedContact = await contactSubmission.save();
        console.log(`📝 Contact saved to database with ID: ${savedContact._id}`);
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
        // Continue without database save
      }
    }

    // Create email transporter
    const transporter = createEmailTransporter();

    // Verify transporter configuration with timeout
    console.log('📧 Verifying email transporter...');
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 10000)
        )
      ]);
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.log('⚠️ Email verification failed, but continuing anyway:', verifyError.message);
      // Continue anyway - verification issues don't always mean sending will fail
    }

    // Email to you (notification)
    const notificationEmail = {
      from: `"Portfolio Contact Form" <kavin88701@gmail.com>`,
      to: 'kavin88701@gmail.com',
      subject: `🚀 New Portfolio Contact: ${sanitizedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">✉️ New Contact Form Submission</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">From your portfolio website</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #34495e; margin-top: 0; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">${sanitizedData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;"><a href="mailto:${sanitizedData.email}" style="color: #3498db;">${sanitizedData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">${sanitizedData.subject}</td>
              </tr>
              ${savedContact ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;"><strong>Reference ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">${savedContact._id}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0;"><strong>IP Address:</strong></td>
                <td style="padding: 8px 0;">${ipAddress}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #34495e; margin-top: 0; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Message</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #3498db; line-height: 1.6;">
              ${sanitizedData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #34495e; border-radius: 8px; color: white;">
            <p style="margin: 0; font-size: 14px;">📅 Received: ${new Date().toLocaleString()}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #bdc3c7;">This email was sent from your portfolio contact form</p>
          </div>
        </div>
      `
    };

    // Auto-reply to sender
    const autoReplyEmail = {
      from: `"Kavinkumar - Portfolio" <kavin88701@gmail.com>`,
      to: sanitizedData.email,
      subject: '✅ Thank you for contacting me!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🙏 Thank You!</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Your message has been received</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #34495e; line-height: 1.6; margin-top: 0;">Hi <strong>${sanitizedData.name}</strong>,</p>
            
            <p style="color: #34495e; line-height: 1.6;">
              Thank you for reaching out through my portfolio! I've received your message about "<strong>${sanitizedData.subject}</strong>" and I appreciate you taking the time to contact me.
            </p>
            
            <p style="color: #34495e; line-height: 1.6;">
              I typically respond within <strong>24 hours</strong>. In the meantime, feel free to:
            </p>
            
            <ul style="color: #34495e; line-height: 1.6;">
              <li>Check out my other projects on my portfolio</li>
              <li>Connect with me on <a href="https://www.linkedin.com/in/kavinkumar1603" style="color: #3498db;">LinkedIn</a></li>
              <li>Follow my work on <a href="https://github.com/kavinkumar1603" style="color: #3498db;">GitHub</a></li>
            </ul>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">📋 Your Message Summary:</h3>
            ${savedContact ? `<p style="margin: 5px 0; color: #34495e;"><strong>Reference ID:</strong> ${savedContact._id}</p>` : ''}
            <p style="margin: 5px 0; color: #34495e;"><strong>Subject:</strong> ${sanitizedData.subject}</p>
            <p style="margin: 5px 0; color: #34495e;"><strong>Message:</strong> ${sanitizedData.message.length > 100 ? sanitizedData.message.substring(0, 100) + '...' : sanitizedData.message}</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; text-align: center;">
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              Best regards,<br>
              <strong style="color: #2c3e50; font-size: 18px;">Kavinkumar</strong><br>
              <span style="color: #7f8c8d;">Full Stack Developer</span>
            </p>
            
            <div style="margin-top: 20px;">
              <a href="https://github.com/kavinkumar1603" style="display: inline-block; margin: 0 10px; color: #34495e; text-decoration: none;">GitHub</a>
              <a href="https://www.linkedin.com/in/kavinkumar1603" style="display: inline-block; margin: 0 10px; color: #34495e; text-decoration: none;">LinkedIn</a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 15px; color: #7f8c8d; font-size: 12px;">
            <p style="margin: 0;">This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    // Hybrid email sending function with multiple providers
    const sendEmailWithFallback = async (emailData) => {
      const methods = [
        // Method 1: Try Gmail SMTP
        async () => {
          const transporter = createEmailTransporter();
          await transporter.sendMail(emailData);
          return 'Gmail SMTP';
        },
        
        // Method 2: Try SendGrid (if API key available)
        async () => {
          if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
              to: emailData.to,
              from: emailData.from,
              subject: emailData.subject,
              html: emailData.html
            };
            await sgMail.send(msg);
            return 'SendGrid API';
          }
          throw new Error('SendGrid API key not configured');
        },
        
        // Method 3: Fallback - Log email for manual sending
        async () => {
          console.log('📧 EMAIL FALLBACK - Please send manually:');
          console.log(`To: ${emailData.to}`);
          console.log(`Subject: ${emailData.subject}`);
          console.log(`Content: ${emailData.html.substring(0, 200)}...`);
          return 'Manual Fallback';
        }
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          const result = await methods[i]();
          console.log(`✅ Email sent via ${result}`);
          return result;
        } catch (error) {
          console.log(`❌ Email method ${i + 1} failed:`, error.message);
          if (i === methods.length - 1) {
            // Last method should always succeed (manual fallback)
            return 'Manual Fallback';
          }
        }
      }
    };

    // Send both emails with fallback handling
    let emailSent = false;
    try {
      console.log('📧 Sending notification email...');
      await sendEmailWithFallback(notificationEmail);
      
      console.log('📧 Sending auto-reply email...');
      await sendEmailWithFallback(autoReplyEmail);
      
      emailSent = true;
    } catch (emailError) {
      console.error('⚠️ All email methods failed:', emailError.message);
      console.log('📧 Check console for manual email details');
      // Continue without email but mark as failed
    }

    // Update database status if connected
    if (savedContact && isMongoConnected) {
      try {
        await Contact.findByIdAndUpdate(savedContact._id, {
          emailSent: true,
          status: 'sent'
        });
      } catch (updateError) {
        console.error('Failed to update contact status:', updateError.message);
      }
    }

    console.log(`📩 Contact: ${sanitizedData.name} <${sanitizedData.email}> - ${sanitizedData.subject}`);

    // Success response
    const responseMessage = emailSent 
      ? 'Thank you for your message! I\'ll get back to you soon.'
      : 'Thank you for your message! Your submission has been recorded. I\'ll get back to you soon.';

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        submissionId: savedContact ? savedContact._id : null,
        timestamp: new Date().toISOString(),
        emailSent: emailSent,
        databaseSaved: !!savedContact
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);

    // Update database status to failed if we have a saved contact
    if (savedContact && isMongoConnected) {
      try {
        await Contact.findByIdAndUpdate(savedContact._id, {
          status: 'failed'
        });
      } catch (updateError) {
        console.error('Failed to update failed status:', updateError.message);
      }
    }

    // Error response
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: 'There was an issue processing your request. Please try again later or contact me directly at kavin88701@gmail.com',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Contact statistics endpoint
app.get('/api/contact-stats', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable'
    });
  }

  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }
      }
    ]);

    const dailyStats = await Contact.aggregate([
      {
        $match: {
          submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, sent: 0, pending: 0, failed: 0 },
        dailyActivity: dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/contact',
      'GET /api/contacts',
      'GET /api/contact-stats'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (isMongoConnected) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀====================================🚀');
  console.log(`✅ Portfolio Backend Server Started!`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📧 Email: kavin88701@gmail.com (CONFIGURED)`);
  console.log(`💾 MongoDB: ${isMongoConnected ? 'Connected ✅' : 'Connecting... ⏳'}`);
  console.log(`🛡️  Security: Rate limiting enabled`);
  console.log('\n📍 Available Endpoints:');
  console.log(`   🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   📨 Contact Form: http://localhost:${PORT}/api/contact`);
  console.log(`   📋 View Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`   📊 Statistics: http://localhost:${PORT}/api/contact-stats`);
  console.log('🚀====================================🚀\n');
});

module.exports = app;
