import React, { useState, useEffect } from 'react';
import {
  Wrench, ShieldCheck, MapPin, Star, Zap, CheckCircle2,
  Clock, UserCheck, HardHat, FileText, Lock, Navigation, Sparkles, ChevronRight, Award
} from 'lucide-react';

const ContractorHeroVisualizer = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);

  // Smooth mouse tilt parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Automatic cycle for active contractor highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const contractorCards = [
    {
      id: 1,
      name: 'Rajesh Sharma',
      role: 'Master Plumber',
      rating: '4.9',
      reviews: 184,
      status: 'En Route',
      distance: '1.2 km away',
      eta: '8 mins',
      service: 'Emergency Pipe Repair',
      price: '₹1,500',
      avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      accentColor: '#f59e0b',
      icon: <Wrench size={24} color="#ffffff" />,
      tag: 'INSTANT MATCH'
    },
    {
      id: 2,
      name: 'Anil Verma',
      role: 'Licensed Electrician',
      rating: '5.0',
      reviews: 210,
      status: 'Digital Signed',
      distance: '0.8 km away',
      eta: '5 mins',
      service: 'Circuit Breaker Check',
      price: '₹2,000',
      avatarBg: 'linear-gradient(135deg, #00f2fe 0%, #00c6ff 100%)',
      accentColor: '#00c6ff',
      icon: <Zap size={24} color="#ffffff" />,
      tag: 'VERIFIED PRO'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      role: 'Structural Engineer',
      rating: '4.8',
      reviews: 142,
      status: 'Escrow Vaulted',
      distance: '2.5 km away',
      eta: '14 mins',
      service: 'Structural Repair',
      price: '₹5,000',
      avatarBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      accentColor: '#10b981',
      icon: <HardHat size={24} color="#ffffff" />,
      tag: 'MILESTONE PAYOUT'
    }
  ];

  const current = contractorCards[activeTab];

  return (
    <div className="contractor-visualizer-container">
      {/* Background Ambient Spotlights & Energy Aura */}
      <div className="vibrant-spotlight spotlight-cyan" />
      <div className="vibrant-spotlight spotlight-amber" />
      <div className="vibrant-spotlight spotlight-purple" />



      {/* 3D Parallax Viewport */}
      <div
        className="contractor-3d-viewport"
        style={{
          transform: `perspective(1100px) rotateX(${5 + mousePos.y * -0.7}deg) rotateY(${mousePos.x * 0.7}deg)`
        }}
      >
        {/* Animated Holographic Radar Sweep Grid */}
        <div className="radar-map-background">
          <div className="radar-grid-rings">
            <div className="ring ring-1 pulse-ring-anim" />
            <div className="ring ring-2 pulse-ring-anim delay-1" />
            <div className="ring ring-3 pulse-ring-anim delay-2" />
            <div className="radar-sweeper-beam" />
          </div>

          {/* GPS Radar Pins with Live Target Rings */}
          <div className={`gps-pin pin-1 ${activeTab === 0 ? 'active-pin' : ''}`}>
            <div className="pin-pulse" />
            <div className="pin-icon-wrap"><MapPin size={18} color="#f59e0b" /></div>
          </div>
          <div className={`gps-pin pin-2 ${activeTab === 1 ? 'active-pin' : ''}`}>
            <div className="pin-pulse" />
            <div className="pin-icon-wrap"><MapPin size={18} color="#00f2fe" /></div>
          </div>
          <div className={`gps-pin pin-3 ${activeTab === 2 ? 'active-pin' : ''}`}>
            <div className="pin-pulse" />
            <div className="pin-icon-wrap"><MapPin size={18} color="#10b981" /></div>
          </div>
        </div>


        {/* MAIN HERO CONTRACTOR CARD (Holographic Glowing Border) */}
        <div className="contractor-pro-card main-card holographic-card-wrap">
          <div className="holographic-border-flow" />

          <div key={current.id} className="pro-card-content-anim">
            {/* Header */}
            <div className="pro-card-header">
              <div className="pro-avatar-ring">
                <div className="pro-avatar" style={{ background: current.avatarBg }}>
                  {current.icon}
                </div>
                <div className="avatar-spin-ring" style={{ borderColor: current.accentColor }} />
              </div>

              <div className="pro-meta">
                <div className="pro-name-row">
                  <h4 className="pro-name">{current.name}</h4>
                  <span className="verified-shield-badge" title="Verified Contractor">
                    <CheckCircle2 size={16} color="#10b981" />
                  </span>
                  <span className="pro-tag-badge" style={{ color: current.accentColor, borderColor: current.accentColor }}>
                    {current.tag}
                  </span>
                </div>
                <div className="pro-role">
                  <span>{current.role}</span>
                  <span className="meta-dot">•</span>
                  <span className="rating-pill">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" /> <strong>{current.rating}</strong> ({current.reviews})
                  </span>
                </div>
              </div>

              <div className="pro-price-badge">
                <span className="price-amount">{current.price}</span>
                <span className="price-label">Escrow Lock</span>
              </div>
            </div>

            {/* Body Info */}
            <div className="pro-card-body">
              <div className="service-info-row">
                <span className="service-name">{current.service}</span>
                <span className="service-eta-pill">
                  <Clock size={13} /> ETA {current.eta}
                </span>
              </div>

              {/* Dynamic Animated GPS Navigation Progress Bar */}
              <div className="gps-tracking-bar">
                <div className="gps-fill-bar" style={{ background: `linear-gradient(90deg, ${current.accentColor}, #00f2fe)` }} />
                <div className="gps-pointer-glow" style={{ background: current.accentColor }}>
                  <Navigation size={12} color="#ffffff" className="nav-arrow-spin" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="pro-card-footer">
                <div className="dispatch-status">
                  <span className="status-indicator-dot pulsing" />
                  <span className="status-text">{current.status} • {current.distance}</span>
                </div>
                <div className="sec-hash-tag">
                  <Lock size={13} color="#10b981" />
                  <span>Vaulted & Signed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dots Selector Bar */}
          <div className="contractor-tab-dots">
            {contractorCards.map((c, index) => (
              <button
                key={c.id}
                className={`tab-dot ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                title={c.name}
              >
                <span className="dot-fill" style={{ background: c.accentColor }} />
              </button>
            ))}
          </div>
        </div>

        {/* 3D Floating Tool Badges */}
        <div className="floating-badge badge-wrench float-badge-1">
          <Wrench size={20} color="#f59e0b" />
        </div>
        <div className="floating-badge badge-hardhat float-badge-2">
          <HardHat size={20} color="#00f2fe" />
        </div>
        <div className="floating-badge badge-shield float-badge-3">
          <ShieldCheck size={20} color="#10b981" />
        </div>
      </div>
    </div>
  );
};

export default ContractorHeroVisualizer;
