import React from 'react';

const Logo = ({ 
  size = 38, 
  rounded = true, 
  showText = false, 
  variant = 'default', // 'default', 'rounded', 'analytics'
  className = "", 
  style = {} 
}) => {

  if (variant === 'analytics') {
    return <AnalyticsLogo size={size * 2.4} className={className} style={style} />;
  }

  const isRounded = rounded || variant === 'rounded';
  const iconSize = isRounded ? Math.round(size * 0.65) : size;

  const logoIconContent = (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="contraxCyanTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="40%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>
        
        <linearGradient id="contraxCyanBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#00A8FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <filter id="contraxGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Top Hexagonal Ribbon */}
      <path 
        d="M 14 57 L 38 14 L 98 14 L 75 41 L 53 41 L 34 57 Z" 
        fill="url(#contraxCyanTop)"
        stroke="url(#contraxCyanTop)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#contraxGlow)"
      />

      {/* Bottom Hexagonal Ribbon */}
      <path 
        d="M 14 63 L 38 106 L 98 106 L 75 79 L 53 79 L 34 63 Z" 
        fill="url(#contraxCyanBottom)"
        stroke="url(#contraxCyanBottom)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#contraxGlow)"
      />
    </svg>
  );

  return (
    <div 
      className={`logo-wrapper ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: `${Math.round(size * 0.22)}px`, 
        lineHeight: 1,
        verticalAlign: 'middle',
        ...style 
      }}
    >
      {isRounded ? (
        <div 
          className="logo-badge-rounded"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${Math.round(size * 0.28)}px`,
            background: 'var(--logo-badge-bg)',
            border: '1px solid var(--logo-badge-border)',
            boxShadow: 'var(--logo-badge-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease'
          }}
        >
          {logoIconContent}
        </div>
      ) : (
        logoIconContent
      )}

      {showText && (
        <span 
          className="logo-brand-name"
          style={{ 
            fontSize: `${Math.round(size * 0.72)}px`, 
            fontWeight: 800, 
            letterSpacing: '-0.035em',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            color: 'var(--text-primary, #0f172a)'
          }}
        >
          Contrax
        </span>
      )}
    </div>
  );
};

export const AnalyticsLogo = ({ size = 90, className = "", style = {} }) => {
  return (
    <div 
      className={`analytics-logo-wrapper ${className}`} 
      style={{ 
        display: 'inline-flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        userSelect: 'none',
        ...style 
      }}
    >
      <svg 
        width={size} 
        height={Math.round(size * 1.05)} 
        viewBox="0 0 200 210" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', filter: 'drop-shadow(0 4px 20px rgba(0, 229, 255, 0.4))' }}
      >
        <defs>
          <linearGradient id="analyticsNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#00C6FF" />
            <stop offset="100%" stopColor="#0072FF" />
          </linearGradient>

          <filter id="neonGlowEffect" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top Node Trend Line */}
        <path 
          d="M 50 85 L 78 52 L 105 68 L 140 32" 
          stroke="url(#analyticsNeonGrad)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#neonGlowEffect)"
        />

        {/* Node Circles */}
        <circle cx="50" cy="85" r="7" fill="var(--bg-primary, #0b0f19)" stroke="url(#analyticsNeonGrad)" strokeWidth="4" filter="url(#neonGlowEffect)" />
        <circle cx="78" cy="52" r="7" fill="var(--bg-primary, #0b0f19)" stroke="url(#analyticsNeonGrad)" strokeWidth="4" filter="url(#neonGlowEffect)" />
        <circle cx="105" cy="68" r="5" fill="url(#analyticsNeonGrad)" filter="url(#neonGlowEffect)" />
        <circle cx="140" cy="32" r="9" fill="var(--bg-primary, #0b0f19)" stroke="url(#analyticsNeonGrad)" strokeWidth="4.5" filter="url(#neonGlowEffect)" />

        {/* Right Vertical Bar Chart Bars */}
        <rect x="122" y="78" width="10" height="34" rx="3" stroke="url(#analyticsNeonGrad)" strokeWidth="3" fill="transparent" opacity="0.85" />
        <rect x="138" y="58" width="10" height="54" rx="3" stroke="url(#analyticsNeonGrad)" strokeWidth="3" fill="transparent" opacity="0.9" />

        {/* Central Stylized 'X' Icon */}
        <path 
          d="M 56 142 L 86 112 M 72 82 L 112 122 L 142 142 C 148 142, 152 138, 150 132 L 138 98 L 138 88" 
          stroke="url(#analyticsNeonGrad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#neonGlowEffect)"
        />
        <path 
          d="M 64 88 L 136 142" 
          stroke="url(#analyticsNeonGrad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          filter="url(#neonGlowEffect)"
        />
      </svg>

      <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
        <div style={{ 
          fontSize: `${Math.round(size * 0.28)}px`, 
          fontWeight: 800, 
          letterSpacing: '-0.02em', 
          color: '#00e5ff',
          fontFamily: "'Inter', sans-serif",
          textShadow: '0 0 12px rgba(0, 229, 255, 0.4)' 
        }}>
          Contra<span style={{ color: '#0072ff' }}>X</span>
        </div>
        <div style={{ 
          fontSize: `${Math.round(size * 0.12)}px`, 
          fontWeight: 700, 
          letterSpacing: '0.35em', 
          color: '#22d3ee',
          textTransform: 'uppercase',
          marginTop: '-2px',
          opacity: 0.95
        }}>
          ANALYTICS
        </div>
      </div>
    </div>
  );
};

export default Logo;
