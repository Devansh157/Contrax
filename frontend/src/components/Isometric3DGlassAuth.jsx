import React, { useState, useEffect } from 'react';

const Isometric3DGlassAuth = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth mouse parallax tilt effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 15;
      const y = (e.clientY / innerHeight - 0.5) * 15;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="iso-auth-visualizer-container">
      {/* Background Tech Radar & Arc Gears (Matching Screenshot) */}
      <div className="iso-tech-radar-bg">
        <svg className="radar-gear-svg top-right-gear" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="6 6" className="spin-slow-cw" />
          <circle cx="100" cy="100" r="60" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="2" fill="none" strokeDasharray="12 8" className="spin-slow-ccw" />
          <circle cx="100" cy="100" r="35" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" fill="none" />
          <circle cx="100" cy="100" r="4" fill="rgba(56, 189, 248, 0.5)" />
        </svg>

        <svg className="radar-gear-svg bottom-left-radar" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="1.5" fill="none" strokeDasharray="10 10" className="spin-slow-cw" />
          <circle cx="100" cy="100" r="45" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Ambient Floor Glow Spotlights */}
      <div className="iso-ambient-glow primary" />
      <div className="iso-ambient-glow secondary" />
      <div className="iso-ambient-cloud-base" />

      {/* 3D Isometric Viewport with Smooth Mouse Parallax */}
      <div
        className="iso-viewport"
        style={{
          transform: `perspective(1200px) rotateX(${54 + mousePos.y * 0.15}deg) rotateZ(${-40 + mousePos.x * 0.2}deg)`
        }}
      >
        {/* Isometric Grid Floor */}
        <div className="iso-grid-floor" />

        {/* Pure 3D Scene Group */}
        <div className="iso-scene-group">
          
          {/* Central Energy Shockwave Ripple (Triggered by Central Core Block) */}
          <div className="iso-looping-shockwave" />
          <div className="iso-looping-shockwave wave-delayed" />

          {/* SLEEK 3D CUBE MATRIX (3x3 Isometric Glass Grid with Looping Cubic Reconfiguration) */}
          <div className="iso-cube-matrix looping-reconfig-matrix">
            
            {/* Row 1 */}
            <div className="iso-3d-cube cube-pos-1 loop-cubic-1">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            <div className="iso-3d-cube cube-pos-2 loop-cubic-2">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            <div className="iso-3d-cube cube-pos-3 loop-cubic-3">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            {/* Row 2 */}
            <div className="iso-3d-cube cube-pos-4 loop-cubic-4">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            {/* Central Core Block (Reconfigures the other blocks) */}
            <div className="iso-3d-cube cube-pos-5 center-core-cube loop-core-block">
              <div className="cube-face top highlight-amber-core" />
              <div className="cube-face bottom" />
              <div className="cube-face front core-amber-side" />
              <div className="cube-face back core-amber-side" />
              <div className="cube-face right core-amber-side" />
              <div className="cube-face left core-amber-side" />
              {/* Internal Energy Core Glow */}
              <div className="core-internal-glow" />
            </div>

            <div className="iso-3d-cube cube-pos-6 loop-cubic-6">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            {/* Row 3 */}
            <div className="iso-3d-cube cube-pos-7 loop-cubic-7">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            <div className="iso-3d-cube cube-pos-8 loop-cubic-8">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>

            <div className="iso-3d-cube cube-pos-9 loop-cubic-9">
              <div className="cube-face top" /><div className="cube-face bottom" />
              <div className="cube-face front" /><div className="cube-face back" />
              <div className="cube-face right" /><div className="cube-face left" />
            </div>
          </div>

          {/* Levitating Glass Plates & Shards (Transforming Layer Fragments) */}
          <div className="iso-glass-plate plate-1 loop-plate-1" />
          <div className="iso-glass-plate plate-2 loop-plate-2" />
          <div className="iso-glass-plate plate-3 loop-plate-3" />

          {/* Orbiting Glass Mini Cubes */}
          <div className="iso-mini-cube mini-1" />
          <div className="iso-mini-cube mini-2" />
          <div className="iso-mini-cube mini-3" />
          <div className="iso-mini-cube mini-4" />

          {/* Floor Shadow Projection */}
          <div className="iso-floor-shadow" />
        </div>
      </div>
    </div>
  );
};

export default Isometric3DGlassAuth;

