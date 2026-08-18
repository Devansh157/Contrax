import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import API from './config';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import ContractDetails from './pages/ContractDetails';
import AdminDashboard from './pages/AdminDashboard';
import MechanicalToolsBackground from './components/MechanicalToolsBackground';
import Logo from './components/Logo';
import { ShieldCheck, Lock, Cpu, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import HomePage from './pages/HomePage';



function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [page, setPage] = useState('home'); // 'home', 'login', 'register', 'dashboard', 'contract-details'

  const [selectedContractId, setSelectedContractId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'analytics'
  const [theme, setTheme] = useState(localStorage.getItem('contractgo_theme') || 'light');
  const [toasts, setToasts] = useState([]);

  // Toast notification system
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync theme to document Element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('contractgo_theme', theme);
  }, [theme]);

  // Sync user profile data from backend
  const fetchCurrentUser = async (authToken = token) => {
    const activeToken = authToken || token;
    if (!activeToken) return;
    try {
      const res = await fetch(`${API}/api/auth/user/`, {
        headers: { 'Authorization': `Token ${activeToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('contractgo_user', JSON.stringify(userData));
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
        setToken('');
        localStorage.removeItem('contractgo_user');
        localStorage.removeItem('contractgo_token');
        setPage('home');
      }
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  };

  // Load auth state from LocalStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('contractgo_user');
      const storedToken = localStorage.getItem('contractgo_token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setUser(parsedUser);
          setToken(storedToken);
          setPage('dashboard');
          setActiveTab('dashboard');
          fetchCurrentUser(storedToken);
        } else {
          localStorage.removeItem('contractgo_user');
          localStorage.removeItem('contractgo_token');
        }
      }
    } catch (err) {
      console.error("Failed to load stored user from localStorage:", err);
      localStorage.removeItem('contractgo_user');
      localStorage.removeItem('contractgo_token');
    }
  }, []);

  // Poll user wallet balance and rating periodically
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchCurrentUser();
    }, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('contractgo_user', JSON.stringify(userData));
    localStorage.setItem('contractgo_token', userToken);
    setPage('dashboard');
    setActiveTab('dashboard');
    showToast(`Welcome back, ${userData.username}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('contractgo_user');
    localStorage.removeItem('contractgo_token');
    setPage('home');
    setActiveTab('dashboard');
    showToast("Successfully logged out.", "info");
  };

  const [registerParams, setRegisterParams] = useState({ role: 'client', specialty: 'Plumbing' });

  const handleNavigateToRegister = (role = 'client', specialty = 'Plumbing') => {
    setRegisterParams({ role, specialty });
    setPage('register');
  };

  const selectContract = (contractId) => {
    setSelectedContractId(contractId);
    setPage('contract-details');
  };

  const renderPage = () => {
    if (!user) {
      if (page === 'register') {
        return (
          <Register
            onLoginSuccess={handleLoginSuccess}
            navigateToLogin={() => setPage('login')}
            initialRole={registerParams.role}
            initialSpecialty={registerParams.specialty}
          />
        );
      }
      if (page === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} navigateToRegister={handleNavigateToRegister} />;
      }
      return <HomePage navigateToLogin={() => setPage('login')} navigateToRegister={handleNavigateToRegister} />;
    }

    switch (page) {
      case 'dashboard':
        if (user.role === 'admin' || user.is_superuser) {
          return (
            <AdminDashboard
              token={token}
              user={user}
              onSelectContract={selectContract}
              activeTab={activeTab}
              setActiveTab={handleNavbarNavigate}
              showToast={showToast}
              fetchCurrentUser={fetchCurrentUser}
            />
          );
        }
        return user.role === 'client' ? (
          <ClientDashboard
            token={token}
            user={user}
            onSelectContract={selectContract}
            activeTab={activeTab}
            setActiveTab={handleNavbarNavigate}
            showToast={showToast}
            fetchCurrentUser={fetchCurrentUser}
          />
        ) : (
          <ContractorDashboard
            token={token}
            user={user}
            onSelectContract={selectContract}
            activeTab={activeTab}
            setActiveTab={handleNavbarNavigate}
            showToast={showToast}
            fetchCurrentUser={fetchCurrentUser}
          />
        );

      case 'contract-details':
        return (
          <ContractDetails
            contractId={selectedContractId}
            user={user}
            token={token}
            onBack={() => setPage('dashboard')}
            showToast={showToast}
            fetchCurrentUser={fetchCurrentUser}
          />
        );

      default:
        return <div>Page not found</div>;
    }
  };

  const handleNavbarNavigate = (tab) => {
    setActiveTab(tab);
    if (page !== 'dashboard') {
      setPage('dashboard');
    }
  };

  return (
    <div className="app-container">


      {/* Background Animated Mechanical & Contracting Tools */}
      <MechanicalToolsBackground />

      <Navbar
        user={user}
        token={token}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleNavbarNavigate}
        theme={theme}
        setTheme={setTheme}
        showToast={showToast}
        fetchCurrentUser={fetchCurrentUser}
        navigateToHome={() => setPage('home')}
        navigateToLogin={() => setPage('login')}
        navigateToRegister={handleNavigateToRegister}
      />

      <main className="main-content">
        <div key={page} className="animate-page-slide">
          {renderPage()}
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '3.5rem 2rem 2rem 2rem',
        marginTop: 'auto',
        color: 'var(--text-secondary)',
        fontSize: '0.88rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: About & Vector Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Logo size={36} />
              <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Contrax
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              A high-security, legally binding micro-contract ecosystem. Streamlining service requests, digital signature pads, escrow wallet protection, and real-time project analytics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <ShieldCheck size={13} /> Escrow Protected
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Lock size={13} /> SSL Sealed
              </span>
            </div>
          </div>

          {/* Col 2: Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h5 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Core Features
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Direct Contractor Booking</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Escrow Budget Protection</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Double Digital Signatures</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> CSV Suggestion Autocomplete</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Performance Analytics Chart</li>
            </ul>
          </div>

          {/* Col 3: Semester Project Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h5 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} /> Academic Info
            </h5>
            <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <span><strong style={{ color: 'var(--text-primary)' }}>Project:</strong> Semester 4 Engineering Project</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>Domain:</strong> Web Application Development</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>License:</strong> Academic / Open Source</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>Version:</strong> v2.4.0 (Stable Release)</span>
            </div>
          </div>

          {/* Col 4: Technology Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h5 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} style={{ color: 'var(--primary)' }} /> System Tech Stack
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.1rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(97, 218, 251, 0.12)', color: '#61dafb', border: '1px solid rgba(97, 218, 251, 0.3)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                ⚛️ React.js
              </span>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(189, 52, 254, 0.12)', color: '#bd34fe', border: '1px solid rgba(189, 52, 254, 0.3)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                ⚡ Vite
              </span>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                🐍 Django REST
              </span>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                🗄️ SQLite3
              </span>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(250, 204, 21, 0.12)', color: 'var(--primary)', border: '1px solid rgba(250, 204, 21, 0.3)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                🎨 Vanilla CSS
              </span>
            </div>
          </div>
        </div>

        {/* Copyright Divider & Bottom Bar */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>&copy; {new Date().getFullYear()} Contrax Systems Inc. All Rights Reserved.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
            System Operational • Semester 4 Engineering Project
          </span>
        </div>
      </footer>


      {/* Floating Toast Notification Alerts */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`alert-toast toast-item ${toast.type}`}
            style={{ pointerEvents: 'auto', position: 'relative', bottom: 'auto', right: 'auto', margin: 0, overflow: 'hidden' }}
          >
            <span>{toast.message}</span>
            <div className="toast-progress-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

