const fs = require('fs');

const appJsxPath = 'src/App.jsx';
let content = fs.readFileSync(appJsxPath, 'utf8');

const b1 = `import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info, Trash2, Edit2, Gift, Hand } from 'lucide-react';
import './App.css';`;
const r1 = `import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Calendar, MapPin, Music, Phone, MessageCircle, Info, Trash2, Edit2, Gift, Hand } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';`;
content = content.replace(b1, r1);

const b1a = `  const [poojaEnrollments, setPoojaEnrollments] = useState(() => {
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
  });`;
const r1a = `  const [poojaEnrollments, setPoojaEnrollments] = useState([]);
  const [prasadamEnrollments, setPrasadamEnrollments] = useState([]);`;
content = content.replace(b1a, r1a);

const b2 = `  useEffect(() => {
    localStorage.setItem('poojaEnrollments', JSON.stringify(poojaEnrollments));
  }, [poojaEnrollments]);

  useEffect(() => {
    localStorage.setItem('prasadamEnrollments', JSON.stringify(prasadamEnrollments));
  }, [prasadamEnrollments]);`;
const r2 = `  useEffect(() => {
    const unsubscribePooja = onSnapshot(collection(db, 'poojaEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPoojaEnrollments(data);
    });
    const unsubscribePrasadam = onSnapshot(collection(db, 'prasadamEnrollments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrasadamEnrollments(data);
    });
    return () => {
      unsubscribePooja();
      unsubscribePrasadam();
    };
  }, []);`;
content = content.replace(b2, r2);

const b3 = `  const handleEnrollSubmit = (e) => {
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
    alert(\`Thank you, \${formData.name}! You have successfully enrolled for \${enrollType === 'pooja' ? 'Daily Pooja' : 'Prasadam'}.\`);
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
  };`;
const r3 = `  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      if (enrollType === 'pooja') {
        if (formData.dates.length === 0) {
          alert("Please select at least one date.");
          return;
        }
        await addDoc(collection(db, 'poojaEnrollments'), { name: formData.name, phone: formData.phone, dates: formData.dates });
      } else if (enrollType === 'prasadam') {
        await addDoc(collection(db, 'prasadamEnrollments'), { name: formData.name, phone: formData.phone, item: formData.item });
      }
      alert(\`Thank you, \${formData.name}! You have successfully enrolled for \${enrollType === 'pooja' ? 'Daily Pooja' : 'Prasadam'}.\`);
      setEnrollType(null);
      setFormData({ name: '', phone: '', item: '', dates: [] });
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
  };`;
content = content.replace(b3, r3);

const b4 = `  const handleDeletePrasadamUser = (id) => {
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
  };`;
const r4 = `  const handleDeletePrasadamUser = async (id) => {
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
    
    await updateDoc(doc(db, 'prasadamEnrollments', user.id), { name: newName, phone: newPhone, item: newItem });
  };`;
content = content.replace(b4, r4);

fs.writeFileSync(appJsxPath, content, 'utf8');
console.log("App.jsx successfully patched via Node.");
