import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, FileText, Sparkles, Cpu, Lock, ArrowRight, RotateCcw, Zap, KeyRound, Network, Layers, Shield } from 'lucide-react';

const DigitalContractIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  // Phase 0: Init 3D Grid & Holographic Web
  // Phase 1: Translucent Glass Document & Glowing Circuit Data Paths Appear
  // Phase 2: Interconnected Network Nodes & Clauses Weave into Place
  // Phase 3: High-Tech Security Shield & Metallic Holographic Signature Stamp Drop & Emit Pulse
  // Phase 4: Verification Locks Engaged, 8K Ultra Resolution Motion Graphic Live

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Smooth camera parallax tilt
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1300);
    const t3 = setTimeout(() => setPhase(3), 2300);
    const t4 = setTimeout(() => setPhase(4), 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleReplay = () => {
    setPhase(0);
    setTimeout(() => setPhase(1), 400);
    setTimeout(() => setPhase(2), 1200);
    setTimeout(() => setPhase(3), 2200);
    setTimeout(() => setPhase(4), 3200);
  };

  return (
    <div className="intro-anim intro-overlay-container">
      {/* Subtle Dark Grid Background with Ambient Neon Spotlights */}
      <div className="intro-anim intro-grid-background">
        <div className="intro-anim intro-ambient-spotlight spot-turquoise" />
        <div className="intro-anim intro-ambient-spotlight spot-blue" />
        <div className="intro-anim intro-ambient-spotlight spot-emerald" />
        <div className="intro-anim intro-grid-overlay" />
      </div>

      {/* Holographic Lines & Interconnected Network Web (SVG Layer) */}
      <svg className="intro-anim intro-holographic-web-svg" viewBox="0 0 1200 800" fill="none">
        {/* Network Connection Rays */}
        <path d="M 100 200 Q 300 150 600 250 T 1100 180" stroke="rgba(0, 242, 254, 0.25)" strokeWidth="1.5" strokeDasharray="6 4" className="intro-anim path-dash-flow" />
        <path d="M 150 600 Q 400 450 600 350 T 1050 620" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" strokeDasharray="8 6" className="intro-anim path-dash-flow-reverse" />
        <path d="M 200 100 Q 600 400 1000 100" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Glowing Network Nodes */}
        <g className="intro-anim network-node-group">
          <circle cx="300" cy="180" r="5" fill="#00f2fe" filter="drop-shadow(0 0 8px #00f2fe)" />
          <circle cx="900" cy="210" r="6" fill="#10b981" filter="drop-shadow(0 0 10px #10b981)" />
          <circle cx="220" cy="520" r="4" fill="#3b82f6" filter="drop-shadow(0 0 6px #3b82f6)" />
          <circle cx="980" cy="550" r="5" fill="#00f2fe" filter="drop-shadow(0 0 8px #00f2fe)" />
        </g>
      </svg>

      {/* Cinematic Depth of Field Vignette */}
      <div className="intro-anim intro-cinematic-vignette" />

      {/* Top Header Navigation */}
      <div className="intro-anim intro-top-bar">
        <div className="intro-anim intro-brand-badge">
          <Cpu className="intro-anim logo-icon" size={22} color="#00f2fe" />
          <span className="intro-anim brand-text">CONTR<span style={{ color: '#00f2fe' }}>@</span>X 3D HERO PLATFORM</span>
        </div>
        <div className="intro-anim intro-action-buttons">
          {phase > 0 && (
            <button className="intro-anim intro-btn-secondary" onClick={handleReplay}>
              <RotateCcw size={14} /> Replay 3D Motion
            </button>
          )}
          <button className="intro-anim intro-btn-skip" onClick={onComplete}>
            Proceed to Sign In <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with Smooth Camera Movement */}
      <div 
        className="intro-anim intro-3d-viewport"
        style={{
          transform: `perspective(1200px) rotateX(${16 + mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.35}deg) translateZ(0px)`
        }}
      >
        {/* Shockwave Light Pulse across Grid Floor when Signature Stamp Lands */}
        <div className={`intro-anim intro-grid-shockwave ${phase >= 3 ? 'pulse-active' : ''}`} />

        {/* Dynamic Floating Digital Document made of Translucent Dark Glass */}
        <div className={`intro-anim intro-contract-card float-hero-document ${phase >= 1 ? 'assemble-phase-1' : ''} ${phase >= 3 ? 'stamp-landed' : ''}`}>
          
          {/* Specular Light Reflection Sheen Overlay */}
          <div className="intro-anim glass-specular-reflection" />

          {/* Glowing Data Circuit Paths across Translucent Glass */}
          <div className="intro-anim glass-circuit-grid">
            <div className="intro-anim circuit-line c-line-1" />
            <div className="intro-anim circuit-line c-line-2" />
            <div className="intro-anim circuit-line c-line-3" />
          </div>

          {/* Header Glass Panel (Frosty Translucent with Neon Cyan & Blue Borders) */}
          <div className={`intro-anim intro-glass-panel intro-panel-header ${phase >= 1 ? 'visible-panel' : ''}`}>
            <div className="intro-anim panel-header-top">
              <div className="intro-anim doc-type-tag">
                <FileText size={15} color="#00f2fe" />
                <span>SMART CONTRACT PLATFORM • PROTOCOL v2.4</span>
              </div>
              <div className="intro-anim hash-pill">
                <Lock size={13} color="#00f2fe" />
                <span>VAULT HASH: 0x7F8A9...B401</span>
              </div>
            </div>

            <h2 className="intro-anim intro-doc-title">
              DIGITAL AGREEMENT & ESCROW VAULT
            </h2>
            <div className="intro-anim intro-doc-subtitle">
              Sleek Translucent Glass • Cryptographic Proof • Automated Workflows
            </div>
          </div>

          {/* Body Glass Panels (Terms & Clauses with Neon Cyan & Emerald Borders) */}
          <div className="intro-anim intro-contract-body">
            
            {/* Clause 1: Service Scope & Verification Locks */}
            <div className={`intro-anim intro-glass-panel intro-panel-clause clause-left ${phase >= 2 ? 'visible-panel' : ''}`}>
              <div className="intro-anim clause-title">
                <Sparkles size={14} color="#00f2fe" /> Verification Locks & SLAs
              </div>
              <p className="intro-anim clause-text">
                Contract milestones encrypted into zero-knowledge state logs. Automated escrow settlement upon dual consensus sign-off.
              </p>
              <div className="intro-anim clause-metric-bar">
                <div className="intro-anim metric-fill fill-cyan" style={{ width: phase >= 2 ? '100%' : '0%' }} />
              </div>
            </div>

            {/* Clause 2: Automated Contract Workflows */}
            <div className={`intro-anim intro-glass-panel intro-panel-clause clause-right ${phase >= 2 ? 'visible-panel' : ''}`}>
              <div className="intro-anim clause-title">
                <Zap size={14} color="#3b82f6" /> Automated Workflows
              </div>
              <p className="intro-anim clause-text">
                Interconnected neural nodes verify contractor proof-of-work in real time with instant escrow payout triggers.
              </p>
              <div className="intro-anim clause-metric-bar">
                <div className="intro-anim metric-fill fill-blue" style={{ width: phase >= 2 ? '100%' : '0%' }} />
              </div>
            </div>

          </div>

          {/* Floating Interconnected Network Badges around the Document */}
          <div className={`intro-anim intro-floating-nodes-container ${phase >= 2 ? 'nodes-active' : ''}`}>
            <div className="intro-anim floating-node node-1">
              <Shield size={14} color="#00f2fe" />
              <span>Zero-Trust Security</span>
            </div>
            <div className="intro-anim floating-node node-2">
              <KeyRound size={14} color="#10b981" />
              <span>Dual Cryptographic Keys</span>
            </div>
            <div className="intro-anim floating-node node-3">
              <Network size={14} color="#3b82f6" />
              <span>Automated Workflow</span>
            </div>
          </div>

          {/* Footer Area with High-Tech Security Shield & Metallic Holographic Signature Stamp */}
          <div className="intro-anim intro-contract-footer">
            
            {/* High-Tech Security Shield & Holographic Digital Signature Stamp */}
            <div className={`intro-anim intro-holographic-stamp ${phase >= 3 ? 'stamp-drop-anim' : ''}`}>
              <div className="intro-anim stamp-outer-ring" />
              <div className="intro-anim stamp-inner-ring" />
              <div className="intro-anim stamp-core">
                <ShieldCheck size={38} className="intro-anim stamp-icon" />
                <div className="intro-anim stamp-label">DIGITAL SIGNATURE</div>
                <div className="intro-anim stamp-status">CRYPTOGRAPHICALLY SEALED</div>
              </div>
            </div>

            {/* Contract Status Indicator */}
            <div className="intro-anim intro-status-badge">
              {phase < 3 ? (
                <span className="intro-anim status-assembling">
                  <span className="intro-anim status-dot pulse-cyan" /> Weaving Neural Workflow & Nodes...
                </span>
              ) : (
                <span className="intro-anim status-sealed">
                  <CheckCircle2 size={16} color="#00f2fe" /> CONTRACT SECURED & VERIFIED
                </span>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Control Bar & Direct Action */}
      <div className="intro-anim intro-bottom-bar">
        <div className="intro-anim intro-progress-track">
          <div 
            className="intro-anim intro-progress-fill" 
            style={{ 
              width: phase === 0 ? '15%' : phase === 1 ? '40%' : phase === 2 ? '70%' : phase === 3 ? '90%' : '100%' 
            }} 
          />
        </div>

        <div className="intro-anim intro-bottom-content">
          <div className="intro-anim intro-footer-text">
            <span className="intro-anim glow-text">CONTR@X v2.4</span> • Futuristic Smart Contract Ecosystem
          </div>

          <button 
            className={`intro-anim intro-btn-primary ${phase >= 4 ? 'pulse-ready' : ''}`}
            onClick={onComplete}
          >
            <span>Enter Platform / Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default DigitalContractIntro;
