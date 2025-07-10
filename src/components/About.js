import React from 'react';
import './About.css';

const About = ({ setCurrentPage }) => {
  return (
    <div className="about-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Portfolio</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')} className="nav-btn">Home</button>
          <button onClick={() => setCurrentPage('about')} className="nav-btn active">About</button>
          <button onClick={() => setCurrentPage('projects')} className="nav-btn">Projects</button>
          <button onClick={() => setCurrentPage('contact')} className="nav-btn">Contact</button>
        </div>
      </nav>

      <main className="about-content">
        <div className="about-header">
          <h1>About Me</h1>
          <p>Full Stack Web Developer passionate about creating amazing digital experiences</p>
        </div>

        <div className="about-grid">
          <div className="about-text">
            <h2>My Journey</h2>
            <p>
              I'm a passionate Full Stack Web Developer with expertise in modern web technologies. 
              I love building applications that solve real-world problems and provide excellent user experiences.
            </p>
            <p>
              My journey in web development started with curiosity about how websites work, and it has 
              evolved into a passion for creating robust, scalable applications using the latest technologies.
            </p>
            
            <h3>What I Do</h3>
            <ul>
              <li>Frontend Development with React.js</li>
              <li>Backend Development with Node.js</li>
              <li>Database Design with MongoDB</li>
              <li>Responsive Web Design</li>
              <li>API Development and Integration</li>
              <li>Full Stack Application Development</li>
            </ul>
          </div>

          <div className="skills-section">
            <h2>Technical Skills</h2>
            
            <div className="skill-category">
              <h3>Frontend</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-name">React.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">JavaScript</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">HTML/CSS</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="skill-category">
              <h3>Backend</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '80%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Express.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">MongoDB</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="experience-section">
          <h2>Experience & Education</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-date">2025 - Present</div>
              <div className="timeline-content">
                <h3>Full Stack Developer</h3>
                <p>Developing modern web applications using React.js, Node.js, and MongoDB. 
                   Created 3+ projects showcasing different aspects of full-stack development.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">2024 - 2025</div>
              <div className="timeline-content">
                <h3>Web Development Learning</h3>
                <p>Intensive learning and practice in modern web development technologies, 
                   focusing on MERN stack development and best practices.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
