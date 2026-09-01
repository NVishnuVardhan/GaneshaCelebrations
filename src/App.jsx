import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info, Trash2, Edit2, Gift, Hand, BarChart2, DollarSign, Plus, Volume2, VolumeX, Users } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import qrImage from './assets/qr.jpeg';
import ganeshMantraAudio from './assets/GaneshMantra.mpeg';
import confetti from 'canvas-confetti';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

import './App.css';

const POOJA_DATES = ['Sept 14', 'Sept 15', 'Sept 16', 'Sept 17', 'Sept 18'];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [enrollType, setEnrollType] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', item: '', activity: '', activities: [], otherActivity: '', dates: [], adultsCount: 1, kidsCount: 0 });
  const [poojaEnrollments, setPoojaEnrollments] = useState([]);
  const [prasadamEnrollments, setPrasadamEnrollments] = useState([]);
  const [culturalEnrollments, setCulturalEnrollments] = useState([]);
  const [annadhaanamEnrollments, setAnnadhaanamEnrollments] = useState([]);
  const [showPoojaEnrolled, setShowPoojaEnrolled] = useState(false);
  const [showPrasadamEnrolled, setShowPrasadamEnrolled] = useState(false);
  const [showCulturalEnrolled, setShowCulturalEnrolled] = useState(false);
  const [showAnnadhaanamEnrolled, setShowAnnadhaanamEnrolled] = useState(false);

  const [showAccounts, setShowAccounts] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [budgetData, setBudgetData] = useState({ totalFunds: 0, expenses: [] });

  useEffect(() => {
    const isModalOpen = enrollType || showPoojaEnrolled || showPrasadamEnrolled || showCulturalEnrolled || showAnnadhaanamEnrolled || showAccounts;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [enrollType, showPoojaEnrolled, showPrasadamEnrolled, showCulturalEnrolled, showAnnadhaanamEnrolled, showAccounts]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [scheduleVisible, setScheduleVisible] = useState(false);
  const scheduleRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setScheduleVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (scheduleRef.current) observer.observe(scheduleRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tryAutoplay = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.20; // Setting volume to 20%
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.log("Autoplay prevented by browser:", err);
        }
      }
    };
    tryAutoplay();
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
    const unsubscribeAnnadhaanam = onSnapshot(collection(db, 'annadhaanamEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnadhaanamEnrollments(data);
    });
    return () => {
      unsubscribePooja();
      unsubscribePrasadam();
      unsubscribeCultural();
      unsubscribeAnnadhaanam();
    };
  }, []);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const budgetRef = doc(db, 'finances', 'budget');
        const budgetSnap = await getDoc(budgetRef);
        if (budgetSnap.exists()) {
          setBudgetData(budgetSnap.data());
        } else {
          const initialData = { totalFunds: 0, expenses: [] };
          await setDoc(budgetRef, initialData);
          setBudgetData(initialData);
        }
      } catch (err) {
        console.error("Error fetching budget:", err);
      }
    };
    fetchBudget();
    
    const unsubscribeBudget = onSnapshot(doc(db, 'finances', 'budget'), (docSnap) => {
      if (docSnap.exists()) {
        setBudgetData(docSnap.data());
      }
    });
    return () => unsubscribeBudget();
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (isAdmin) {
      setIsAdmin(false);
      alert('Logged out of Admin mode');
    } else {
      const code = prompt('Enter Admin Passcode:');
      if (code === 'access5') {
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
      } else if (enrollType === 'annadhaanam') {
        if ((!formData.adultsCount && !formData.kidsCount) || (formData.adultsCount < 0) || (formData.kidsCount < 0) || (Number(formData.adultsCount) + Number(formData.kidsCount) < 1)) {
          alert('Please enter a valid count of people.');
          return;
        }
        await addDoc(collection(db, 'annadhaanamEnrollments'), { name: formData.name, phone: formData.phone, adultsCount: Number(formData.adultsCount), kidsCount: Number(formData.kidsCount) });
      }
      if (enrollType === 'prasadam' || enrollType === 'annadhaanam') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500'],
          zIndex: 2000
        });
      }
      setTimeout(() => {
        alert(`Thank you, ${formData.name}! You have successfully enrolled.`);
      }, (enrollType === 'prasadam' || enrollType === 'annadhaanam') ? 800 : 10);
      setEnrollType(null);
      setFormData({ name: '', phone: '', item: '', activity: '', activities: [], otherActivity: '', dates: [], adultsCount: 1, kidsCount: 0 });
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  const handleApproveRequest = async (user, collectionName) => {
    if (Date.now() - user.pendingApproval.timestamp > 24 * 60 * 60 * 1000) {
      alert("This request has expired (older than 24 hours).");
      await updateDoc(doc(db, collectionName, user.id), { pendingApproval: null });
      return;
    }
    if (user.pendingApproval.action === 'delete') {
      await deleteDoc(doc(db, collectionName, user.id));
    } else if (user.pendingApproval.action === 'edit') {
      await updateDoc(doc(db, collectionName, user.id), { ...user.pendingApproval.newData, pendingApproval: null });
    }
  };

  const handleRejectRequest = async (user, collectionName) => {
    await updateDoc(doc(db, collectionName, user.id), { pendingApproval: null });
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to request deletion of this enrollment?')) {
      if (isAdmin) {
        await deleteDoc(doc(db, 'poojaEnrollments', id));
      } else {
        await updateDoc(doc(db, 'poojaEnrollments', id), { pendingApproval: { action: 'delete', timestamp: Date.now() } });
        alert("Your delete request has been sent to the admin for approval.");
      }
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
    
    if (isAdmin) {
      await updateDoc(doc(db, 'poojaEnrollments', user.id), { name: newName, phone: newPhone, dates: newDates });
    } else {
      await updateDoc(doc(db, 'poojaEnrollments', user.id), { pendingApproval: { action: 'edit', timestamp: Date.now(), newData: { name: newName, phone: newPhone, dates: newDates } } });
      alert("Your edit request has been sent to the admin for approval.");
    }
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
    if (window.confirm('Are you sure you want to request deletion of this enrollment?')) {
      if (isAdmin) {
        await deleteDoc(doc(db, 'prasadamEnrollments', id));
      } else {
        await updateDoc(doc(db, 'prasadamEnrollments', id), { pendingApproval: { action: 'delete', timestamp: Date.now() } });
        alert("Your delete request has been sent to the admin for approval.");
      }
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
    
    if (isAdmin) {
      await updateDoc(doc(db, 'prasadamEnrollments', user.id), { name: newName, phone: newPhone, item: newItem, dates: newDates });
    } else {
      await updateDoc(doc(db, 'prasadamEnrollments', user.id), { pendingApproval: { action: 'edit', timestamp: Date.now(), newData: { name: newName, phone: newPhone, item: newItem, dates: newDates } } });
      alert("Your edit request has been sent to the admin for approval.");
    }
  };

  const handleDeleteCulturalUser = async (id) => {
    if (window.confirm('Are you sure you want to request deletion of this enrollment?')) {
      if (isAdmin) {
        await deleteDoc(doc(db, 'culturalEnrollments', id));
      } else {
        await updateDoc(doc(db, 'culturalEnrollments', id), { pendingApproval: { action: 'delete', timestamp: Date.now() } });
        alert("Your delete request has been sent to the admin for approval.");
      }
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
    
    if (isAdmin) {
      await updateDoc(doc(db, 'culturalEnrollments', user.id), { name: newName, phone: newPhone, activity: newActivity });
    } else {
      await updateDoc(doc(db, 'culturalEnrollments', user.id), { pendingApproval: { action: 'edit', timestamp: Date.now(), newData: { name: newName, phone: newPhone, activity: newActivity } } });
      alert("Your edit request has been sent to the admin for approval.");
    }
  };

  const handleDeleteAnnadhaanamUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this RSVP?')) {
      await deleteDoc(doc(db, 'annadhaanamEnrollments', id));
    }
  };

  const handleClearAllAnnadhaanam = async () => {
    if (window.confirm('Are you sure you want to clear ALL Annadhaanam RSVPs? This cannot be undone.')) {
      const snap = await getDocs(collection(db, 'annadhaanamEnrollments'));
      snap.forEach(d => deleteDoc(doc(db, 'annadhaanamEnrollments', d.id)));
    }
  };

  const handleEditAnnadhaanamUser = async (user) => {
    const newName = window.prompt("Edit name:", user.name);
    if (newName === null) return;
    const newPhone = window.prompt("Edit phone:", user.phone || '');
    if (newPhone === null) return;
    const newAdultsStr = window.prompt("Edit adults count:", user.adultsCount !== undefined ? user.adultsCount : (user.count || 1));
    if (newAdultsStr === null || isNaN(newAdultsStr)) return;
    const newKidsStr = window.prompt("Edit kids count:", user.kidsCount !== undefined ? user.kidsCount : 0);
    if (newKidsStr === null || isNaN(newKidsStr)) return;
    
    await updateDoc(doc(db, 'annadhaanamEnrollments', user.id), { name: newName, phone: newPhone, adultsCount: Number(newAdultsStr), kidsCount: Number(newKidsStr) });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app-layout">
      {/* Background Audio */}
      <audio ref={audioRef} loop src={ganeshMantraAudio} />

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

      <button 
        onClick={toggleAudio} 
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 9999, 
          background: 'var(--color-accent)', 
          border: 'none', 
          borderRadius: '50%', 
          width: '50px', 
          height: '50px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          color: 'white'
        }}
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

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

        <section id="schedule" className="features-section" ref={scheduleRef}>
          <div className="features-container">
            <h2 className="section-title">Event Schedule & Details</h2>
            <div className="features-grid">
              
              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <Calendar className="feature-icon" size={28} />
                <h3>Idol Placement & First Pooja</h3>
                <p><strong>September 14, 6:30 PM</strong><br/>Regular Poojas will be performed every day at 7:00 PM.</p>
              </div>


              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <Info className="feature-icon" size={28} />
                <h3>Ganesh Immersion</h3>
                <p><strong>September 19th</strong><br/>Starting from 2:00 PM onwards.</p>
              </div>

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
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

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
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

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <Users className="feature-icon" size={28} />
                <h3>Maha Annadhaanam RSVP</h3>
                <p><strong>September 18th</strong><br/>Let us know how many are attending.</p>
                <button className="btn-secondary enroll-btn" onClick={() => setEnrollType('annadhaanam')}>RSVP Now</button>
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowAnnadhaanamEnrolled(true); }} style={{color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem'}}>
                    View RSVPs ({annadhaanamEnrollments.reduce((acc, curr) => acc + (curr.adultsCount !== undefined ? curr.adultsCount + (curr.kidsCount || 0) : curr.count || 1), 0)} people)
                  </a>
                </div>
              </div>

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <Music className="feature-icon" size={28} />
                <h3>Cultural Activities</h3>
                <p><strong>September 18th After Pooja</strong></p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn-secondary enroll-btn" style={{ flex: 1 }} onClick={() => setEnrollType('cultural')}>Enroll</button>
                  <a href="https://chat.whatsapp.com/FJiZ3S2JjvGC93R23C4FU7?s=cl&p=i&mlu=4" target="_blank" rel="noreferrer" className="btn-secondary enroll-btn" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Join Group</a>
                </div>
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowCulturalEnrolled(true); }} style={{color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.9rem'}}>
                    View Participants ({culturalEnrollments.length})
                  </a>
                </div>
              </div>

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <MapPin className="feature-icon" size={28} />
                <h3>Ganesh Mandap Address</h3>
                <p>2702 Garrison Dr,<br/>Melissa, TX 75454</p>
              </div>

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <MessageCircle className="feature-icon" size={28} />
                <h3>More Details</h3>
                <p>Please <a href="https://chat.whatsapp.com/Hw83ka9nJtF7tgiDpuXSvf" target="_blank" rel="noreferrer" style={{color: 'var(--color-accent)', textDecoration: 'underline'}}>join us on WhatsApp</a> for updates and more details.</p>
              </div>

              <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                <Hand className="feature-icon" size={28} />
                <h3>Support the Utsav</h3>
                <p>Donate using the QR code below.</p>
                <img src={qrImage} alt="Donation QR Code" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', margin: '1rem auto', display: 'block' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
                  Scan the above QR using your bank app or Send the payment via Zelle to <a href="tel:7027010443" style={{color: 'var(--color-accent)', textDecoration: 'underline'}}>(702) 701-0443</a> – Puneeth
                </p>
              </div>

              {isAdmin && (
                <div className={`feature-card reveal-on-scroll ${scheduleVisible ? 'is-visible' : ''}`}>
                  <BarChart2 className="feature-icon" size={28} />
                  <h3>Accounts</h3>
                  <p>View budget and expenses</p>
                  <button className="btn-secondary enroll-btn" onClick={() => setShowAccounts(true)}>View Report</button>
                </div>
              )}

            </div>
          </div>
        </section>
      </main>

      {enrollType && (
        <div className="modal-overlay" onClick={() => setEnrollType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {enrollType === 'pooja' ? 'Daily Pooja Enrollment' : enrollType === 'prasadam' ? 'Prasadam Enrollment' : enrollType === 'annadhaanam' ? 'Annadhaanam RSVP' : 'Cultural Activities Enrollment'}
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
              {enrollType === 'annadhaanam' && (
                <>
                  <div className="form-group">
                    <label htmlFor="adultsCount">Number of Adults Attending</label>
                    <input
                      type="number"
                      id="adultsCount"
                      name="adultsCount"
                      value={formData.adultsCount}
                      onChange={handleInputChange}
                      min="0"
                      required
                      placeholder="E.g. 2"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="kidsCount">Number of Kids Attending</label>
                    <input
                      type="number"
                      id="kidsCount"
                      name="kidsCount"
                      value={formData.kidsCount}
                      onChange={handleInputChange}
                      min="0"
                      required
                      placeholder="E.g. 1"
                    />
                  </div>
                </>
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
                    {POOJA_DATES.map(date => {
                      let isFull = false;
                      let countText = '';
                      
                      if (enrollType === 'pooja') {
                        const count = poojaEnrollments.filter(user => user.dates && user.dates.includes(date)).length;
                        const remaining = 8 - count;
                        
                        if (remaining <= 0) {
                          isFull = true;
                          countText = '(Full)';
                        } else {
                          countText = `(${remaining} left)`;
                        }
                      }
                      
                      return (
                        <label key={date} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isFull ? 'not-allowed' : 'pointer', fontSize: '0.9rem', color: isFull ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                          <input 
                            type="checkbox"
                            checked={formData.dates.includes(date)}
                            onChange={() => { if (!isFull) handleDateChange(date); }}
                            disabled={isFull}
                            style={{ width: 'auto' }}
                          />
                          {date} {countText && <span style={{ fontSize: '0.8rem', color: isFull ? '#ff4d4d' : 'var(--color-accent)' }}>{countText}</span>}
                        </label>
                      );
                    })}
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
                        {user.pendingApproval && (
                          <span style={{ color: '#ff9800', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            (Pending {user.pendingApproval.action})
                          </span>
                        )}
                      </div>
                      {isAdmin && user.pendingApproval ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApproveRequest(user, 'poojaEnrollments')} style={{ background: 'var(--color-accent)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Approve</button>
                          <button onClick={() => handleRejectRequest(user, 'poojaEnrollments')} style={{ background: '#ff4d4d', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
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
                        {user.pendingApproval && (
                          <span style={{ color: '#ff9800', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            (Pending {user.pendingApproval.action})
                          </span>
                        )}
                      </div>
                      {isAdmin && user.pendingApproval ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApproveRequest(user, 'prasadamEnrollments')} style={{ background: 'var(--color-accent)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Approve</button>
                          <button onClick={() => handleRejectRequest(user, 'prasadamEnrollments')} style={{ background: '#ff4d4d', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditPrasadamUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePrasadamUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
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
                        {user.pendingApproval && (
                          <span style={{ color: '#ff9800', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            (Pending {user.pendingApproval.action})
                          </span>
                        )}
                      </div>
                      {isAdmin && user.pendingApproval ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApproveRequest(user, 'culturalEnrollments')} style={{ background: 'var(--color-accent)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Approve</button>
                          <button onClick={() => handleRejectRequest(user, 'culturalEnrollments')} style={{ background: '#ff4d4d', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditCulturalUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCulturalUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }} disabled={!!user.pendingApproval}>
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

      {showAnnadhaanamEnrolled && (
        <div className="modal-overlay" onClick={() => setShowAnnadhaanamEnrolled(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Annadhaanam RSVPs</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAdmin && annadhaanamEnrollments.length > 0 && (
                  <button onClick={handleClearAllAnnadhaanam} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Clear All
                  </button>
                )}
                <button className="close-btn" onClick={() => setShowAnnadhaanamEnrolled(false)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="enrolled-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                Total Attending: {annadhaanamEnrollments.reduce((sum, user) => sum + (user.adultsCount !== undefined ? user.adultsCount + (user.kidsCount || 0) : user.count || 1), 0)} (Adults: {annadhaanamEnrollments.reduce((sum, user) => sum + (user.adultsCount !== undefined ? user.adultsCount : user.count || 1), 0)}, Kids: {annadhaanamEnrollments.reduce((sum, user) => sum + (user.kidsCount || 0), 0)})
              </div>
              {annadhaanamEnrollments.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {annadhaanamEnrollments.map(user => (
                    <li key={user.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: '600', flexShrink: 0 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
                        <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>
                          Adults: {user.adultsCount !== undefined ? user.adultsCount : user.count || 1}, Kids: {user.kidsCount || 0}
                        </span>
                        {isAdmin && user.phone && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{user.phone}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditAnnadhaanamUser(user)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteAnnadhaanamUser(user.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No RSVPs yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAccounts && (
        <div className="modal-overlay" onClick={() => { setShowAccounts(false); setIsSuperAdmin(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Accounts Dashboard</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!isSuperAdmin && (
                  <button onClick={() => {
                    const code = prompt('Enter Super Admin Passcode:');
                    if (code === 'SuperCelebrate') {
                      setIsSuperAdmin(true);
                    } else if (code !== null) {
                      alert('Incorrect Passcode');
                    }
                  }} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '0.25rem 0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Super Admin
                  </button>
                )}
                {isSuperAdmin && (
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: 'bold' }}>Super Admin Mode</span>
                )}
                <button className="close-btn" onClick={() => { setShowAccounts(false); setIsSuperAdmin(false); }}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="accounts-dashboard" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Funds</p>
                  <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '2rem', display: 'flex', alignItems: 'center' }}><DollarSign size={24} /> {budgetData.totalFunds}</h2>
                  {isSuperAdmin && (
                    <button onClick={async () => {
                      const newVal = prompt("Enter new Total Funds:", budgetData.totalFunds);
                      if (newVal !== null && !isNaN(newVal)) {
                        const numVal = parseFloat(newVal);
                        await updateDoc(doc(db, 'finances', 'budget'), { totalFunds: numVal });
                      }
                    }} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>Edit Total Funds</button>
                  )}
                </div>
                
                <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Expenses</p>
                  <h2 style={{ margin: 0, color: '#ff4d4d', fontSize: '2rem', display: 'flex', alignItems: 'center' }}><DollarSign size={24} /> {(budgetData.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)}</h2>
                </div>
                
                <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Remaining Funds</p>
                  <h2 style={{ margin: 0, color: '#4ade80', fontSize: '2rem', display: 'flex', alignItems: 'center' }}><DollarSign size={24} /> {budgetData.totalFunds - (budgetData.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)}</h2>
                </div>
              </div>

              {(() => {
                const expenseGroups = (budgetData.expenses || []).reduce((acc, exp) => {
                  acc[exp.description] = (acc[exp.description] || 0) + exp.amount;
                  return acc;
                }, {});
                const pieData = {
                  labels: Object.keys(expenseGroups),
                  datasets: [{
                    data: Object.values(expenseGroups),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8AC926', '#1982C4', '#F15BB5'],
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)'
                  }]
                };

                return (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 250px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-primary)', alignSelf: 'flex-start' }}>Expense Breakdown</h4>
                      {Object.keys(expenseGroups).length > 0 ? (
                        <div style={{ width: '100%', maxWidth: '200px', aspectRatio: '1/1' }}>
                          <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white', font: { size: 10 } } } } }} />
                        </div>
                      ) : (
                        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', margin: 'auto' }}>No expenses yet.</p>
                      )}
                    </div>
                    
                    <div style={{ flex: '2 1 400px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Expense Details</h4>
                        {isSuperAdmin && (
                          <button onClick={async () => {
                            const desc = prompt("Enter expense description:");
                            if (!desc) return;
                            const amtStr = prompt("Enter expense amount:");
                            if (amtStr === null || isNaN(amtStr)) return;
                            const amt = parseFloat(amtStr);
                            
                            const newExpense = { id: Date.now().toString(), description: desc, amount: amt, date: new Date().toLocaleDateString() };
                            const newExpenses = [...(budgetData.expenses || []), newExpense];
                            await updateDoc(doc(db, 'finances', 'budget'), { expenses: newExpenses });
                          }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <Plus size={16} /> Add Expense
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {budgetData.expenses && budgetData.expenses.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                <th style={{ padding: '0.5rem' }}>Date</th>
                                <th style={{ padding: '0.5rem' }}>Description</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                                {isSuperAdmin && <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {budgetData.expenses.map(exp => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{exp.date}</td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{exp.description}</td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'right' }}>${exp.amount}</td>
                                  {isSuperAdmin && (
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                      <button onClick={async () => {
                                        if (window.confirm("Delete this expense?")) {
                                          const newExpenses = budgetData.expenses.filter(e => e.id !== exp.id);
                                          await updateDoc(doc(db, 'finances', 'budget'), { expenses: newExpenses });
                                        }
                                      }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0 }}>No expenses recorded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <footer className="footer-modern" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <div>Liberty Ganesh <span>Committee</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', maxWidth: '500px' }}>
              {['Ravi', 'Ashwin', 'Suresh', 'Vishnu', 'Sukumar', 'Subash', 'Subbu', 'Mastan', 'Ravi Adabala', 'Puneeth', 'Ranjith'].map(name => (
                <span key={name} style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.5px'
                }}>
                  {name}
                </span>
              ))}
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
