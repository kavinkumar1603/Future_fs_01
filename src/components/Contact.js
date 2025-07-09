import React, { useState } from 'react';
import './Contact.css';

const Contact = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    alert('Thank you for your message! I\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
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
                  <span>💼</span> LinkedIn
                </a>
                <a href="https://github.com/kavinkumar1603" className="social-link">
                  <span>🐙</span> GitHub
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

              <button type="submit" className="btn btn-primary">
                Send Message
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
