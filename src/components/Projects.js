import React from 'react';
import './Projects.css';

const Projects = ({ setCurrentPage }) => {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
      features: [
        "User Authentication & Authorization",
        "Product Management System",
        "Shopping Cart & Checkout",
        "Payment Gateway Integration",
        "Responsive Design"
      ],
      demoLink: "#",
      codeLink: "#",
      image: "🛒"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates. Built using React for frontend and Node.js with Socket.io for real-time communication.",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB", "JWT"],
      features: [
        "Real-time Task Updates",
        "Team Collaboration",
        "Drag & Drop Interface",
        "Task Categories & Priorities",
        "Progress Tracking"
      ],
      demoLink: "#",
      codeLink: "#",
      image: "📋"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "A dynamic weather dashboard that provides current weather conditions and forecasts. Features location-based weather data and interactive charts.",
      technologies: ["React", "Weather API", "Chart.js", "CSS3", "Local Storage"],
      features: [
        "Current Weather Display",
        "5-Day Forecast",
        "Location Search",
        "Interactive Charts",
        "Favorite Locations"
      ],
      demoLink: "#",
      codeLink: "#",
      image: "🌤️"
    }
  ];

  return (
    <div className="projects-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Portfolio</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')} className="nav-btn">Home</button>
          <button onClick={() => setCurrentPage('about')} className="nav-btn">About</button>
          <button onClick={() => setCurrentPage('projects')} className="nav-btn active">Projects</button>
          <button onClick={() => setCurrentPage('contact')} className="nav-btn">Contact</button>
        </div>
      </nav>

      <main className="projects-content">
        <div className="projects-header">
          <h1>My Projects</h1>
          <p>Here are some of the React projects I've built as a full-stack developer</p>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-icon">
                <span>{project.image}</span>
              </div>
              
              <div className="project-content">
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-tech">
                  <h4>Technologies Used:</h4>
                  <div className="tech-tags">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="project-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {project.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="project-links">
                  <a href={project.demoLink} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                    Live Demo
                  </a>
                  <a href={project.codeLink} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                    View Code
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="skills-showcase">
          <h2>Technical Skills Demonstrated</h2>
          <div className="skills-grid">
            <div className="skill-box">
              <h3>Frontend Development</h3>
              <ul>
                <li>React.js Components & Hooks</li>
                <li>State Management</li>
                <li>Responsive Design</li>
                <li>Modern CSS & Animations</li>
              </ul>
            </div>
            <div className="skill-box">
              <h3>Backend Development</h3>
              <ul>
                <li>Node.js & Express.js</li>
                <li>RESTful API Design</li>
                <li>Database Integration</li>
                <li>Authentication & Security</li>
              </ul>
            </div>
            <div className="skill-box">
              <h3>Full Stack Integration</h3>
              <ul>
                <li>Frontend-Backend Communication</li>
                <li>Real-time Features</li>
                <li>Payment Gateway Integration</li>
                <li>Deployment & Hosting</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
