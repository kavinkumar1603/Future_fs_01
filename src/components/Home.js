import React from 'react';
import './Home.css';
import photo from '../asset/photo.jpg';

const Home = ({ setCurrentPage }) => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Portfolio</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')} className="nav-btn active">Home</button>
          <button onClick={() => setCurrentPage('about')} className="nav-btn">About</button>
          <button onClick={() => setCurrentPage('projects')} className="nav-btn">Projects</button>
          <button onClick={() => setCurrentPage('contact')} className="nav-btn">Contact</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Hi, I'm <span className="highlight">Kavinkumar</span>
            </h1>
            <h2 className="hero-subtitle">Full Stack Web Developer</h2>
            <p className="hero-description">
              I create dynamic and responsive web applications using modern technologies like React, Node.js, and MongoDB. 
              Passionate about building user-friendly interfaces and robust backend systems.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => setCurrentPage('projects')}
              >
                View My Projects
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentPage('contact')}
              >
                Get In Touch
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="profile-card">
              <div className="profile-image">
                <img 
                  src={photo} 
                  alt="Kavinkumar - Full Stack Web Developer" 
                  className="avatar-image"
                />
              </div>
              <div className="tech-stack">
                <span className="tech-item">React</span>
                <span className="tech-item">Node.js</span>
                <span className="tech-item">MongoDB</span>
                <span className="tech-item">JavaScript</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="quick-stats">
        <div className="stat-item">
          <h3>3+</h3>
          <p>React Projects</p>
        </div>
        <div className="stat-item">
          <h3>Full Stack</h3>
          <p>Developer</p>
        </div>
        <div className="stat-item">
          <h3>Modern</h3>
          <p>Technologies</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
