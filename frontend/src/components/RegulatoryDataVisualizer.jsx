import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, BarChart2, Cpu, Globe, CheckCircle2, Lock, Radio, Database, TrendingUp, Layers, Terminal } from 'lucide-react';
import Logo from './Logo';

const RegulatoryDataVisualizer = ({ compact = false }) => {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'escrow' | 'compliance'
  const [hoveredBar, setHoveredBar] = useState(null);
  const [pulseCount, setPulseCount] = useState(99.94);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(prev => +(prev + (Math.random() * 0.02 - 0.01)).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const barHeights = [45, 65, 80, 50, 95, 70, 40, 85, 90, 60, 75, 100, 55, 80, 65, 90];

  return (
    <div className="regulatory-visualizer-container" style={{
      width: compact ? '100%' : '100%',
      maxWidth: compact ? '100%' : '540px',
      margin: compact ? '0 0 1.5rem 0' : '0',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.95) 100%)',
      border: '2px solid rgba(0, 194, 255, 0.4)',
      borderRadius: '24px',
      padding: '1.75rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 194, 255, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
      color: '#f8fafc',
      userSelect: 'none',
      transition: 'all 0.3s ease'
    }}>
      {/* Laser Scanner Beam Overlay */}
      <div className="intel-laser-sweep"></div>

      {/* Background Tech Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>


      {/* Top Header & Live Telemetry Badge */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 194, 255, 0.15)', border: '1px solid #00c2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00c2ff', boxShadow: '0 0 15px rgba(0, 194, 255, 0.4)' }}>
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#00c2ff' }}>Regulatory Intelligence</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #00c2ff, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Interactive Data Telemetry
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)' }}>
          <span className="live-pulsing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          LIVE ONLINE
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {[
          { id: 'telemetry', label: 'Escrow Volume', icon: BarChart2, color: '#00c2ff' },
          { id: 'escrow', label: 'AI Compliance', icon: ShieldCheck, color: '#10b981' },
          { id: 'compliance', label: 'Smart Vaults', icon: Database, color: '#f59e0b' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? tab.color : 'transparent',
                color: isActive ? '#000000' : '#94a3b8',
                fontWeight: isActive ? 900 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 15px ${tab.color}` : 'none'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Display Surface */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '220px', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
        
        {activeTab === 'telemetry' && (
          <div className="intel-view-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Real-Time Automated Contract Analysis</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', textShadow: '0 0 20px rgba(0, 194, 255, 0.5)' }}>
                  ₹{(482950 + Math.round(pulseCount * 10)).toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>▲ +18.4%</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>System Trust Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', textShadow: '0 0 15px rgba(16, 185, 129, 0.5)' }}>{pulseCount}%</div>
              </div>
            </div>

            {/* Interactive Animated Waveform Spectrum */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 194, 255, 0.3)', borderRadius: '16px', padding: '1.25rem', boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.7rem', color: '#00c2ff', fontWeight: 700 }}>
                <span>LIVE SPECTRUM ANALYZER (CLICK OR HOVER)</span>
                <span>{hoveredBar !== null ? `BAND #${hoveredBar + 1}: VAL ${barHeights[hoveredBar]}%` : 'ALL CHANNELS ACTIVE'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '110px', gap: '6px', paddingTop: '10px' }}>
                {barHeights.map((h, index) => {
                  const isHovered = hoveredBar === index;
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1,
                        height: isHovered ? '100%' : `${h}%`,
                        background: isHovered 
                          ? 'linear-gradient(180deg, #ffffff 0%, #00c2ff 100%)' 
                          : index % 2 === 0 
                            ? 'linear-gradient(180deg, #00c2ff 0%, #3b82f6 100%)' 
                            : 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                        borderRadius: '6px 6px 2px 2px',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isHovered ? '0 0 20px #ffffff, 0 0 30px #00c2ff' : '0 4px 10px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        animation: `intelSpectrumWave ${1.5 + (index % 4) * 0.4}s infinite alternate ease-in-out`
                      }}
                    >
                      {/* Leading edge LED */}
                      <div style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: '#ffffff',
                        boxShadow: '0 0 8px #ffffff',
                        position: 'absolute',
                        top: 0
                      }}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'escrow' && (
          <div className="intel-view-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid #10b981', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)' }}>
                <ShieldCheck size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Escrow Vault Security</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>Algorithmic Dispute Shield</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Funds are cryptographically verified before milestone release.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={22} style={{ color: '#00c2ff' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>KYC Level</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Verified PRO</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={22} style={{ color: '#f59e0b' }} className="animate-pulse" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Audit Trail</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Immutable</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="intel-view-fade" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '1.25rem', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 800, marginBottom: '12px' }}>
              <Terminal size={18} />
              <span>REGULATORY COMPLIANCE SYSTEM TELEMETRY</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>[00:00:12] &gt; System integrity inspection: 100% PASS</div>
              <div>[00:00:14] &gt; Dual-party cryptographic signatures enabled</div>
              <div>[00:00:18] &gt; Regulatory standard ISO-27001 active</div>
              <div>[00:00:22] &gt; Contract dispute jurisdiction guidelines locked</div>
              <div style={{ color: '#00c2ff' }}>[READY] &gt; Awaiting authenticated contractor action...</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Regulatory Ticker */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c2ff', animation: 'intelPulseDot 1s infinite' }}></span>
          <span>CONTRAX AUTOMATED LEGAL INTELLIGENCE</span>
        </div>
        <div style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem' }}>
          VER v4.2.0-PRO
        </div>
      </div>
    </div>
  );
};

export default RegulatoryDataVisualizer;
