import React, { useState } from 'react';
import { LogIn, KeyRound, User as UserIcon, Mail, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import Logo from '../components/Logo';
import API from '../config';

const Login = ({ onLoginSuccess, navigateToRegister }) => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchToRegister = () => {
    navigateToRegister();
  };
  
  // Password auth state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Email OTP auth state
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const response = await fetch(`${API}/api/auth/send-email-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), is_login: true })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email.');
      }
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let payload = {};
      if (loginMethod === 'otp') {
        if (!email || !otpCode) {
          throw new Error('Please enter your email address and verification code.');
        }
        payload = { email: email.trim(), otp: otpCode.trim() };
      } else {
        if (!username || !password) {
          throw new Error('Please enter username and password.');
        }
        payload = { username, password };
      }

      const response = await fetch(`${API}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }
      
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle Interactive Regulatory Data Telemetry Grid */}
      <div className="intel-grid-bg"></div>

      <div className={`auth-card glass-panel hover-lift intel-stat-card intel-scan-box ${isSwitching ? 'auth-card-cube-out-left' : 'auth-card-cube-in-left'}`} style={{ 
        maxWidth: '440px', 
        position: 'relative',
        zIndex: 1
      }}>
        {/* Animated Glowing Top Border Strip */}
        <div className="auth-card-top-glow" />

        {/* Decorative Badge */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '20px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--primary)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '0.7rem',
          fontWeight: 800,
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
          zIndex: 6
        }}>
          <ShieldCheck size={14} /> SECURE CONTRACTS
        </div>

        <div className="auth-header" style={{ marginTop: '0.5rem' }}>
          <div className="logo-text" style={{ fontSize: '2.4rem', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <Logo size={46} />
            <span className="logo-brand-name" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.035em' }}>Contrax</span>
          </div>
          <p>Gig-Contracts at the Speed of Ride-Hailing</p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loginMethod === 'password' ? 'var(--primary)' : 'transparent',
              color: loginMethod === 'password' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              setLoginMethod('password');
              setError('');
            }}
          >
            Password Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loginMethod === 'otp' ? '#10b981' : 'transparent',
              color: loginMethod === 'otp' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              setLoginMethod('otp');
              setError('');
            }}
          >
            Email OTP Login
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          
          {loginMethod === 'password' ? (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="emailLogin">Email Address</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      id="emailLogin"
                      className="form-control"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setOtpSent(false);
                      }}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleSendEmailOtp}
                    disabled={sendingOtp || !email}
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    {sendingOtp ? 'Sending...' : (otpSent ? 'Resend Code' : 'Send Code')}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div style={{ marginTop: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Send size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>Verification Email Sent!</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        A 6-digit verification code has been sent to <strong>{email}</strong>. Check your inbox and enter the code below.
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="otpCode">6-Digit Verification Code</label>
                    <input
                      type="text"
                      id="otpCode"
                      className="form-control"
                      placeholder="Enter 6-digit verification code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            style={{ 
              marginTop: '1rem',
              backgroundColor: loginMethod === 'otp' ? '#10b981' : undefined,
              borderColor: loginMethod === 'otp' ? '#10b981' : undefined
            }} 
            disabled={loading}
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={18} /> {loginMethod === 'otp' ? 'Verify Code & Login' : 'Sign In'}
              </>
            )}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <span 
            className="auth-switch-link"
            onClick={handleSwitchToRegister}
          >
            Sign up now
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
