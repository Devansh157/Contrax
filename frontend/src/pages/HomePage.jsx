import React, { useState } from 'react';
import {
  ShieldCheck, Briefcase, Zap, CheckCircle2, FileText, Lock, Clock, Wallet,
  ArrowRight, Users, Star, Award, Sparkles, Layers, TrendingUp, ChevronRight, UserPlus, LogIn, Wrench, Hammer, Compass, AlertCircle, X, Shield
} from 'lucide-react';
import Logo from '../components/Logo';
import ContractorHeroVisualizer from '../components/ContractorHeroVisualizer';

const HomePage = ({ navigateToLogin, navigateToRegister }) => {
  const [activeRoleTab, setActiveRoleTab] = useState('client');
  const [selectedService, setSelectedService] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Popular Services List for Instant Booking Preview
  const services = [
    { id: 1, name: 'Emergency Plumbing Repair', category: 'Plumbing', price: '₹1,500', time: 'Est. 45 mins', icon: <Wrench color="var(--primary)" size={24} />, tags: ['Escrow Protected', 'Instant Match'] },
    { id: 2, name: 'Electrical Wiring & Check', category: 'Electrical', price: '₹2,000', time: 'Est. 60 mins', icon: <Zap color="var(--secondary)" size={24} />, tags: ['Verified Pro', 'Digital Signed'] },
    { id: 3, name: 'Structural Masonry & Repair', category: 'Construction', price: '₹5,000', time: 'Est. 3 hrs', icon: <Hammer color="#f59e0b" size={24} />, tags: ['Milestone Payout', 'Zero Risk'] },
    { id: 4, name: 'Architectural Plan Drafting', category: 'Architecture', price: '₹3,500', time: 'Est. 24 hrs', icon: <Compass color="#10b981" size={24} />, tags: ['CSV Export', 'Escrow Vault'] },
    { id: 5, name: 'HVAC Air Conditioning', category: 'HVAC', price: '₹2,500', time: 'Est. 90 mins', icon: <Wrench color="#2563eb" size={24} />, tags: ['Verified Contractor', 'Insured'] },
    { id: 6, name: 'Commercial Deep Cleaning', category: 'Cleaning', price: '₹1,800', time: 'Est. 2 hrs', icon: <Sparkles color="#ec4899" size={24} />, tags: ['100% Satisfaction', 'Instant Release'] }
  ];

  const handleBookClick = (service) => {
    setSelectedService(service);
    setShowAuthModal(true);
  };

  const handleProceedRegister = (role = 'client', specialty = 'Plumbing') => {
    setShowAuthModal(false);
    if (navigateToRegister) {
      navigateToRegister(role, specialty);
    }
  };

  const handleProceedLogin = () => {
    setShowAuthModal(false);
    if (navigateToLogin) {
      navigateToLogin();
    }
  };

  return (
    <div className="home-page-container">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-pulse-glow">
            <Sparkles size={16} color="var(--primary)" />
            <span>Next-Gen Micro-Contracting Ecosystem</span>
          </div>

          <h1 className="hero-title">
            Legal Gig-Contracts at the Speed of <span className="hero-highlight">Ride-Hailing</span>
          </h1>

          <p className="hero-subtitle">
            Instantly connect with verified contractors, lock funds in secure escrow vaults, and sign cryptographically binding micro-agreements in seconds.
          </p>

          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => handleProceedRegister('client')}>
              <UserPlus size={18} />
              <span>Book Service</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-hero-secondary" onClick={() => handleProceedRegister('contractor')}>
              <Briefcase size={18} />
              <span>Become Pro</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="hero-metrics">
            <div className="metric-item">
              <div className="metric-number">8,940+</div>
              <div className="metric-label">Contracts Executed</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-number">₹2.4M+</div>
              <div className="metric-label">Escrow Protected</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-number">99.8%</div>
              <div className="metric-label">Dispute Resolution Rate</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-number">4.9/5</div>
              <div className="metric-label">Contractor Rating</div>
            </div>
          </div>
        </div>

        {/* Contractor Radar Visualizer Card on Right */}
        <div className="hero-visualizer-wrapper">
          <ContractorHeroVisualizer />
        </div>
      </section>

      {/* POPULAR SERVICES & INSTANT BOOKING SECTION */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-tag">ON-DEMAND SERVICES</div>
          <h2 className="section-title">Book Verified Micro-Contracts Instantly</h2>
          <p className="section-subtitle">Select a service below to lock funds in escrow and dispatch the nearest verified contractor.</p>
        </div>

        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-card">
              <div className="service-card-header">
                <div className="service-icon-box">{s.icon}</div>
                <div className="service-price-tag">{s.price} <span className="price-sub">Escrow</span></div>
              </div>

              <h3 className="service-title">{s.name}</h3>
              <div className="service-time">{s.time} • Specialty: <strong>{s.category}</strong></div>

              <div className="service-tags-row">
                {s.tags.map((t, idx) => (
                  <span key={idx} className="service-tag-pill">{t}</span>
                ))}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="home-section section-alt">
        <div className="section-header">
          <div className="section-tag">WHY CONTRAX</div>

          <h2 className="section-title">Built for Trust, Speed & Uncompromising Security</h2>
          <p className="section-subtitle">Discover how Contrax replaces slow traditional contracts with instant escrow vaults, digital signatures, and live GPS dispatch.</p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-amber">
                <Zap size={24} />
              </div>
              <span className="feature-category-pill pill-amber">DISPATCH</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">On-Demand Dispatch</h3>
              <p className="feature-desc">Instant contractor matching based on specialty & GPS proximity.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="var(--primary)" /> GPS Proximity Radius</li>
                <li><CheckCircle2 size={14} color="var(--primary)" /> Real-Time Navigation</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <Clock size={12} color="var(--primary)" />
                <span>&lt; 45s Auto-Match</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-cyan">
                <ShieldCheck size={24} />
              </div>
              <span className="feature-category-pill pill-cyan">ESCROW</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">Zero-Trust Escrow</h3>
              <p className="feature-desc">Funds locked safely in smart escrow until milestone sign-off.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="var(--secondary)" /> 100% Money-Back Guarantee</li>
                <li><CheckCircle2 size={14} color="var(--secondary)" /> Milestone Payout Release</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <Lock size={12} color="var(--secondary)" />
                <span>₹2.4M+ Secured</span>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-green">
                <FileText size={24} />
              </div>
              <span className="feature-category-pill pill-green">SECURITY</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">Digital Signatures</h3>
              <p className="feature-desc">Dual touch signature pad with legally binding SHA-256 seals.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="var(--success)" /> Dual Touch Signature Pad</li>
                <li><CheckCircle2 size={14} color="var(--success)" /> SHA-256 Hash Seals</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <FileText size={12} color="var(--success)" />
                <span>100% Legally Binding</span>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-blue">
                <TrendingUp size={24} />
              </div>
              <span className="feature-category-pill pill-blue">ANALYTICS</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">Real-Time Analytics</h3>
              <p className="feature-desc">Track job progress radar, wallet spend, & rating metrics.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="var(--info)" /> Progress Trend Charts</li>
                <li><CheckCircle2 size={14} color="var(--info)" /> CSV Data Export</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <TrendingUp size={12} color="var(--info)" />
                <span>Live Analytics</span>
              </div>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-purple">
                <Sparkles size={24} />
              </div>
              <span className="feature-category-pill pill-purple">SMART AI</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">AI Autocomplete</h3>
              <p className="feature-desc">Smart engine predicting budget, clauses, & contract terms.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="#8b5cf6" /> Predictive Estimator</li>
                <li><CheckCircle2 size={14} color="#8b5cf6" /> Standardized Templates</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <Sparkles size={12} color="#8b5cf6" />
                <span>Smart Auto-Fill</span>
              </div>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="square-feature-card">
            <div className="feature-card-top">
              <div className="feature-icon-wrapper icon-emerald">
                <Wallet size={24} />
              </div>
              <span className="feature-category-pill pill-emerald">PAYOUTS</span>
            </div>

            <div className="square-card-content">
              <h3 className="feature-title">Instant Payouts</h3>
              <p className="feature-desc">Direct wallet top-ups & immediate bank account transfers.</p>
              <ul className="feature-bullets-compact">
                <li><CheckCircle2 size={14} color="#10b981" /> Zero Invoicing Delays</li>
                <li><CheckCircle2 size={14} color="#10b981" /> Tax Digital Receipts</li>
              </ul>
            </div>

            <div className="feature-card-footer">
              <div className="feature-spec-badge">
                <Wallet size={12} color="#10b981" />
                <span>Direct Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE: TRADITIONAL VS CONTR@X */}
        <div className="comparison-table-wrapper">
          <div className="comparison-header">
            <h3 className="comparison-title">Why Switch to Contrax?</h3>
            <p className="comparison-subtitle">Compare traditional contracting hassles against the Contrax micro-contracting ecosystem.</p>
          </div>

          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Ecosystem Parameter</th>
                  <th>Traditional Contracting</th>
                  <th className="highlight-col">Contrax System ⚡</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Payment Security</strong></td>
                  <td className="bad-cell">❌ Unsecured cash / High advance risk</td>
                  <td className="good-cell">✅ 100% Encrypted Escrow Vault</td>
                </tr>
                <tr>
                  <td><strong>Agreement Validity</strong></td>
                  <td className="bad-cell">❌ Verbal / Paper agreement disputes</td>
                  <td className="good-cell">✅ Cryptographic Double Signatures (SHA-256)</td>
                </tr>
                <tr>
                  <td><strong>Contractor Vetting</strong></td>
                  <td className="bad-cell">❌ Unknown reliability & skill level</td>
                  <td className="good-cell">✅ Verified Ratings (4.8+ Avg) & Audit History</td>
                </tr>
                <tr>
                  <td><strong>Payout Velocity</strong></td>
                  <td className="bad-cell">❌ 30–90 days invoicing delay</td>
                  <td className="good-cell">✅ Instant Payout upon Milestone Approval</td>
                </tr>
                <tr>
                  <td><strong>Dispute Resolution</strong></td>
                  <td className="bad-cell">❌ Expensive legal / small-claims battles</td>
                  <td className="good-cell">✅ Built-In Admin Mediation & Dispute Logs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="home-section">
        <div className="section-header">
          <div className="section-tag">WORKFLOW</div>
          <h2 className="section-title">How Contrax Works in 3 Steps</h2>
          <p className="section-subtitle">Simple, transparent, and legally secured end-to-end.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Request or Accept Job</h3>
            <p>Clients create service requests with budget & specifications. Contractors browse open market listings and accept jobs.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Lock Escrow & Sign</h3>
            <p>Client locks contract funds in escrow. Both parties provide digital signatures to seal the binding agreement.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Deliver & Release Payout</h3>
            <p>Contractor submits completion proof. Client reviews, approves, and funds release instantly to contractor wallet.</p>
          </div>
        </div>
      </section>

      {/* ROLE SWITCHER PREVIEW SECTION */}
      <section className="home-section section-alt">
        <div className="section-header">
          <div className="section-tag">TAILORED FOR YOU</div>
          <h2 className="section-title">Choose Your Operating Role</h2>
          <p className="section-subtitle">Whether you are hiring service professionals or providing expertise.</p>
        </div>

        <div className="role-tabs-container">
          <div className="role-tabs">
            <button
              className={`role-tab ${activeRoleTab === 'client' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('client')}
            >
              <Users size={18} />
              <span>Clients</span>
            </button>
            <button
              className={`role-tab ${activeRoleTab === 'contractor' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('contractor')}
            >
              <Briefcase size={18} />
              <span>Contractors</span>
            </button>
          </div>

          <div className="role-preview-card">
            {activeRoleTab === 'client' ? (
              <div className="role-content">
                <div className="role-info">
                  <h3>Post Requests & Hire Top Talent</h3>
                  <ul className="role-benefits-list">
                    <li><CheckCircle2 size={16} color="var(--success)" /> Instant matching with nearest verified contractors</li>
                    <li><CheckCircle2 size={16} color="var(--success)" /> 100% Money-back escrow guarantee if work isn't delivered</li>
                    <li><CheckCircle2 size={16} color="var(--success)" /> Digital signature receipts & tax-compliant CSV reports</li>
                  </ul>
                  <button className="btn-role-action" onClick={() => handleProceedRegister('client')}>
                    <span>Sign Up</span>
                    <ArrowRight size={16} />
                  </button>

                </div>
                <div className="role-badge-box">
                  <div className="role-stat-big">₹0</div>
                  <div className="role-stat-sub">Upfront Listing Fee</div>
                </div>
              </div>
            ) : (
              <div className="role-content">
                <div className="role-info">
                  <h3>Find Jobs & Guarantee Your Payouts</h3>
                  <ul className="role-benefits-list">
                    <li><CheckCircle2 size={16} color="var(--success)" /> Never worry about unpaid invoices with locked escrow</li>
                    <li><CheckCircle2 size={16} color="var(--success)" /> Instant wallet withdrawals directly to your bank account</li>
                    <li><CheckCircle2 size={16} color="var(--success)" /> Build verified rating history to win high-budget contracts</li>
                  </ul>
                  <button className="btn-role-action" onClick={() => handleProceedRegister('contractor')}>
                    <span>Join now</span>
                    <ArrowRight size={16} />
                  </button>

                </div>
                <div className="role-badge-box">
                  <div className="role-stat-big">Instant</div>
                  <div className="role-stat-sub">Direct Bank Payouts</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Ready to Secure Your Service Agreement?</h2>
          <p>Join thousands of clients and contractors protecting their contracts today with Contrax.</p>
          <div className="cta-buttons">
            <button className="btn-cta-light" onClick={() => handleProceedRegister('client')}>
              Get Started
            </button>
            <button className="btn-cta-outline" onClick={handleProceedLogin}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* AUTH REQUIRED MODAL PROMPT */}
      {showAuthModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel auth-prompt-modal">
            <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-icon amber">
              <ShieldCheck size={36} color="var(--primary)" />
            </div>

            <h3 className="auth-modal-title">Sign-Up Required to Book Contract</h3>

            <p className="auth-modal-desc">
              To book <strong>"{selectedService?.name || 'this service'}"</strong> ({selectedService?.price} Escrow), lock funds safely, and generate legally binding signatures, a free account is required.
            </p>

            <div className="auth-modal-service-badge">
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Category: <strong>{selectedService?.category}</strong> • Money-Back Escrow</span>
            </div>

            <div className="auth-modal-actions">
              <button
                className="btn btn-primary btn-full-width"
                onClick={() => handleProceedRegister('client', selectedService?.category)}
              >
                <UserPlus size={18} />
                <span>Sign Up</span>
              </button>

              <button
                className="btn btn-outline btn-full-width"
                onClick={handleProceedLogin}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
