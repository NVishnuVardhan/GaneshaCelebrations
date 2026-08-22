import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info, Trash2, Edit2, Gift, Hand } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import qrImage from './assets/qr.jpeg';
import './App.css';

const POOJA_DATES = ['Sept 14', 'Sept 15', 'Sept 16', 'Sept 17', 'Sept 18', 'Sept 19'];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [enrollType, setEnrollType] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', item: '', activity: '', activities: [], otherActivity: '', dates: [] });
  const [poojaEnrollments, setPoojaEnrollments] = useState([]);
  const [prasadamEnrollments, setPrasadamEnrollments] = useState([]);
  const [culturalEnrollments, setCulturalEnrollments] = useState([]);
  const [showPoojaEnrolled, setShowPoojaEnrolled] = useState(false);
  const [showPrasadamEnrolled, setShowPrasadamEnrolled] = useState(false);
  const [showCulturalEnrolled, setShowCulturalEnrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribePooja = onSnapshot(collection(db, 'poojaEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPoojaEnrollments(data);
    });
    const unsubscribePrasadam = onSnapshot(collection(db, 'prasadamEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrasadamEnrollments(data);
    });
    const unsubscribeCultural = onSnapshot(collection(db, 'culturalEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCulturalEnrollments(data);
    });
    return () => {
      unsubscribePooja();
      unsubscribePrasadam();
      unsubscribeCultural();
    };
  }, []);

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

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      if (enrollType === 'pooja') {
        if (formData.dates.length === 0) {
          alert("Please select at least one date.");
          return;
        }
        await addDoc(collection(db, 'poojaEnrollments'), { name: formData.name, phone: formData.phone, dates: formData.dates });
      } else if (enrollType === 'prasadam') {
        if (!formData.item) {
          alert("Please enter the Prasadam item.");
          return;
        }
        if (formData.dates.length === 0) {
          alert("Please select at least one date.");
          return;
        }
        await addDoc(collection(db, 'prasadamEnrollments'), { name: formData.name, phone: formData.phone, item: formData.item, dates: formData.dates });
      } else if (enrollType === 'cultural') {
        const selectedActivities = [...formData.activities];
        if (formData.otherActivity && formData.otherActivity.trim()) {
           selectedActivities.push(formData.otherActivity.trim());
        }
        if (selectedActivities.length === 0) {
          alert('Please select or enter at least one activity.');
          return;
        }
        const activityString = selectedActivities.join(', ');
        await addDoc(collection(db, 'culturalEnrollments'), { name: formData.name, phone: formData.phone, activity: activityString });
      }
      alert(`Thank you, ${formData.name}! You have successfully enrolled.`);
      setEnrollType(null);
      setFormData({ name: '', phone: '', item: '', activity: '', activities: [], otherActivity: '', dates: [] });
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'poojaEnrollments', id));
    }
  };

  const handleClearAllPooja = async () => {
    if (window.confirm('Are you sure you want to clear ALL pooja enrollments? This cannot be undone.')) {
      const snap = await getDocs(collection(db, 'poojaEnrollments'));
      snap.forEach(d => deleteDoc(doc(db, 'poojaEnrollments', d.id)));
    }
  };

  const handleEditUser = async (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newDatesStr = window.prompt("Edit dates (comma separated):", (user.dates || []).join(', '));
    if (newDatesStr === null) return;
    
    const newDates = newDatesStr.split(',').map(d => d.trim()).filter(Boolean);
    
    await updateDoc(doc(db, 'poojaEnrollments', user.id), { name: newName, phone: newPhone, dates: newDates });
  };

  const handleDateChange = (date) => {
    setFormData(prev => {
      const dates = prev.dates.includes(date) 
        ? prev.dates.filter(d => d !== date)
        : [...prev.dates, date];
      return { ...prev, dates };
    });
  };

  const handleActivityChange = (act) => {
    setFormData(prev => {
      const activities = prev.activities.includes(act) 
        ? prev.activities.filter(a => a !== act)
        : [...prev.activities, act];
      return { ...prev, activities };
    });
  };

  const handleDeletePrasadamUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'prasadamEnrollments', id));
    }
  };

  const handleClearAllPrasadam = async () => {
    if (window.confirm('Are you sure you want to clear ALL prasadam enrollments? This cannot be undone.')) {
      const snap = await getDocs(collection(db, 'prasadamEnrollments'));
      snap.forEach(d => deleteDoc(doc(db, 'prasadamEnrollments', d.id)));
    }
  };

  const handleEditPrasadamUser = async (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newItem = window.prompt("Edit item:", user.item || '');
    if (newItem === null) return;
    const newDatesStr = window.prompt("Edit dates (comma separated):", (user.dates || []).join(', '));
    if (newDatesStr === null) return;
    
    const newDates = newDatesStr.split(',').map(d => d.trim()).filter(Boolean);
    
    await updateDoc(doc(db, 'prasadamEnrollments', user.id), { name: newName, phone: newPhone, item: newItem, dates: newDates });
  };

  const handleDeleteCulturalUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'culturalEnrollments', id));
    }
  };

  const handleClearAllCultural = async () => {
    if (window.confirm('Are you sure you want to clear ALL cultural enrollments? This cannot be undone.')) {
      const snap = await getDocs(collection(db, 'culturalEnrollments'));
      snap.forEach(d => deleteDoc(doc(db, 'culturalEnrollments', d.id)));
    }
  };

  const handleEditCulturalUser = async (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newActivity = window.prompt("Edit activity:", user.activity || '');
    if (newActivity === null) return;
    
    await updateDoc(doc(db, 'culturalEnrollments', user.id), { name: newName, phone: newPhone, activity: newActivity });
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
                <span className="glowing-text">
                  Liberty Ganesh <br />
                  <em>Utsav 2026</em>
                </span>
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
              <div className="visual-block">
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
                <p><strong>September 18th After Pooja</strong></p>
                <button className="btn-secondary enroll-btn" onClick={() => setEnrollType('cultural')}>Enroll</button>
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowCulturalEnrolled(true); }} style={{color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem'}}>
                    View Participants ({culturalEnrollments.length})
                  </a>
                </div>
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

              <div className="feature-card">
                <Hand className="feature-icon" size={28} />
                <h3>Support the Utsav</h3>
                <p>Donate using the QR code below.</p>
                <img src={qrImage} alt="Donation QR Code" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', marginTop: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
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
                {enrollType === 'pooja' ? 'Daily Pooja Enrollment' : enrollType === 'prasadam' ? 'Prasadam Enrollment' : 'Cultural Activities Enrollment'}
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
                  <label htmlFor="item">Item</label>
                  <input
                    type="text"
                    id="item"
                    name="item"
                    value={formData.item}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter prasadam item"
                  />
                </div>
              )}
              {enrollType === 'cultural' && (
                <>
                  <div className="form-group">
                    <label>Select Activities</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {['Solo Dance', 'Mens Group Dance', 'Womens Group Dance', 'Kids Dance', 'Singing'].map(act => (
                        <label key={act} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                          <input 
                            type="checkbox"
                            checked={formData.activities.includes(act)}
                            onChange={() => handleActivityChange(act)}
                            style={{ width: 'auto' }}
                          />
                          {act}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="otherActivity">Other Activity (Optional)</label>
                    <input
                      type="text"
                      id="otherActivity"
                      name="otherActivity"
                      value={formData.otherActivity}
                      onChange={handleInputChange}
                      placeholder="Enter any other activity"
                    />
                  </div>
                </>
              )}
              {(enrollType === 'pooja' || enrollType === 'prasadam') && (
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
                        {user.dates && user.dates.length > 0 && (
                          <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>{user.dates.join(', ')}</span>
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

      {showCulturalEnrolled && (
        <div className="modal-overlay" onClick={() => setShowCulturalEnrolled(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cultural Participants</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAdmin && culturalEnrollments.length > 0 && (
                  <button onClick={handleClearAllCultural} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Clear All
                  </button>
                )}
                <button className="close-btn" onClick={() => setShowCulturalEnrolled(false)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="enrolled-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {culturalEnrollments.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {culturalEnrollments.map(user => (
                    <li key={user.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: '600', flexShrink: 0 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
                        {user.activity && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Activity: {user.activity}</span>
                        )}
                        {isAdmin && user.phone && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{user.phone}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditCulturalUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCulturalUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }}>
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
            <div>Liberty Ganesh <span>Committee</span></div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: '300', marginTop: '1rem', lineHeight: '1.8', maxWidth: '500px' }}>
              <div style={{ color: 'var(--color-accent)', fontWeight: '500', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.25rem' }}>Members</div>
              Ravi &bull; Ashwin &bull; Suresh &bull; Vishnu &bull; Sukumar &bull; Subash &bull; Subbu &bull; Mastan &bull; Ravi Adabala
            </div>
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
