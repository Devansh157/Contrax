import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import Logo from './Logo';

// Error Boundary for WebGL Fallback Safety
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("R3F Canvas Error, falling back to 2D loader:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Camera Controller for Phase 1/2/3 sweeps
function CameraController({ progress }) {
  const startTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const endTarget = useMemo(() => new THREE.Vector3(0, 1.3, 0), []);

  useFrame((state) => {
    const camera = state.camera;
    const time = state.clock.getElapsedTime();

    const currentTarget = new THREE.Vector3();
    const currentPos = new THREE.Vector3();

    const endPos = new THREE.Vector3(0, 4.2, 7.5);
    const finalPos = new THREE.Vector3(0, 3.2, 4.8);

    if (progress <= 40) {
      // Phase 1: Wave Sweep - Orbiting camera
      const angle = 0.8 + Math.sin(time * 0.15) * 0.18;
      const radius = 10.0;
      currentPos.set(Math.sin(angle) * radius, 3.2, Math.cos(angle) * radius);
      currentTarget.copy(startTarget);
    } else if (progress > 40 && progress <= 80) {
      // Phase 2: Tilt & focus center
      const t = (progress - 40) / 40;
      const easeT = t * t * (3 - 2 * t);

      const radius = 10.0;
      const posAt40 = new THREE.Vector3(Math.sin(0.8) * radius, 3.2, Math.cos(0.8) * radius);

      currentPos.lerpVectors(posAt40, endPos, easeT);
      currentTarget.lerpVectors(startTarget, endTarget, easeT);
    } else {
      // Phase 3: Final zoom as monolith pulses
      const t = (progress - 80) / 20;
      const easeT = t * t * (3 - 2 * t);

      currentPos.lerpVectors(endPos, finalPos, easeT);
      currentTarget.copy(endTarget);
    }

    camera.position.copy(currentPos);
    camera.lookAt(currentTarget);
  });

  return null;
}

// 3D Scene containing Cube Matrix & Lights
function CubeMatrixScene({ progress }) {
  const shellMeshRef = useRef();
  const coreMeshRef = useRef();
  const pointLightRef = useRef();

  const GRID_SIZE = 15;
  const gridSpacing = 0.55;
  const totalGridCubes = GRID_SIZE * GRID_SIZE;

  // Generate deterministic cube data
  const cubeData = useMemo(() => {
    const data = [];
    let seed = 77;
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < totalGridCubes; i++) {
      data.push({
        randomHeight: 0.25 + pseudoRandom() * 1.1,
        noisePhase: pseudoRandom() * Math.PI * 2,
        isScatterEmit: pseudoRandom() < 0.14,
      });
    }
    return data;
  }, [totalGridCubes]);

  // Designate 27 cubes for the 3x3x3 monolith
  const assemblyIndices = useMemo(() => {
    const center = (GRID_SIZE - 1) / 2;
    const list = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const dist = Math.sqrt((i - center) ** 2 + (j - center) ** 2);
        if (dist >= 1.5 && dist <= 5.5) {
          list.push(i * GRID_SIZE + j);
        }
      }
    }

    let seed = 120;
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...list].sort(() => pseudoRandom() - 0.5);
    return shuffled.slice(0, 27);
  }, [GRID_SIZE]);

  // Monolith slot targets
  const monolithSlots = useMemo(() => {
    const slots = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          slots.push(new THREE.Vector3(dx * 0.35, 1.3 + dy * 0.35, dz * 0.35));
        }
      }
    }
    return slots;
  }, []);

  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColorCore = useMemo(() => new THREE.Color(), []);
  const tempColorShell = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!shellMeshRef.current || !coreMeshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Map progress 0-40% to waveX coordinate sweep
    let waveX = -6.0;
    if (progress <= 40) {
      waveX = -6.0 + (progress / 40) * 12.0;
    } else {
      waveX = 6.0;
    }

    // Dynamic light intensity
    if (pointLightRef.current) {
      if (progress < 40) {
        pointLightRef.current.intensity = 0.2;
      } else if (progress < 80) {
        const t = (progress - 40) / 40;
        pointLightRef.current.intensity = 0.2 + t * 5.8;
      } else {
        const t = (progress - 80) / 20;
        const pulse = Math.sin(t * Math.PI * 2) * 2.5;
        pointLightRef.current.intensity = 6.0 + pulse;
      }
    }

    // Instance updates
    for (let idx = 0; idx < totalGridCubes; idx++) {
      const isAssemblyCube = assemblyIndices.includes(idx);
      const assemblyIdx = assemblyIndices.indexOf(idx);

      const gridI = Math.floor(idx / GRID_SIZE);
      const gridJ = idx % GRID_SIZE;
      const startX = (gridI - (GRID_SIZE - 1) / 2) * gridSpacing;
      const startZ = (gridJ - (GRID_SIZE - 1) / 2) * gridSpacing;

      // Radial distance from origin for Oblio concentric ripple effect
      const distFromCenter = Math.sqrt(startX * startX + startZ * startZ);

      // Linear Wave
      const waveDistance = waveX - startX;
      const waveActive = Math.max(0, Math.min(1, waveDistance * 1.5));

      // Oblio concentric ripple wave when progress > 80%
      const radialRipple = Math.sin(distFromCenter * 1.8 - time * 4) * 0.06;

      const randomHeight = cubeData[idx].randomHeight;
      const noisePhase = cubeData[idx].noisePhase;
      const idleFloat = Math.sin(time * 1.4 + noisePhase) * 0.035;

      let x = startX;
      let y = waveActive * randomHeight + idleFloat + (progress > 80 ? radialRipple : 0);
      let z = startZ;

      let scale = 0.4;
      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;

      // Phase 2 & 3: Assembly
      if (isAssemblyCube && progress > 40) {
        const finalPos = monolithSlots[assemblyIdx];
        const t = Math.max(0, Math.min(1, (progress - 40) / 40));
        const easeT = t * t * (3 - 2 * t);

        x = THREE.MathUtils.lerp(startX, finalPos.x, easeT);
        z = THREE.MathUtils.lerp(startZ, finalPos.z, easeT);

        const startY = randomHeight + idleFloat;
        const heightArc = Math.sin(easeT * Math.PI) * 1.6;
        y = THREE.MathUtils.lerp(startY, finalPos.y, easeT) + heightArc;

        scale = THREE.MathUtils.lerp(0.4, 0.32, easeT);

        const spinSpeed = 2.5 + assemblyIdx * 0.1;
        rotX = Math.sin(time * spinSpeed) * (1 - easeT) * 1.5;
        rotY = Math.cos(time * spinSpeed) * (1 - easeT) * 1.5;
      }

      // Phase 3: Fully Formed
      if (isAssemblyCube && progress >= 80) {
        const finalPos = monolithSlots[assemblyIdx];
        x = finalPos.x;
        y = finalPos.y;
        z = finalPos.z;
        scale = 0.32;
        rotX = 0;
        rotY = 0;
        rotZ = 0;
      }

      // Shell mesh
      tempObject.position.set(x, y, z);
      tempObject.rotation.set(rotX, rotY, rotZ);
      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      shellMeshRef.current.setMatrixAt(idx, tempObject.matrix);

      // Core mesh
      const coreScale = scale * 0.85;
      tempObject.scale.set(coreScale, coreScale, coreScale);
      tempObject.updateMatrix();
      coreMeshRef.current.setMatrixAt(idx, tempObject.matrix);

      // Glow values
      const isScatterEmit = cubeData[idx].isScatterEmit;
      let glowVal = 0.0;

      if (isScatterEmit) {
        const pulse = Math.sin(time * 2.5 + noisePhase) * 0.12 + 0.38;
        glowVal = waveActive ? 1.0 : pulse;
      } else {
        glowVal = waveActive;
      }

      if (progress >= 80) {
        const pulseT = (progress - 80) / 20;
        if (isAssemblyCube) {
          const pulseFactor = Math.sin(pulseT * Math.PI * 2) * 1.8 + 1.2;
          glowVal = 1.0 + pulseFactor;
        } else {
          const pulseFactor = Math.sin(pulseT * Math.PI * 2) * 0.25;
          glowVal = Math.max(0.1, glowVal + pulseFactor);
        }
      }

      // HDR Core Emissive
      tempColorCore.setRGB(glowVal * 6.5, glowVal * 1.6, glowVal * 0.02);
      coreMeshRef.current.setColorAt(idx, tempColorCore);

      // Shell Material
      if (glowVal > 0.15) {
        tempColorShell.setRGB(0.06 + glowVal * 0.06, 0.07 + glowVal * 0.015, 0.1);
      } else {
        tempColorShell.setRGB(0.05, 0.06, 0.09);
      }
      shellMeshRef.current.setColorAt(idx, tempColorShell);
    }

    shellMeshRef.current.instanceMatrix.needsUpdate = true;
    shellMeshRef.current.instanceColor.needsUpdate = true;
    coreMeshRef.current.instanceMatrix.needsUpdate = true;
    coreMeshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Dark metallic shell cubes */}
      <instancedMesh ref={shellMeshRef} args={[null, null, totalGridCubes]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.8}
          transmission={0.45}
          thickness={0.4}
          transparent
          opacity={0.92}
          ior={1.45}
          clearcoat={0.6}
        />
      </instancedMesh>

      {/* Internal glowing cores */}
      <instancedMesh ref={coreMeshRef} args={[null, null, totalGridCubes]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.5}
        />
      </instancedMesh>

      {/* Floor grid plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <planeGeometry args={[11, 11]} />
        <meshBasicMaterial
          color="#120c06"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.12} />
      <pointLight position={[5, 6, 4]} intensity={0.8} color="#00d5ff" />
      <pointLight position={[-6, 5, -6]} intensity={0.6} color="#ff7700" />
      <directionalLight position={[0, 8, 2]} intensity={0.5} />

      <pointLight ref={pointLightRef} position={[0, 1.3, 0]} distance={7} color="#ff5500" />

      <Sparkles count={55} scale={7} size={2.5} speed={0.4} color="#ff6600" />
      <Sparkles count={35} scale={6} size={3} speed={0.55} color="#00c8ff" />
    </group>
  );
}

const CubeMatrixLoader = ({ progress: propProgress, onComplete }) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const isControlled = propProgress !== undefined;
  const progress = isControlled ? propProgress : internalProgress;

  useEffect(() => {
    let progressTimer;
    if (!isControlled) {
      const startTime = Date.now();
      const duration = 2800;

      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculated = Math.min(100, Math.floor((elapsed / duration) * 100));

        setInternalProgress(calculated);

        if (calculated >= 100) {
          clearInterval(progressTimer);

          setTimeout(() => {
            setIsExiting(true);
          }, 350);

          setTimeout(() => {
            if (onComplete) onComplete();
          }, 950);
        }
      }, 30);
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isControlled, onComplete]);

  useEffect(() => {
    if (isControlled && progress >= 100) {
      setTimeout(() => {
        setIsExiting(true);
      }, 350);

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 950);
    }
  }, [isControlled, progress, onComplete]);

  const canvasFallback = (
    <div style={{ display: 'none' }} />
  );

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="preloader-splash-overlay vault-preloader-3d"
          initial={{ opacity: 1, scale: 1, clipPath: 'circle(150% at 50% 50%)' }}
          exit={{
            opacity: 0,
            scale: 1.08,
            clipPath: 'circle(0% at 50% 50%)',
            filter: "blur(18px)",
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          {/* Subtle cyber background glows */}
          <div className="preloader-glow-bg cyan" style={{ top: '25%', left: '30%', opacity: 0.15 }} />
          <div className="preloader-glow-bg amber" style={{ bottom: '20%', right: '30%', opacity: 0.18 }} />

          {/* 3D Canvas - Completely unobstructed center */}
          <div className="preloader-r3f-canvas-container">
            <CanvasErrorBoundary fallback={canvasFallback}>
              <Canvas
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                camera={{ fov: 42, near: 0.1, far: 50 }}
              >
                <CameraController progress={progress} />
                <CubeMatrixScene progress={progress} />

                <EffectComposer>
                  <Bloom
                    intensity={2.0}
                    luminanceThreshold={0.25}
                    luminanceSmoothing={0.9}
                    height={300}
                  />
                </EffectComposer>
              </Canvas>
            </CanvasErrorBoundary>
          </div>

          {/* Minimalist Corner Controls - Inspired by Oblio.io */}
          {/* Top-Left Minimalist Logo */}
          <div style={{
            position: 'absolute',
            top: '28px',
            left: '32px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'none'
          }}>
            <Logo size={32} />
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif"
            }}>
              CONTR<span style={{ color: '#00c6ff' }}>@</span>X
            </span>
          </div>

          {/* Bottom-Right Minimalist Digital Counter */}
          <div style={{
            position: 'absolute',
            bottom: '32px',
            right: '36px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            fontFamily: "'Inter', monospace, sans-serif",
            color: '#cbd5e1',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', color: '#94a3b8', textTransform: 'uppercase' }}>
              INITIALIZING
            </span>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '-0.04em' }}>
              {String(progress).padStart(3, '0')}%
            </span>
          </div>

          {/* Bottom Sleek Accent Line */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00c6ff 0%, #f59e0b 100%)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.7)',
            transition: 'width 0.1s ease-out',
            zIndex: 20
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CubeMatrixLoader;
