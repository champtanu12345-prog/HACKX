import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import {
  Shield,
  Layers,
  Zap,
  Activity,
  ArrowRight,
  ExternalLink,
  X,
  Sparkles,
  Compass,
  Cpu,
  Radio,
  CheckCircle2,
  Lock,
  ChevronRight,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface HackXHeroSectionProps {
  onLaunch?: () => void;
  onConnect?: () => void;
}

type TabType = 'about' | 'architecture' | 'capabilities' | null;

export const HackXHeroSection: React.FC<HackXHeroSectionProps> = ({
  onLaunch,
  onConnect,
}) => {
  // Navigation & Interactive States
  const [activeNav, setActiveNav] = useState<string>('Platform');
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [isCounterFinished, setIsCounterFinished] = useState<boolean>(false);
  const [objectMode, setObjectMode] = useState<'refractive' | 'capsule' | 'quantum'>('refractive');

  // Mouse Parallax Motion Values for 3D Levitation Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D tilt
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothRotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), springConfig);
  const smoothRotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);
  const smoothTranslateX = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), springConfig);
  const smoothTranslateY = useSpring(useTransform(mouseY, [-300, 300], [-12, 12]), springConfig);

  // Canvas Ref for Concentric Ripple & Particle Caustics
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track mouse in container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Smooth 0% -> 100% Counter Animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2200; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easedProgress * 100);
      setCounterValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCounterValue(100);
        setIsCounterFinished(true);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleRestartCounter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCounterFinished(false);
    setCounterValue(0);
    let startTimestamp: number | null = null;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCounterValue(Math.floor(easedProgress * 100));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCounterValue(100);
        setIsCounterFinished(true);
      }
    };
    requestAnimationFrame(step);
  };

  // Canvas Background: Faint Concentric Wave/Ripple Contours Radiating Outward
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.85;

      // Draw faint concentric ripple/wave contours
      const ringCount = 14;
      for (let i = 1; i <= ringCount; i++) {
        const baseRadius = (i / ringCount) * maxRadius;
        // Breathing pulse modulation
        const waveOffset = Math.sin(time * 1.5 + i * 0.4) * 8;
        const radius = baseRadius + waveOffset;

        ctx.beginPath();
        // Create organic undulating contour line using bezier points
        const segments = 64;
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          const wobble = Math.sin(angle * 6 + time + i * 0.5) * (4 + i * 0.8);
          const r = radius + wobble;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r * 0.72; // subtle isometric perspective

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Delicate gradient alpha for topographical contours
        const alpha = Math.max(0.02, 0.14 - (i / ringCount) * 0.1);
        ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
        ctx.lineWidth = i % 3 === 0 ? 1.4 : 0.8;
        if (i % 4 === 0) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }

      // Draw subtle ambient caustics dots
      for (let p = 0; p < 24; p++) {
        const pAngle = time * 0.3 + (p * Math.PI * 2) / 24;
        const pDist = 120 + Math.sin(time + p) * 60 + (p % 3) * 50;
        const px = cx + Math.cos(pAngle) * pDist;
        const py = cy + Math.sin(pAngle) * pDist * 0.8;
        const pAlpha = 0.15 + Math.sin(time * 2 + p) * 0.1;

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${pAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Card Content Data
  const cardData = [
    {
      id: 'about' as const,
      tag: 'OVERVIEW',
      title: 'About HackX',
      subtitle: 'Autonomous Maritime Observation & Intelligence',
      badge: 'Zero-Latency Core',
      icon: <Shield className="w-5 h-5 text-sky-600" />,
      color: 'from-sky-500/20 to-cyan-500/10',
      borderColor: 'hover:border-sky-300',
      description:
        'A unified zero-trust operational command platform engineered to ingest high-frequency synthetic aperture radar (SAR), optical feeds, and vessel AIS streams.',
      metrics: [
        { label: 'Latency', value: '< 120ms' },
        { label: 'Precision', value: '99.4%' },
        { label: 'Sensors', value: '14 Active' },
      ],
      details: [
        'Multi-spectral satellite telemetry fused with real-time ocean current hindcasting.',
        'Continuous zero-day anomaly detection across exclusive economic zones (EEZ).',
        'Direct automated pipeline generation for law enforcement and legal attribution.',
      ],
    },
    {
      id: 'architecture' as const,
      tag: 'SYSTEM DESIGN',
      title: 'Architecture',
      subtitle: 'Neural Hydrodynamic Physics & Vector Pipeline',
      badge: 'Distributed Mesh',
      icon: <Layers className="w-5 h-5 text-cyan-600" />,
      color: 'from-cyan-500/20 to-teal-500/10',
      borderColor: 'hover:border-cyan-300',
      description:
        'Powered by a distributed micro-kernel pipeline combining Sentinel-1 SAR imagery, ECMWF meteo-oceanic models, and deep trajectory hindcast ensembles.',
      metrics: [
        { label: 'Compute Engine', value: 'PyTorch C++' },
        { label: 'Resolution', value: '10m SAR Grid' },
        { label: 'Ensembles', value: '64 Hydro Runs' },
      ],
      details: [
        'Dual-layer GPU acceleration for hydrodynamic Eulerian drift simulation.',
        'Dark vessel kinematics reconstruction via kinematic reverse raytracing.',
        'Immutable cryptographic hashing for all tamper-evident evidentiary packets.',
      ],
    },
    {
      id: 'capabilities' as const,
      tag: 'MODULES',
      title: 'Capabilities',
      subtitle: 'Forensic Tracking & Tactical Interception',
      badge: 'Tactical Tier-1',
      icon: <Zap className="w-5 h-5 text-indigo-600" />,
      color: 'from-indigo-500/20 to-sky-500/10',
      borderColor: 'hover:border-indigo-300',
      description:
        'Autonomous dark-vessel correlation, slick boundary segmentation, automated legal dossier synthesis, and real-time emergency responder dispatch.',
      metrics: [
        { label: 'Attribution Rate', value: '96.8%' },
        { label: 'Evidence Grade', value: 'Admissible' },
        { label: 'Audit Trail', value: 'SHA-256' },
      ],
      details: [
        'Instant multi-channel alert dispatch to naval command centers and maritime authorities.',
        'Automated spill volume estimation and probabilistic coastal landfall modeling.',
        'Interactive 3D trajectory playback with interactive temporal scrubbers.',
      ],
    },
  ];

  const currentActiveCard = cardData.find((c) => c.id === activeTab);

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 35 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 22,
        delay: 0.35 + index * 0.12,
      },
    }),
  };

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none overflow-hidden"
      style={{
        backgroundColor: '#EBF3F8',
        backgroundImage: `
          radial-gradient(circle at 50% 20%, rgba(224, 242, 254, 0.9) 0%, rgba(235, 243, 248, 0.4) 60%),
          radial-gradient(circle at 85% 80%, rgba(186, 230, 253, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 15% 85%, rgba(199, 210, 254, 0.3) 0%, transparent 50%)
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Canvas Layer: Faint Concentric Ripple / Topographical Wave Contours */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Decorative Radial Atmospheric Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-tr from-cyan-200/40 via-sky-300/30 to-blue-200/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* 2. Main Container: Large Centered Rounded Glassmorphic Dashboard Frame */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl rounded-[32px] backdrop-blur-xl bg-white/45 border border-white/70 shadow-[0_24px_80px_-15px_rgba(14,116,144,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] overflow-hidden flex flex-col min-h-[680px] lg:min-h-[740px]"
      >
        {/* Top Edge Specular Glare */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 pointer-events-none" />

        {/* ============================================================== */}
        {/* HEADER: Clean Top Bar */}
        {/* ============================================================== */}
        <motion.header
          variants={itemVariants}
          className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between border-b border-white/40 bg-white/20 backdrop-blur-md relative z-30"
        >
          {/* Logo (HackX) */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab(null)}>
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-800 p-[1px] shadow-sm shadow-sky-900/10 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[11px] bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400/40 rounded-full blur-sm" />
                <span className="font-mono font-extrabold text-sm text-cyan-300 tracking-wider">HX</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Hack<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">X</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-100 text-sky-700 border border-sky-200">
                  v2.5
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 font-medium tracking-wide">
                DEFENSE INTELLIGENCE OS
              </span>
            </div>
          </div>

          {/* Pill-shaped Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-white/60 border border-white/80 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {['Platform', 'Architecture', 'Telemetry', 'Capabilities', 'Docs'].map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setActiveNav(item);
                    if (item === 'Architecture') setActiveTab('architecture');
                    else if (item === 'Capabilities') setActiveTab('capabilities');
                    else if (item === 'Platform') setActiveTab('about');
                    else setActiveTab(null);
                  }}
                  className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                    isActive
                      ? 'text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-full bg-white border border-slate-200/60 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Button: Connect / Launch */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onConnect}
              className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-white/60 border border-transparent hover:border-white/80 transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry: Active</span>
            </button>

            <button
              onClick={onLaunch}
              className="relative group overflow-hidden px-5 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white text-xs font-semibold tracking-wide shadow-md shadow-slate-900/15 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all duration-200 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.header>

        {/* ============================================================== */}
        {/* CENTER VISUAL & INTERACTIONS */}
        {/* ============================================================== */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[380px] lg:min-h-[440px]">
          {/* Subtle Ambient HUD Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(14, 165, 233, 0.4) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Interactive Floating 3D Glass Object Effect Container */}
          <motion.div
            style={{
              rotateX: smoothRotateX,
              rotateY: smoothRotateY,
              x: activeTab ? (window.innerWidth >= 1024 ? -160 : 0) : smoothTranslateX,
              y: smoothTranslateY,
            }}
            animate={
              activeTab
                ? {
                    scale: 0.9,
                    transition: { type: 'spring', stiffness: 220, damping: 24 },
                  }
                : {
                    scale: 1,
                    transition: { type: 'spring', stiffness: 220, damping: 24 },
                  }
            }
            className="relative z-10 flex flex-col items-center justify-center transition-transform duration-500"
          >
            {/* Zero-Gravity Levitation Bobbing Container */}
            <motion.div
              animate={{
                y: [-12, 10, -12],
                rotateZ: [-1.5, 1.5, -1.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center"
            >
              {/* Soft Radial Backlight Caustic under the Orb */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-400/30 via-sky-300/20 to-transparent rounded-full blur-2xl pointer-events-none" />

              {/* 3D Chrome Floating Brackets & Modular Hinges (Surrounding Object) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute w-72 h-72 sm:w-84 sm:h-84 pointer-events-none"
              >
                {/* Orbital Ring 1: Chrome Gyroscopic Axis */}
                <div className="absolute inset-0 rounded-full border border-sky-300/40 border-dashed" />

                {/* Top Modular Chrome Bracket */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-gradient-to-r from-slate-200 via-white to-slate-300 shadow-md border border-white flex items-center justify-between px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                  <div className="w-5 h-1 rounded-full bg-slate-400/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>

                {/* Bottom Modular Chrome Bracket */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-200 shadow-md border border-white flex items-center justify-between px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <div className="w-5 h-1 rounded-full bg-slate-400/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                </div>

                {/* Left Chrome Modular Hinge */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-4 h-12 rounded-full bg-gradient-to-b from-slate-200 via-white to-slate-400 shadow-md border border-white flex flex-col items-center justify-between py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <div className="w-1 h-3 rounded-full bg-slate-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                </div>

                {/* Right Chrome Modular Hinge */}
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-12 rounded-full bg-gradient-to-b from-slate-400 via-white to-slate-200 shadow-md border border-white flex flex-col items-center justify-between py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <div className="w-1 h-3 rounded-full bg-slate-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
              </motion.div>

              {/* Counter-Rotating Inner Orbital Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                className="absolute w-60 h-60 sm:w-72 sm:h-72 pointer-events-none rounded-full border-[1.5px] border-cyan-400/30 [border-image:linear-gradient(to_bottom,rgba(56,189,248,0.6),transparent)_1]"
              >
                {/* Floating Chrome Micro-Satellite / Sensor */}
                <div className="absolute top-2 right-10 w-3 h-3 rounded-full bg-gradient-to-br from-white to-slate-300 shadow-sm border border-white/80" />
                <div className="absolute bottom-4 left-12 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
              </motion.div>

              {/* Central 3D Refractive Glass Orb / Capsule */}
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center cursor-pointer group shadow-[0_20px_60px_-15px_rgba(14,165,233,0.35)]"
                onClick={() => {
                  setObjectMode((prev) =>
                    prev === 'refractive' ? 'capsule' : prev === 'capsule' ? 'quantum' : 'refractive'
                  );
                }}
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.65) 25%, rgba(186, 230, 253, 0.45) 55%, rgba(14, 165, 233, 0.25) 85%, rgba(2, 132, 199, 0.4) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.85)',
                  boxShadow:
                    'inset 0 0 25px rgba(255, 255, 255, 0.9), inset -10px -10px 30px rgba(14, 165, 233, 0.25), 0 20px 50px rgba(14, 165, 233, 0.2)',
                }}
              >
                {/* Specular Highlight Glare on Glass Upper Hemisphere */}
                <div
                  className="absolute top-3 left-6 w-28 h-16 rounded-full -rotate-45 pointer-events-none opacity-85"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 80%)',
                  }}
                />

                {/* Secondary Lower Refraction Rim Glow */}
                <div
                  className="absolute bottom-4 right-6 w-20 h-10 rounded-full rotate-45 pointer-events-none opacity-60"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.8) 0%, transparent 70%)',
                  }}
                />

                {/* Inner Glowing Pulsing Core Matrix */}
                <motion.div
                  animate={{
                    scale: [0.94, 1.06, 0.94],
                    opacity: [0.75, 1, 0.75],
                  }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(14, 165, 233, 0.2) 60%, transparent 90%)',
                    boxShadow: '0 0 35px rgba(0, 229, 255, 0.5)',
                  }}
                >
                  {/* Floating Holographic Geometry */}
                  <div className="w-16 h-16 rounded-2xl rotate-45 border border-cyan-300/60 bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <Sparkles className="w-7 h-7 text-cyan-500 animate-pulse" />
                  </div>
                </motion.div>

                {/* 3D Glass Surface Caustics / Prismatic Aberration Accent */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 pointer-events-none" />
              </div>

              {/* Dynamic Dropped Shadow beneath the Levitating Object */}
              <motion.div
                animate={{
                  scale: [1, 0.85, 1],
                  opacity: [0.35, 0.22, 0.35],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-16 w-48 h-8 rounded-full bg-gradient-to-r from-transparent via-slate-600/20 to-transparent blur-md pointer-events-none"
              />
            </motion.div>

            {/* ========================================================== */}
            {/* ANIMATED NUMERICAL COUNTER OVERLAY */}
            {/* ========================================================== */}
            <motion.div
              variants={itemVariants}
              className="mt-8 relative z-20 flex flex-col items-center"
            >
              {/* Frosted Glass Badge with Smooth Percentage Counter */}
              <div className="group relative flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgba(14,116,144,0.1)] hover:shadow-cyan-500/20 transition-all duration-300">
                {/* Glowing status pulse dot */}
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 relative" />
                </div>

                {/* Animated Percentage Counter */}
                <div className="flex items-baseline space-x-1">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {counterValue}
                  </span>
                  <span className="font-mono font-bold text-base text-cyan-600">%</span>
                </div>

                <div className="h-6 w-[1px] bg-slate-200" />

                {/* Status Readout */}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono font-bold text-slate-900 uppercase tracking-wider">
                    {isCounterFinished ? 'SYSTEM READY' : 'CALIBRATING CORE'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {isCounterFinished ? 'All 14 Clusters Synced' : 'Vector Ingestion Stream'}
                  </span>
                </div>

                {/* Re-trigger Button */}
                <button
                  onClick={handleRestartCounter}
                  title="Re-run sync benchmark"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors ml-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-label under Counter */}
              <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                <span>ESTIMATED LATENCY: 0.8ms</span>
                <span>•</span>
                <span className="text-cyan-600 font-semibold">ZERO-GRAVITY ENGINE ACTIVE</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ============================================================== */}
          {/* CONTEXTUAL FROSTED GLASS MODAL / DETAIL DRAWER (When Tab Clicked) */}
          {/* ============================================================== */}
          <AnimatePresence>
            {activeTab && currentActiveCard && (
              <motion.div
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="absolute right-4 sm:right-8 top-6 bottom-6 w-full max-w-md z-30 rounded-3xl backdrop-blur-2xl bg-white/85 border border-white shadow-[0_20px_70px_rgba(14,116,144,0.15)] flex flex-col p-6 sm:p-7 overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 border border-sky-100">
                      {currentActiveCard.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-600 tracking-wider uppercase">
                        {currentActiveCard.tag}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {currentActiveCard.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-Tab Navigation Bar */}
                <div className="flex items-center space-x-1.5 my-4 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs">
                  {cardData.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveTab(c.id)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                        activeTab === c.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {c.title.replace('HackX', '')}
                    </button>
                  ))}
                </div>

                {/* Content Body */}
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed font-normal">
                    {currentActiveCard.description}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 py-2">
                    {currentActiveCard.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/90 border border-slate-100 shadow-sm flex flex-col items-center text-center"
                      >
                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                          {m.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Feature Points */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10.5px] font-mono font-bold text-slate-900 uppercase tracking-wide">
                      Key Capabilities & Specifications
                    </span>
                    {currentActiveCard.details.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contextual Action Button */}
                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => {
                        setActiveTab(null);
                        if (onLaunch) onLaunch();
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Deploy {currentActiveCard.title} Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================== */}
        {/* DYNAMIC BOTTOM CARDS & TRANSITIONS */}
        {/* Three translucent rounded cards ("About", "Architecture", "Capabilities") */}
        {/* ============================================================== */}
        <div className="w-full p-4 sm:p-6 lg:p-8 pt-0 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {cardData.map((card, index) => {
              const isSelected = activeTab === card.id;

              return (
                <motion.div
                  key={card.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -6,
                    scale: 1.015,
                    transition: { type: 'spring', stiffness: 350, damping: 20 },
                  }}
                  onClick={() => setActiveTab(isSelected ? null : card.id)}
                  className={`relative p-5 sm:p-6 rounded-2xl backdrop-blur-xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-white/90 border-2 border-cyan-400 shadow-[0_12px_40px_rgba(14,165,233,0.18)]'
                      : 'bg-white/45 hover:bg-white/70 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(14,116,144,0.08)]'
                  }`}
                >
                  {/* Card Subtle Top Corner Glow */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} blur-xl pointer-events-none opacity-60`}
                  />

                  {/* Card Header Row */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-white/90 border border-white shadow-sm">
                        {card.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                        {card.tag}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-white/80 text-slate-700 border border-slate-200/60 shadow-xs">
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <div className="relative z-10 mb-2">
                    <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center justify-between">
                      <span>{card.title}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                          isSelected ? 'rotate-90 text-cyan-600' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </h4>
                    <p className="text-[11px] font-medium text-cyan-700 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Short Summary Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed relative z-10">
                    {card.description}
                  </p>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeCardIndicator"
                      className="absolute bottom-0 left-6 right-6 h-[3px] rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer Subtext within Dashboard Container */}
          <div className="mt-4 pt-3 border-t border-white/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>HACKX CORE ARCHITECTURE // ZERO-DAY MARITIME TELEMETRY</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span className="hover:text-slate-800 cursor-pointer">Security Protocol TLS 1.3</span>
              <span>•</span>
              <span className="hover:text-slate-800 cursor-pointer">ECMWF ERA-5 Synced</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HackXHeroSection;
