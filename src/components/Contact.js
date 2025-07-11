import React, { useState } from 'react';
import './Contact.css';

const Contact = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage(data.message || 'Thank you for your message! I\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          setSubmitError(data.details.join('. '));
        } else {
          setSubmitError(data.error || data.message || 'Failed to send message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Portfolio</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')} className="nav-btn">Home</button>
          <button onClick={() => setCurrentPage('about')} className="nav-btn">About</button>
          <button onClick={() => setCurrentPage('projects')} className="nav-btn">Projects</button>
          <button onClick={() => setCurrentPage('contact')} className="nav-btn active">Contact</button>
        </div>
      </nav>

      <main className="contact-content">
        <div className="contact-header">
          <h1>Get In Touch</h1>
          <p>Let's discuss your next project or collaboration opportunity</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h2>Let's Connect</h2>
            <p>
              I'm always interested in new opportunities and exciting projects.
              Whether you have a project in mind or just want to chat about web development,
              feel free to reach out!
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>abc@example.com</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">📱</div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>+91 1234567890</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Location</h3>
                  <p>Your City, Your Country</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <h3>Follow Me</h3>
              <div className="social-icons">
                <a href="https://www.linkedin.com/feed/" className="social-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/kavinkumar1603" className="social-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send Me a Message</h2>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell me about your project or just say hello!"
                ></textarea>
              </div>

              {/* Status Messages */}
              {submitMessage && (
                <div className="alert alert-success" style={{
                  padding: '12px 16px',
                  marginTop: '16px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '6px',
                  color: '#155724'
                }}>
                  ✅ {submitMessage}
                </div>
              )}
              
              {submitError && (
                <div className="alert alert-error" style={{
                  padding: '12px 16px',
                  marginTop: '16px',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  color: '#721c24'
                }}>
                  ❌ {submitError}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span>Sending...</span>
                    <div style={{ 
                      display: 'inline-block', 
                      marginLeft: '8px', 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #ffffff', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></div>
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="availability-section">
          <div className="availability-card">
            <h2>Current Availability</h2>
            <div className="availability-status">
              <span className="status-indicator available"></span>
              <span>Available for new projects</span>
            </div>
            <p>
              I'm currently accepting new projects and collaborations.
              Let's work together to bring your ideas to life!
            </p>
            <div className="response-time">
              <h3>Response Time</h3>
              <p>Usually responds within 24 hours</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
