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

// MongoDB connection with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kavin88701:LNYGENaMCfDhXmxD@cluster0.dfpaodr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  isMongoConnected = true;
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
  console.log('⚠️  Server will continue without MongoDB (emails will still work)');
  console.log('🔧 To fix: Add your IP address to MongoDB Atlas whitelist');
  console.log('📝 Visit: https://cloud.mongodb.com/v2/PROJECT_ID#security/network/whitelist');
  isMongoConnected = false;
});

// Contact form schema
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
    lowercase: true
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
    maxlength: 1000
  },
  ipAddress: {
    type: String,
    required: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: false
  }
});

const Contact = mongoose.model('Contact', contactSchema);

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions, please try again later.',
  },
});

// Email configuration
const createTransporter = () => {
  // Gmail configuration with better timeout settings
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,    // 30 seconds
    socketTimeout: 60000       // 60 seconds
  });
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    mongodb: isMongoConnected ? 'Connected' : 'Disconnected',
    emailService: 'Ready'
  });
});

// Get all contact submissions (for admin purposes)
app.get('/api/contacts', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      error: 'Database unavailable',
      message: 'MongoDB is not connected. Please check database connection.',
      details: 'Add your IP to MongoDB Atlas whitelist to enable database features.'
    });
  }

  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 }).limit(50);
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      details: 'Unable to retrieve contact submissions'
    });
  }
});

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required',
        details: 'Please fill in all required fields: name, email, subject, and message'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    if (name.length > 100 || subject.length > 200 || message.length > 1000) {
      return res.status(400).json({
        error: 'Input too long',
        details: 'Please ensure your inputs are within reasonable limits'
      });
    }

    // Save to MongoDB (if connected)
    let savedContact = null;
    if (isMongoConnected) {
      try {
        const contactSubmission = new Contact({
          name,
          email,
          subject,
          message,
          ipAddress,
          emailSent: false
        });

        savedContact = await contactSubmission.save();
        console.log(`📝 Contact saved to database with ID: ${savedContact._id}`);
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
        console.log('⚠️  Continuing without database save...');
      }
    } else {
      console.log('⚠️  MongoDB not connected - skipping database save');
    }

    // Create transporter
    const transporter = createTransporter();

    // Check if email is properly configured
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password-here') {
      console.log('⚠️  Email not configured - simulating email send');
      
      // Simulate successful email send for testing
      console.log(`📧 [SIMULATED] Email would be sent to kavin88701@gmail.com`);
      console.log(`📧 [SIMULATED] Auto-reply would be sent to ${email}`);
      console.log(`Contact form submission from ${email} - Subject: ${subject}`);

      return res.status(200).json({
        success: true,
        message: 'Message received successfully! (Email simulation mode - configure EMAIL_PASS in .env for real emails)',
        submissionId: savedContact ? savedContact._id : null,
        databaseSaved: !!savedContact,
        emailSent: false,
        note: 'Set up Gmail App Password in .env to enable real email sending'
      });
    }

    // Email content to send to you
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'kavin88701@gmail.com',
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 5px;">Contact Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            ${savedContact ? `<p style="margin: 5px 0;"><strong>Submission ID:</strong> ${savedContact._id}</p>` : ''}
            <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This email was sent from your portfolio contact form.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    // Auto-reply email to the sender
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Thank You for Reaching Out!</h2>
          
          <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for your message! I've received your inquiry about "<strong>${subject}</strong>" and I'll get back to you as soon as possible.
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            I typically respond within 24 hours. In the meantime, feel free to check out my projects on my portfolio or connect with me on social media.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            ${savedContact ? `<p style="margin: 5px 0;"><strong>Reference ID:</strong> ${savedContact._id}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 5px 0;"><strong>Message:</strong> ${message.length > 100 ? message.substring(0, 100) + '...' : message}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Best regards,<br>
            <strong>Kavinkumar</strong><br>
            Full Stack Developer
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReplyOptions);

    // Update the document to mark email as sent (if saved to DB)
    if (savedContact && isMongoConnected) {
      try {
        await Contact.findByIdAndUpdate(savedContact._id, { emailSent: true });
        console.log(`📧 Emails sent successfully for submission ${savedContact._id}`);
      } catch (updateError) {
        console.log('📧 Emails sent successfully (DB update failed)');
      }
    } else {
      console.log('📧 Emails sent successfully');
    }

    console.log(`Contact form submission from ${email} - Subject: ${subject}`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! Thank you for reaching out.',
      submissionId: savedContact ? savedContact._id : null,
      databaseSaved: !!savedContact
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    // Don't expose internal errors to the client
    res.status(500).json({
      error: 'Failed to send message',
      details: 'There was an issue processing your request. Please try again later or contact me directly.'
    });
  }
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Email service configured for: kavin88701@gmail.com`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Contacts endpoint: http://localhost:${PORT}/api/contacts`);
  console.log(`💾 MongoDB connection status: ${isMongoConnected ? 'Connected' : 'Disconnected'}`);
  
  if (!isMongoConnected) {
    console.log(`\n🔧 TO FIX MONGODB CONNECTION:`);
    console.log(`1. Go to MongoDB Atlas: https://cloud.mongodb.com`);
    console.log(`2. Navigate to: Security → Network Access`);
    console.log(`3. Click "Add IP Address"`);
    console.log(`4. Add your current IP or use 0.0.0.0/0 for testing`);
    console.log(`5. Restart the server\n`);
  }
});

module.exports = app;
