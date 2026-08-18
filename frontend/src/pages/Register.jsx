import React, { useState } from 'react';
import { UserPlus, Briefcase, UserCheck, Mail, ShieldCheck, CheckCircle2, Send, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import API from '../config';

const Register = ({ onLoginSuccess, navigateToLogin, initialRole = 'client', initialSpecialty = 'Plumbing' }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchToLogin = () => {
    navigateToLogin();
  };

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole); // 'client' or 'contractor'
  const [specialty, setSpecialty] = useState(initialSpecialty);
  
  // Email OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
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
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email verification code.');
      }
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setError('');
    setVerifyingOtp(true);
    try {
      const response = await fetch(`${API}/api/auth/verify-email-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification code failed.');
      }
      setOtpVerified(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword || !role) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both password fields are identical.');
      return;
    }
    if (!otpVerified) {
      setError('Please verify your email address with the verification code sent to your inbox before completing signup.');
      return;
    }
    if (role === 'contractor' && !specialty) {
      setError('Please select your contractor specialty.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const payload = { 
        username, 
        email: email.trim(), 
        password,
        confirm_password: confirmPassword,
        role 
      };
      if (role === 'contractor') {
        payload.specialty = specialty;
      }

      const response = await fetch(`${API}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMsg = 'Registration failed. Please check inputs.';
        if (data.username) errorMsg = `Username: ${data.username[0]}`;
        else if (data.email) errorMsg = `Email: ${data.email[0]}`;
        else if (data.password) errorMsg = `Password: ${data.password[0]}`;
        else if (data.error) errorMsg = data.error;
        throw new Error(errorMsg);
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

      <div className={`auth-card glass-panel hover-lift intel-stat-card intel-scan-box ${isSwitching ? 'auth-card-cube-out-right' : 'auth-card-cube-in-right'}`} style={{ 
        maxWidth: '520px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Animated Glowing Top Border Strip */}
        <div className="auth-card-top-glow" />

        {/* Decorative Badge */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--secondary)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '0.7rem',
          fontWeight: 800,
          color: 'var(--secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
          zIndex: 6
        }}>
          <ShieldCheck size={14} /> NEW ACCOUNT REGISTRATION
        </div>

        <div className="auth-header" style={{ marginTop: '0.5rem' }}>
          <div className="logo-text" style={{ fontSize: '2.4rem', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <Logo size={46} />
            <span className="logo-brand-name" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.035em' }}>Contrax</span>
          </div>
          <p>Create your account & verify email address</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="animate-shake" style={{
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
          
          {/* Role selector */}
          <div className="form-group">
            <label>I want to register as a:</label>
            <div className="role-selector">
              <div 
                className={`role-option hover-lift ${role === 'client' ? 'selected' : ''}`}
                onClick={() => setRole('client')}
              >
                <UserCheck size={20} style={{ color: role === 'client' ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                <h4>Client</h4>
                <p>Post gig/jobs & hire</p>
              </div>
              <div 
                className={`role-option hover-lift ${role === 'contractor' ? 'selected' : ''}`}
                onClick={() => setRole('contractor')}
              >
                <Briefcase size={20} style={{ color: role === 'contractor' ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                <h4>Contractor</h4>
                <p>Find jobs & sign contracts</p>
              </div>
            </div>
          </div>

          {role === 'contractor' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
              <label htmlFor="specialty">Contractor Specialty / Profession</label>
              <select
                id="specialty"
                className="form-control"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              >
                <option value="Plumbing">Plumbing & Water Systems</option>
                <option value="Electrical">Electrical & Wiring</option>
                <option value="Painting">Painting & Wall Finishes</option>
                <option value="Landscaping">Landscaping & Gardening</option>
                <option value="Cleaning">Home & Office Cleaning</option>
                <option value="Pest Control">Pest Control Services</option>
                <option value="HVAC">HVAC & AC Maintenance</option>
                <option value="Furniture">Furniture & Carpentry</option>
                <option value="Water Tank Cleaning">Water Tank Cleaning</option>
                <option value="Security">Security & Surveillance</option>
                <option value="On-Demand Delivery">On-Demand Delivery & Transport</option>
                <option value="General">General Contractor Services</option>
                <option value="Client">Client</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Pick a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email Address & SMTP Verification Section */}
          <div className="form-group" style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Mail size={16} style={{ color: 'var(--primary)' }} /> Email Address (Verification)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpVerified(false);
                  setOtpSent(false);
                }}
                disabled={otpVerified}
                required
              />
              {!otpVerified && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleSendEmailOtp}
                  disabled={sendingOtp || !email}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {sendingOtp ? 'Sending...' : (otpSent ? 'Resend Code' : 'Send Code')}
                </button>

              )}
            </div>

            {/* Email OTP Sent banner */}
            {otpSent && !otpVerified && (
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
                      A 6-digit verification code has been sent directly to <strong>{email}</strong> via email. Check your inbox and enter the code below.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit email code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyEmailOtp}
                    disabled={verifyingOtp || !otpCode}
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 1.25rem', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', fontWeight: 700 }}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Email OTP Verified badge */}
            {otpVerified && (
              <div style={{
                marginTop: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#10b981',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                <CheckCircle2 size={18} /> Email Address Verified via SMTP!
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Complete Signup
              </>
            )}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span 
            className="auth-switch-link"
            onClick={handleSwitchToLogin}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
