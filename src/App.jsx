import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info, Trash2, Edit2, Gift, Hand } from 'lucide-react';
import './App.css';

const POOJA_DATES = ['Sept 14', 'Sept 15', 'Sept 16', 'Sept 17', 'Sept 18', 'Sept 19'];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [flowers, setFlowers] = useState([]);
  const [enrollType, setEnrollType] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', item: '', dates: [] });
  const [poojaEnrollments, setPoojaEnrollments] = useState(() => {
    const saved = localStorage.getItem('poojaEnrollments');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [prasadamEnrollments, setPrasadamEnrollments] = useState(() => {
    const saved = localStorage.getItem('prasadamEnrollments');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showPoojaEnrolled, setShowPoojaEnrolled] = useState(false);
  const [showPrasadamEnrolled, setShowPrasadamEnrolled] = useState(false);

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newFlower = {
      id: Date.now() + Math.random(),
      x,
      y,
      emoji: ['🪷', '🏵️', '✨', '🌟'][Math.floor(Math.random() * 4)]
    };
    
    setFlowers(prev => [...prev, newFlower]);
    
    setTimeout(() => {
      setFlowers(prev => prev.filter(f => f.id !== newFlower.id));
    }, 3000);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('poojaEnrollments', JSON.stringify(poojaEnrollments));
  }, [poojaEnrollments]);

  useEffect(() => {
    localStorage.setItem('prasadamEnrollments', JSON.stringify(prasadamEnrollments));
  }, [prasadamEnrollments]);

  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (isAdmin) {
      setIsAdmin(false);
      alert('Logged out of Admin mode');
    } else {
      const code = prompt('Enter Admin Passcode:');
      if (code === 'Celebrate') {
        setIsAdmin(true);
        alert('Admin Access Granted');
      } else if (code !== null) {
        alert('Incorrect Passcode');
      }
    }
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (enrollType === 'pooja') {
      if (formData.dates.length === 0) {
        alert("Please select at least one date.");
        return;
      }
      setPoojaEnrollments(prev => [...prev, { id: Date.now(), name: formData.name, phone: formData.phone, dates: formData.dates }]);
    } else if (enrollType === 'prasadam') {
      setPrasadamEnrollments(prev => [...prev, { id: Date.now(), name: formData.name, phone: formData.phone, item: formData.item }]);
    }
    alert(`Thank you, ${formData.name}! You have successfully enrolled for ${enrollType === 'pooja' ? 'Daily Pooja' : 'Prasadam'}.`);
    setEnrollType(null);
    setFormData({ name: '', phone: '', item: '', dates: [] });
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setPoojaEnrollments(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleClearAllPooja = () => {
    if (window.confirm('Are you sure you want to clear ALL pooja enrollments? This cannot be undone.')) {
      setPoojaEnrollments([]);
    }
  };

  const handleEditUser = (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newDatesStr = window.prompt("Edit dates (comma separated):", (user.dates || []).join(', '));
    if (newDatesStr === null) return;
    
    const newDates = newDatesStr.split(',').map(d => d.trim()).filter(Boolean);
    
    setPoojaEnrollments(prev => prev.map(u => 
      u.id === user.id ? { ...u, name: newName, phone: newPhone, dates: newDates } : u
    ));
  };

  const handleDateChange = (date) => {
    setFormData(prev => {
      const dates = prev.dates.includes(date) 
        ? prev.dates.filter(d => d !== date)
        : [...prev.dates, date];
      return { ...prev, dates };
    });
  };

  const handleDeletePrasadamUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setPrasadamEnrollments(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleClearAllPrasadam = () => {
    if (window.confirm('Are you sure you want to clear ALL prasadam enrollments? This cannot be undone.')) {
      setPrasadamEnrollments([]);
    }
  };

  const handleEditPrasadamUser = (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newItem = window.prompt("Edit item:", user.item || '');
    if (newItem === null) return;
    
    setPrasadamEnrollments(prev => prev.map(u => 
      u.id === user.id ? { ...u, name: newName, phone: newPhone, item: newItem } : u
    ));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app-layout">
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="nav-brand">
            Liberty Ganesh <span>2026</span>
          </a>
          
          <div className="nav-desktop">
            <a href="#schedule" className="nav-link">Schedule</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a href="#" className="nav-link" onClick={handleAdminClick}>{isAdmin ? 'Admin: Logout' : 'Admin'}</a>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#schedule" onClick={() => setMobileMenuOpen(false)}>Schedule</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <a href="#" onClick={(e) => { handleAdminClick(e); setMobileMenuOpen(false); }}>{isAdmin ? 'Admin: Logout' : 'Admin'}</a>
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
              <div className="visual-block" onClick={handleImageClick}>
                {flowers.map(flower => (
                  <span
                    key={flower.id}
                    className="glowing-flower"
                    style={{ left: flower.x, top: flower.y }}
                  >
                    {flower.emoji}
                  </span>
                ))}
              </div>
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
                <h3>Daily Pooja Enrollment</h3>
                <p>Register for daily pooja sessions.</p>
                <button className="btn-secondary enroll-btn" onClick={() => setEnrollType('pooja')}>Enroll</button>
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowPoojaEnrolled(true); }} style={{color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem'}}>
                    View Enrolled Users ({poojaEnrollments.length})
                  </a>
                </div>
              </div>

              <div className="feature-card">
                <Gift className="feature-icon" size={28} />
                <h3>Sponsor a Prasadam</h3>
                <p>Register to offer Prasadam.</p>
                <button className="btn-secondary enroll-btn" onClick={() => setEnrollType('prasadam')}>Enroll</button>
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowPrasadamEnrolled(true); }} style={{color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem'}}>
                    Prasadam sponsors ({prasadamEnrollments.length})
                  </a>
                </div>
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

      {enrollType && (
        <div className="modal-overlay" onClick={() => setEnrollType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {enrollType === 'pooja' ? 'Daily Pooja Enrollment' : 'Prasadam Enrollment'}
              </h3>
              <button className="close-btn" onClick={() => setEnrollType(null)}>
                <X size={24} />
              </button>
            </div>
            <form className="enroll-form" onSubmit={handleEnrollSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              {enrollType === 'prasadam' && (
                <div className="form-group">
                  <label htmlFor="item">Item (Optional)</label>
                  <input
                    type="text"
                    id="item"
                    name="item"
                    value={formData.item}
                    onChange={handleInputChange}
                    placeholder="Enter prasadam item"
                  />
                </div>
              )}
              {enrollType === 'pooja' && (
                <div className="form-group">
                  <label>Select Dates</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {POOJA_DATES.map(date => (
                      <label key={date} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        <input 
                          type="checkbox"
                          checked={formData.dates.includes(date)}
                          onChange={() => handleDateChange(date)}
                          style={{ width: 'auto' }}
                        />
                        {date}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button type="submit" className="btn-primary submit-btn">
                Confirm Enrollment
              </button>
            </form>
          </div>
        </div>
      )}

      {showPoojaEnrolled && (
        <div className="modal-overlay" onClick={() => setShowPoojaEnrolled(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Pooja Enrollments</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAdmin && poojaEnrollments.length > 0 && (
                  <button onClick={handleClearAllPooja} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Clear All
                  </button>
                )}
                <button className="close-btn" onClick={() => setShowPoojaEnrolled(false)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="enrolled-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {poojaEnrollments.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {poojaEnrollments.map(user => (
                    <li key={user.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: '600', flexShrink: 0 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
                        {user.dates && user.dates.length > 0 && (
                          <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>{user.dates.join(', ')}</span>
                        )}
                        {isAdmin && user.phone && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{user.phone}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No users enrolled yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showPrasadamEnrolled && (
        <div className="modal-overlay" onClick={() => setShowPrasadamEnrolled(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Prasadam Enrollments</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAdmin && prasadamEnrollments.length > 0 && (
                  <button onClick={handleClearAllPrasadam} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Clear All
                  </button>
                )}
                <button className="close-btn" onClick={() => setShowPrasadamEnrolled(false)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="enrolled-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {prasadamEnrollments.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {prasadamEnrollments.map(user => (
                    <li key={user.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: '600', flexShrink: 0 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
                        {user.item && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Item: {user.item}</span>
                        )}
                        {isAdmin && user.phone && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{user.phone}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditPrasadamUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePrasadamUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No users enrolled yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
