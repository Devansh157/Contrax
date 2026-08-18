import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, User, Award, Sun, Moon, Wallet, Bell, Clock, Plus, ArrowUpRight, X, Menu, UserCheck, Mail, Phone, Key, Edit3 } from 'lucide-react';
import Logo from './Logo';
import API from '../config';

const Navbar = ({
  user,
  token,
  onLogout,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  showToast,
  fetchCurrentUser,
  navigateToHome,
  navigateToLogin,
  navigateToRegister
}) => {
  const [walletOpen, setWalletOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Update modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    bio: '',
    specialty: '',
    profile_picture: '',
    password: ''
  });

  const handleOpenProfileModal = () => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      bio: user?.bio || '',
      specialty: user?.specialty || '',
      profile_picture: user?.profile_picture || '',
      password: ''
    });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch(`${API}/api/auth/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          action: 'update_profile',
          ...profileForm
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        showToast && showToast("Account details updated successfully!", "success");
        localStorage.setItem('contractgo_user', JSON.stringify(updatedUser));
        if (fetchCurrentUser) fetchCurrentUser();
        setShowProfileModal(false);
      } else {
        const errData = await res.json();
        showToast && showToast(errData.error || "Failed to update profile details", "danger");
      }
    } catch (err) {
      console.error("Update profile details error:", err);
      showToast && showToast("Server communication error", "danger");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleMobileNavClick = (tab) => {
    setActiveTab && setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const notifRef = useRef(null);
  const walletRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target)) {
        setWalletOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch contracts for dynamic notifications
  useEffect(() => {
    if (!token) return;
    const fetchContracts = async () => {
      try {
        const res = await fetch(`${API}/api/contracts/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContracts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch notification contracts:", err);
      }
    };

    fetchContracts();
    const interval = setInterval(fetchContracts, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Generate dynamic notification items based on contract statuses
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const notifications = safeContracts
    .slice(0, 5)
    .map(c => {
      let message = '';
      let time = new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let type = 'info';

      if (c.status === 'searching') {
        message = `Searching contractor for "${c.title}"`;
        type = 'info';
      } else if (c.status === 'offered') {
        message = `Contractor matched for "${c.title}". Pending double digital signature.`;
        type = 'warning';
      } else if (c.status === 'active') {
        message = `Contract "${c.title}" is active. Contractor moving towards target.`;
        type = 'info';
      } else if (c.status === 'completed') {
        message = `Work completed for "${c.title}". Awaiting escrow release.`;
        type = 'success';
      } else if (c.status === 'approved') {
        message = `Funds released! Contract "${c.title}" closed successfully.`;
        type = 'success';
      } else if (c.status === 'cancelled') {
        message = `Contract "${c.title}" was cancelled and escrow funds refunded.`;
        type = 'danger';
      }

      return {
        id: c.id,
        message,
        time,
        status: c.status,
        type
      };
    })
    .filter(n => n.message);

  // Notifications that require action (bell badge count)
  const actionRequiredCount = safeContracts.filter(c =>
    (user?.role === 'client' && c.status === 'completed') ||
    (c.status === 'offered' && ((user?.role === 'client' && !c.client_signature) || (user?.role === 'contractor' && !c.contractor_signature)))
  ).length;

  const handleWalletAction = async (action) => {
    const valAmount = parseFloat(amount);
    if (!amount || isNaN(amount) || valAmount <= 0) {
      showToast("Please enter a valid positive number.", "danger");
      return;
    }
    if (action === 'withdraw') {
      const MIN_WITHDRAW = 100.0;
      if (valAmount < MIN_WITHDRAW) {
        showToast(`Minimum withdrawal amount is ₹${MIN_WITHDRAW.toFixed(2)}.`, "danger");
        return;
      }
      if (user.wallet_balance < valAmount) {
        showToast("Insufficient funds in your wallet.", "danger");
        return;
      }
    }
    setWalletLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ action, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          action === 'top_up'
            ? `Successfully topped up ₹${amount} into your wallet!`
            : `Successfully withdrew ₹${amount} to your bank!`,
          'success'
        );
        setAmount('');
        setWalletOpen(false);
        fetchCurrentUser();
      } else {
        showToast(data.error || "Wallet transaction failed.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error executing transaction.", "danger");
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Brand Logo */}
        <div
          className="logo-text"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          onClick={() => {
            if (user) {
              setActiveTab && setActiveTab('dashboard');
            } else if (navigateToHome) {
              navigateToHome();
            }
          }}
        >
          <Logo size={36} />
          <span className="logo-brand-name" style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Contrax</span>
        </div>

        {/* DESKTOP NAV CONTENT (Hidden on mobile via CSS) */}
        <div className="desktop-nav-content">
          {!user ? (
            /* Guest Nav Items */
            <>
              <div className="guest-nav-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span
                  className="nav-link-item"
                  onClick={() => navigateToHome && navigateToHome()}
                >
                  Home
                </span>
                <a href="#features" className="nav-link-item">
                  Features
                </a>
                <a href="#how-it-works" className="nav-link-item">
                  How It Works
                </a>
              </div>

              {/* Theme Selector (Single Desktop Instance) */}
              <button
                className="theme-toggle-btn"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title="Toggle Theme Mode"
                type="button"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} style={{ color: 'var(--primary)' }} />}
              </button>

              <button
                className="btn btn-outline"
                style={{ padding: '0.45rem 1.1rem', fontSize: '0.88rem' }}
                onClick={navigateToLogin}
              >
                Sign In
              </button>

              <button
                className="btn btn-primary"
                style={{ padding: '0.45rem 1.25rem', fontSize: '0.88rem', fontWeight: 700 }}
                onClick={navigateToRegister}
              >
                Get Started
              </button>
            </>
          ) : (
            /* Logged-In User Nav Items */
            <>
              {!(user.role === 'admin' || user.is_superuser) && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span
                    className={`nav-link-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    {user.role === 'client' ? 'Request Service' : 'Find Jobs'}
                  </span>

                  <span
                    className={`nav-link-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    {user.role === 'client' ? 'My Requests' : 'My Deliveries'}
                  </span>

                  <span
                    className={`nav-link-item ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </span>
                </div>
              )}

              <div className="nav-links" style={{ gap: '1rem', alignItems: 'center' }}>
                {/* Wallet Info Badge */}
                {!(user.role === 'admin' || user.is_superuser) && (
                  <div className="wallet-badge-card" onClick={() => setWalletOpen(true)}>
                    <Wallet size={16} />
                    <span>₹{Number(user?.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Notification Bell Dropdown */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    className="theme-toggle-btn"
                    onClick={() => setNotifOpen(!notifOpen)}
                    style={{ position: 'relative' }}
                  >
                    <Bell size={20} />
                    {actionRequiredCount > 0 && (
                      <span className="notification-badge">{actionRequiredCount}</span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="glass-panel notification-dropdown" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>System Notifications</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setNotifOpen(false)}>Close</span>
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No active notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>{n.message}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Theme Selector */}
                <button
                  className="theme-toggle-btn"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title="Toggle Theme Mode"
                  type="button"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} style={{ color: 'var(--primary)' }} />}
                </button>

                {/* Profile Details */}
                <div 
                  className="user-profile-badge" 
                  style={{ padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={handleOpenProfileModal}
                  title="Click to update profile & account details"
                >
                  <User size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.username}</span>
                  <span className={`role-badge ${user.role}`} style={{ fontSize: '0.65rem', backgroundColor: user.role === 'admin' || user.is_superuser ? 'var(--danger)' : undefined, color: user.role === 'admin' || user.is_superuser ? 'white' : undefined }}>
                    {user.role === 'admin' || user.is_superuser ? 'ADMIN' : user.role}
                  </span>
                  {user.role === 'contractor' && (
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Award size={12} /> {user.rating}★
                    </span>
                  )}
                  <Edit3 size={12} style={{ opacity: 0.6, marginLeft: '0.15rem', color: 'var(--text-muted)' }} />
                </div>

                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onLogout}>
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>

        {/* MOBILE CONTROLS (Shown ONLY on Mobile <= 960px via CSS) */}
        <div className="mobile-controls-container">
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle Theme Mode"
            type="button"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} style={{ color: 'var(--primary)' }} />}
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {!user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <span
              style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', padding: '0.55rem 0.85rem', borderRadius: '8px' }}
              onClick={() => { setMobileMenuOpen(false); navigateToHome && navigateToHome(); }}
            >
              Home
            </span>
            <a
              href="#features"
              style={{ textDecoration: 'none', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', padding: '0.55rem 0.85rem', borderRadius: '8px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{ textDecoration: 'none', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', padding: '0.55rem 0.85rem', borderRadius: '8px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
            <button
              className="btn btn-outline btn-block"
              style={{ padding: '0.75rem', fontSize: '0.95rem' }}
              onClick={() => { setMobileMenuOpen(false); navigateToLogin(); }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary btn-block"
              style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}
              onClick={() => { setMobileMenuOpen(false); navigateToRegister(); }}
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {!(user.role === 'admin' || user.is_superuser) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTab === 'dashboard' ? '700' : '500',
                    color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '1.05rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: activeTab === 'dashboard' ? 'rgba(250,204,21,0.06)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleMobileNavClick('dashboard')}
                >
                  {user.role === 'client' ? 'Request Service' : 'Find Jobs'}
                </span>

                <span
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTab === 'history' ? '700' : '500',
                    color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '1.05rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: activeTab === 'history' ? 'rgba(250,204,21,0.06)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleMobileNavClick('history')}
                >
                  {user.role === 'client' ? 'My Requests' : 'My Deliveries'}
                </span>

                <span
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTab === 'analytics' ? '700' : '500',
                    color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '1.05rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: activeTab === 'analytics' ? 'rgba(250,204,21,0.06)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleMobileNavClick('analytics')}
                >
                  Analytics
                </span>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

            {/* Quick Stats & Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Wallet Info Badge */}
              {!(user.role === 'admin' || user.is_superuser) && (
                <div
                  className="wallet-badge-card"
                  onClick={() => {
                    setWalletOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  style={{ padding: '0.75rem 1.25rem', fontSize: '1rem', width: '100%', justifyContent: 'center' }}
                >
                  <Wallet size={18} />
                  <span>₹{user.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* Profile Card */}
              <div className="user-profile-badge" style={{ padding: '0.75rem 1.25rem', width: '100%', justifyContent: 'center', gap: '0.75rem', background: 'var(--bg-primary)' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{user.username}</span>
                <span className={`role-badge ${user.role}`} style={{ fontSize: '0.75rem' }}>
                  {user.role}
                </span>
                {user.role === 'contractor' && (
                  <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Award size={14} /> {user.rating}★
                  </span>
                )}
              </div>

              <button
                className="btn btn-outline btn-block"
                style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Wallet Management Overlay Modal */}
      {walletOpen && (
        <div className="wallet-modal-overlay" onClick={() => setWalletOpen(false)}>
          <div className="wallet-modal-card" onClick={e => e.stopPropagation()} ref={walletRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <Wallet style={{ color: 'var(--success)' }} />
                Escrow Wallet
              </h3>
              <button
                onClick={() => setWalletOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.1)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Available Balance</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--success)', marginTop: '0.25rem' }}>
                ₹{user?.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {user?.role === 'client'
                  ? "This balance is held in Escrow when creating service requests."
                  : "Earnings from completed jobs accumulate here for withdrawal."}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="wallet-amount" style={{ fontWeight: 600, margin: 0 }}>Amount (INR / ₹)</label>
                <button
                  type="button"
                  onClick={() => setAmount(user?.wallet_balance?.toString() || '')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: 0 }}
                >
                  Withdraw All
                </button>
              </div>
              <input
                type="number"
                id="wallet-amount"
                className="form-control"
                placeholder="e.g. 1000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: 0 }}>
                Withdrawal limit: Min ₹100.00 per transaction
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {user?.role === 'client' && (
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, backgroundColor: 'var(--success)', color: 'white' }}
                  onClick={() => handleWalletAction('top_up')}
                  disabled={walletLoading}
                >
                  <Plus size={16} /> Top Up
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleWalletAction('withdraw')}
                disabled={walletLoading}
              >
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
      {/* UPDATE PROFILE MODAL */}
      {showProfileModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
        >
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '580px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(239, 68, 68, 0.1))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Update Account Details
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Modify your username, email, mobile number, bio, and security credentials
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
              
              {/* Profile Avatar & Image Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <img 
                  src={profileForm.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.username || 'User'}`} 
                  alt="User Avatar" 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.username || 'User'}`; }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Profile Picture URL (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileForm.profile_picture}
                    onChange={e => setProfileForm(prev => ({ ...prev, profile_picture: e.target.value }))}
                    className="form-control"
                    style={{ fontSize: '0.82rem', height: '36px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Username *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      required
                      value={profileForm.username}
                      onChange={e => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={profileForm.phone_number}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Specialty / Designation
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Master Plumber / Home Owner"
                    value={profileForm.specialty}
                    onChange={e => setProfileForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="form-control"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Bio / Profile Summary
                </label>
                <textarea 
                  rows="2"
                  placeholder="Share a short intro about your background or service specializations..."
                  value={profileForm.bio}
                  onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-control"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  New Password (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep existing password"
                    value={profileForm.password}
                    onChange={e => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-control"
                    style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                  />
                  <Key size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Must be at least 6 characters long if changing.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#0b0f19', fontWeight: 800 }}
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
