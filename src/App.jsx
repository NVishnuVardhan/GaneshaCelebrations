import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info } from 'lucide-react';
import './App.css';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-layout">
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="nav-brand">
            Liberty Ganesh <span>2026</span>
          </a>
          
          <div className="nav-desktop">
            <a href="#about" className="nav-link">About</a>
            <a href="#schedule" className="nav-link">Schedule</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#schedule" onClick={() => setMobileMenuOpen(false)}>Schedule</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </div>
      )}

      <main>
        <section id="home" className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <span className="hero-eyebrow animate-fade-up">Let's come together in devotion, celebration and community!</span>
              <h1 className="hero-title animate-fade-up delay-1">
                Liberty Ganesh <br />
                <em>Utsav 2026</em>
              </h1>
              <p className="hero-desc animate-fade-up delay-2">
                We cordially invite everyone to join us in celebrating Ganesh Chaturthi for the 5 days rituals.
              </p>
              <div className="hero-actions animate-fade-up delay-3">
                <a href="#schedule" className="btn-primary" style={{textDecoration: 'none'}}>
                  Explore Schedule <ArrowRight size={18} />
                </a>
                <a href="https://chat.whatsapp.com/Hw83ka9nJtF7tgiDpuXSvf" target="_blank" rel="noreferrer" className="btn-secondary" style={{textDecoration: 'none'}}>
                  Join WhatsApp
                </a>
              </div>
            </div>
            <div className="hero-visual animate-fade-up delay-4">
              <div className="visual-block"></div>
            </div>
          </div>
        </section>

        <section id="schedule" className="features-section">
          <div className="features-container">
            <h2 className="section-title">Event Schedule & Details</h2>
            <div className="features-grid">
              
              <div className="feature-card">
                <Calendar className="feature-icon" size={28} />
                <h3>Idol Placement & First Pooja</h3>
                <p><strong>September 14, 6:30 PM</strong><br/>Regular Poojas will be performed every day at 7:00 PM.</p>
              </div>

              <div className="feature-card">
                <Music className="feature-icon" size={28} />
                <h3>Cultural Activities</h3>
                <p><strong>September 18th After Pooja</strong><br/>For more details, please contact Ranjith: +1 (818) 835-7195</p>
              </div>

              <div className="feature-card">
                <Info className="feature-icon" size={28} />
                <h3>Ganesh Immersion</h3>
                <p><strong>September 19th</strong><br/>Starting from 2:00 PM onwards.</p>
              </div>

              <div className="feature-card">
                <Phone className="feature-icon" size={28} />
                <h3>Pooja & Prasadam Enrollment</h3>
                <p>To enroll, contact:<br/>Ashwin: +1 (469) 265-5986<br/>Suresh: +1 (801) 245-0333</p>
              </div>

              <div className="feature-card">
                <MapPin className="feature-icon" size={28} />
                <h3>Ganesh Mandap Address</h3>
                <p>2702 Garrison Dr,<br/>Melissa, TX 75454</p>
              </div>

              <div className="feature-card">
                <MessageCircle className="feature-icon" size={28} />
                <h3>More Details</h3>
                <p>Please <a href="https://chat.whatsapp.com/Hw83ka9nJtF7tgiDpuXSvf" target="_blank" rel="noreferrer" style={{color: 'var(--color-accent)', textDecoration: 'underline'}}>join us on WhatsApp</a> for updates and more details.</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="footer-modern" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            Liberty Ganesh <span>Committee</span>
          </div>
          <div className="footer-links">
            <p style={{ maxWidth: '400px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              Note: We will abide by all the rules and take necessary permissions from neighbors & HOA to avoid any inconvenience and violations.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Liberty Ganesh Utsav. All rights reserved.</p>
          <p className="developer-signature">designed by Roma</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
