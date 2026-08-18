import React, { useState, useEffect } from 'react';
import { Wrench, Hammer, FileText, HardHat, Compass, ShieldCheck, Ruler, Settings, PenTool, Zap } from 'lucide-react';

const MechanicalToolsBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40; // -20px to +20px shift
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Upward floating spark particles
  const particles = [
    { id: 1, left: '15%', size: '18px', delay: '0s', duration: '14s', symbol: '⚙️' },
    { id: 2, left: '32%', size: '14px', delay: '3s', duration: '18s', symbol: '⚡' },
    { id: 3, left: '55%', size: '20px', delay: '1s', duration: '16s', symbol: '🔧' },
    { id: 4, left: '72%', size: '16px', delay: '5s', duration: '15s', symbol: '✨' },
    { id: 5, left: '88%', size: '22px', delay: '2s', duration: '19s', symbol: '📐' },
    { id: 6, left: '42%', size: '15px', delay: '4s', duration: '13s', symbol: '🔩' }
  ];

  return (
    <div className="mechanical-bg-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: -1,
      pointerEvents: 'none',
      background: 'var(--bg-primary)'
    }}>
      {/* Blueprint Grid Lines Overlay */}
      <div className="blueprint-grid" />

      {/* Upward Drifting Mechanical Sparks */}
      {particles.map(p => (
        <div
          key={p.id}
          className="spark-particle"
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: p.left,
            fontSize: p.size,
            opacity: 0.25,
            animation: `driftParticleUp ${p.duration} linear infinite`,
            animationDelay: p.delay
          }}
        >
          {p.symbol}
        </div>
      ))}

      {/* Interlocking Gears - Top Right Corner (Responsive Parallax) */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        opacity: 0.18,
        transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        <svg width="340" height="340" viewBox="0 0 200 200" className="gear-spin-cw">
          <g fill="none" stroke="var(--primary)" strokeWidth="2.5">
            <circle cx="100" cy="100" r="70" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="45" />
            <circle cx="100" cy="100" r="20" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
              <rect
                key={angle}
                x="93"
                y="15"
                width="14"
                height="22"
                rx="3"
                fill="var(--primary)"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Interlocking Gears - Meshed Secondary Gear */}
      <div style={{
        position: 'absolute',
        top: '180px',
        right: '210px',
        opacity: 0.15,
        transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        <svg width="220" height="220" viewBox="0 0 200 200" className="gear-spin-ccw">
          <g fill="none" stroke="var(--secondary)" strokeWidth="2.5">
            <circle cx="100" cy="100" r="60" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="35" />
            <circle cx="100" cy="100" r="15" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <rect
                key={angle}
                x="92"
                y="28"
                width="16"
                height="20"
                rx="3"
                fill="var(--secondary)"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Interlocking Gears - Bottom Left Corner */}
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        opacity: 0.18,
        transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        <svg width="380" height="380" viewBox="0 0 200 200" className="gear-spin-cw">
          <g fill="none" stroke="var(--secondary)" strokeWidth="2.5">
            <circle cx="100" cy="100" r="80" strokeDasharray="8 4" />
            <circle cx="100" cy="100" r="50" />
            <circle cx="100" cy="100" r="25" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
              <rect
                key={angle}
                x="92"
                y="8"
                width="16"
                height="24"
                rx="3"
                fill="var(--secondary)"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* FLOATING MECHANICAL & CONTRACTING TOOLS WITH PARALLAX */}
      
      {/* Tool 1: Wrench - Top Left */}
      <div
        className="tool-float float-tool-1"
        style={{
          top: '12%',
          left: '8%',
          color: 'var(--primary)',
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <Wrench size={48} strokeWidth={1.75} />
        </div>
      </div>

      {/* Tool 2: Hammer - Top Center Right */}
      <div
        className="tool-float float-tool-2"
        style={{
          top: '18%',
          right: '14%',
          color: 'var(--secondary)',
          transform: `translate(${-mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <Hammer size={44} strokeWidth={1.75} />
        </div>
      </div>

      {/* Tool 3: Legal Contract Document - Mid Left */}
      <div
        className="tool-float float-tool-3"
        style={{
          top: '48%',
          left: '5%',
          color: 'var(--primary)',
          transform: `translate(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <FileText size={52} strokeWidth={1.5} />
        </div>
      </div>

      {/* Tool 4: Construction HardHat - Mid Right */}
      <div
        className="tool-float float-tool-4"
        style={{
          top: '52%',
          right: '6%',
          color: '#f59e0b',
          transform: `translate(${-mousePos.x * 0.9}px, ${-mousePos.y * 0.9}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <HardHat size={50} strokeWidth={1.75} />
        </div>
      </div>

      {/* Tool 5: Ruler / Measurement - Bottom Left */}
      <div
        className="tool-float float-tool-5"
        style={{
          bottom: '15%',
          left: '12%',
          color: 'var(--secondary)',
          transform: `translate(${mousePos.x * 0.65}px, ${mousePos.y * 0.65}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <Ruler size={46} strokeWidth={1.75} />
        </div>
      </div>

      {/* Tool 6: Shield / Escrow Stamp - Bottom Right */}
      <div
        className="tool-float float-tool-6"
        style={{
          bottom: '18%',
          right: '12%',
          color: '#10b981',
          transform: `translate(${-mousePos.x * 0.85}px, ${-mousePos.y * 0.85}px)`
        }}
      >
        <div className="tool-badge-glow crazy-pulse-ring">
          <ShieldCheck size={48} strokeWidth={1.75} />
        </div>
      </div>

      {/* Tool 7: Architectural Compass - Center Top */}
      <div
        className="tool-float float-tool-7"
        style={{
          top: '8%',
          left: '46%',
          color: 'var(--text-muted)',
          opacity: 0.75,
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`
        }}
      >
        <div className="tool-badge-glow">
          <Compass size={38} strokeWidth={1.5} />
        </div>
      </div>

      {/* Tool 8: Electric Spark / Pen Tool - Center Bottom */}
      <div
        className="tool-float float-tool-8"
        style={{
          bottom: '8%',
          left: '48%',
          color: 'var(--primary)',
          opacity: 0.75,
          transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`
        }}
      >
        <div className="tool-badge-glow">
          <Zap size={36} strokeWidth={1.5} />
        </div>
      </div>

    </div>
  );
};


export default MechanicalToolsBackground;
