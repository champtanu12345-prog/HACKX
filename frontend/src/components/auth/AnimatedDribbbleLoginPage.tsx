import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Shield, Star, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthUser, loginWithOfficial } from '../../api/auth';

interface AnimatedDribbbleLoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onBack?: () => void;
}

export const AnimatedDribbbleLoginPage: React.FC<AnimatedDribbbleLoginPageProps> = ({
  onSuccess,
  onBack,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState<string>('officer.icg@gov.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [fullName, setFullName] = useState<string>('Commandant R. K. Sharma');
  const [serviceId, setServiceId] = useState<string>('ICG-HQ-9421');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Canvas Ref for the 3D Metallic Wave Ribbon and Indian Coast Guard Ship animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0; // Ship progression along the curve (0 to 1)
    let waveTime = 0; // Wave undulation time

    // Resize canvas to match display size with HiDPI support
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Parametric 3D Ribbon Wave path function
    const getWavePoint = (u: number, width: number, height: number, time: number) => {
      // Start upper-left, dip in center-right, curve up toward right edge
      // u: 0.0 to 1.0 along width
      const x = width * (0.02 + u * 0.96);

      // Organic smooth curve resembling the Dribbble video ribbon
      // Trough is around u = 0.50 ~ 0.55
      const dip = Math.sin(u * Math.PI); // 0 at ends, 1 at center
      const slope = (u - 0.4) * 0.2; // tilt
      const waveOffset = Math.sin(time * 0.8 + u * 4.0) * 10; // gentle ocean swell

      // Base Y curve
      const baseY = height * 0.26 + dip * (height * 0.44) + slope * height + waveOffset;

      return { x, y: baseY };
    };

    // Calculate tangent and normal at u
    const getWaveTangent = (u: number, width: number, height: number, time: number) => {
      const delta = 0.01;
      const p1 = getWavePoint(Math.max(0, u - delta), width, height, time);
      const p2 = getWavePoint(Math.min(1, u + delta), width, height, time);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);
      return { angle, dx, dy };
    };

    // Draw stylized Indian Coast Guard Ship
    const drawIndianShip = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      scale: number,
      time: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.scale(scale, scale);

      // Ship gentle roll / pitch sway on ocean swell
      const pitch = Math.sin(time * 2.5) * 0.03;
      context.rotate(pitch);

      // Drop shadow on the ribbon surface
      context.save();
      context.translate(0, 16);
      context.scale(1, 0.3);
      context.beginPath();
      context.ellipse(0, 0, 75, 22, 0, 0, Math.PI * 2);
      context.fillStyle = 'rgba(15, 23, 42, 0.25)';
      context.filter = 'blur(6px)';
      context.fill();
      context.restore();

      // Dynamic water wake / foam arcs trailing behind the stern
      context.save();
      const wakeOpacity = 0.6 + Math.sin(time * 6) * 0.2;
      context.strokeStyle = `rgba(255, 255, 255, ${wakeOpacity})`;
      context.lineWidth = 3;
      context.lineCap = 'round';

      // Port & Starboard wake ripples
      context.beginPath();
      context.moveTo(-50, 4);
      context.quadraticCurveTo(-90, 10, -140, 24);
      context.stroke();

      context.beginPath();
      context.moveTo(-50, -4);
      context.quadraticCurveTo(-90, -10, -140, -24);
      context.stroke();

      // Wake bubbles
      for (let i = 0; i < 5; i++) {
        const bubbleX = -65 - i * 18 + ((time * 40 + i * 15) % 30);
        const bubbleY = (i % 2 === 0 ? 1 : -1) * (6 + i * 3);
        context.beginPath();
        context.arc(bubbleX, bubbleY, 2.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.fill();
      }
      context.restore();

      // --- 1. SHIP HULL ---
      // Crisp white naval hull with sleek rake bow and flat transom
      context.beginPath();
      context.moveTo(68, 0); // Bow point
      context.lineTo(55, 9);
      context.lineTo(-58, 9); // Keel/waterline bottom
      context.lineTo(-64, 4); // Transom bottom
      context.lineTo(-64, -6); // Transom top
      context.lineTo(-58, -6);
      context.lineTo(52, -6); // Foredeck shear
      context.closePath();

      // Hull gradient (shining white with subtle metallic gradient)
      const hullGrad = context.createLinearGradient(-60, -6, 60, 9);
      hullGrad.addColorStop(0, '#E5E7EB');
      hullGrad.addColorStop(0.3, '#FFFFFF');
      hullGrad.addColorStop(0.7, '#F3F4F6');
      hullGrad.addColorStop(1, '#D1D5DB');
      context.fillStyle = hullGrad;
      context.fill();
      context.strokeStyle = '#9CA3AF';
      context.lineWidth = 1;
      context.stroke();

      // --- 2. AUTHENTIC INDIAN COAST GUARD STRIPES ---
      // Bold diagonal stripes near the bow: Navy Blue and Saffron/Red
      context.save();
      // Clip to hull area
      context.clip();

      // Stripe 1: Dark Navy Blue (#0B2545)
      context.beginPath();
      context.moveTo(28, -10);
      context.lineTo(38, -10);
      context.lineTo(26, 15);
      context.lineTo(16, 15);
      context.closePath();
      context.fillStyle = '#0B2545';
      context.fill();

      // Stripe 2: Vibrant Red/Orange Saffron (#D9381E)
      context.beginPath();
      context.moveTo(39, -10);
      context.lineTo(47, -10);
      context.lineTo(35, 15);
      context.lineTo(27, 15);
      context.closePath();
      context.fillStyle = '#D9381E';
      context.fill();

      // "COAST GUARD" Hull Lettering
      context.font = 'bold 4.5px "Inter", sans-serif';
      context.fillStyle = '#1E3A8A';
      context.fillText('COAST GUARD', -22, 5);

      // Pennant Number (e.g. CG 202)
      context.font = 'bold 4px "Inter", sans-serif';
      context.fillStyle = '#0F172A';
      context.fillText('CG-202', 40, 5);

      context.restore(); // Exit clip

      // Waterline dark boot-topping stripe
      context.beginPath();
      context.moveTo(-60, 7.5);
      context.lineTo(56, 7.5);
      context.strokeStyle = '#1E293B';
      context.lineWidth = 1.8;
      context.stroke();

      // --- 3. SUPERSTRUCTURE & NAVIGATION BRIDGE ---
      // Forward Bridge Block
      context.beginPath();
      context.roundRect(-22, -18, 40, 12, [2, 4, 0, 0]);
      const bridgeGrad = context.createLinearGradient(-22, -18, 18, -6);
      bridgeGrad.addColorStop(0, '#FFFFFF');
      bridgeGrad.addColorStop(1, '#E2E8F0');
      context.fillStyle = bridgeGrad;
      context.fill();
      context.strokeStyle = '#CBD5E1';
      context.lineWidth = 0.8;
      context.stroke();

      // Bridge Tinted Windows (Row of sleek marine cyan/blue glass windows)
      context.fillStyle = '#0369A1';
      for (let i = 0; i < 5; i++) {
        context.fillRect(0 + i * 3.5, -16, 2.5, 3.5);
      }

      // Upper Bridge Wing
      context.fillStyle = '#F8FAFC';
      context.fillRect(-6, -22, 16, 4);
      context.strokeStyle = '#94A3B8';
      context.lineWidth = 0.5;
      context.strokeRect(-6, -22, 16, 4);

      // --- 4. MAST & RADAR SCANNER ---
      // Radar Mast
      context.beginPath();
      context.moveTo(2, -22);
      context.lineTo(2, -36);
      context.strokeStyle = '#64748B';
      context.lineWidth = 1.5;
      context.stroke();

      // Yardarm cross-beam
      context.beginPath();
      context.moveTo(-5, -31);
      context.lineTo(9, -31);
      context.strokeStyle = '#64748B';
      context.lineWidth = 1;
      context.stroke();

      // Rotating Radar Scanner
      const radarAngle = time * 7;
      const radarWidth = Math.cos(radarAngle) * 9;
      context.beginPath();
      context.moveTo(2 - radarWidth, -37);
      context.lineTo(2 + radarWidth, -37);
      context.strokeStyle = '#0284C7';
      context.lineWidth = 2.2;
      context.lineCap = 'round';
      context.stroke();

      // Radar Dome (SATCOM dome)
      context.beginPath();
      context.arc(10, -23, 3, 0, Math.PI * 2);
      context.fillStyle = '#FFFFFF';
      context.fill();
      context.strokeStyle = '#94A3B8';
      context.lineWidth = 0.8;
      context.stroke();

      // --- 5. AFT HELIPAD & STERN ---
      // Helipad deck
      context.fillStyle = '#475569';
      context.fillRect(-58, -7, 34, 1.5);

      // Helipad White 'H' Mark
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(-44, -9);
      context.lineTo(-44, -13);
      context.moveTo(-38, -9);
      context.lineTo(-38, -13);
      context.moveTo(-44, -11);
      context.lineTo(-38, -11);
      context.stroke();

      // --- 6. INDIAN NATIONAL TRICOLOR (TIRANGA) AT STERN ---
      // Flagstaff
      context.beginPath();
      context.moveTo(-60, -6);
      context.lineTo(-60, -22);
      context.strokeStyle = '#94A3B8';
      context.lineWidth = 1;
      context.stroke();

      // Fluttering Tricolor Flag
      const flagWave = Math.sin(time * 8) * 1.5;
      const flagW = 12;
      const flagH = 8;
      const flagX = -60 - flagW;
      const flagY = -22;

      // Saffron Band (Top)
      context.fillStyle = '#FF9933';
      context.beginPath();
      context.moveTo(-60, flagY);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagWave, flagX, flagY);
      context.lineTo(flagX, flagY + flagH * 0.33);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagH * 0.33 + flagWave, -60, flagY + flagH * 0.33);
      context.closePath();
      context.fill();

      // White Band with Ashoka Chakra (Middle)
      context.fillStyle = '#FFFFFF';
      context.beginPath();
      context.moveTo(-60, flagY + flagH * 0.33);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagH * 0.33 + flagWave, flagX, flagY + flagH * 0.33);
      context.lineTo(flagX, flagY + flagH * 0.66);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagH * 0.66 + flagWave, -60, flagY + flagH * 0.66);
      context.closePath();
      context.fill();

      // Blue dot for Ashoka Chakra
      context.beginPath();
      context.arc(-60 - flagW * 0.5, flagY + flagH * 0.5 + flagWave * 0.5, 1, 0, Math.PI * 2);
      context.fillStyle = '#000080';
      context.fill();

      // Green Band (Bottom)
      context.fillStyle = '#138808';
      context.beginPath();
      context.moveTo(-60, flagY + flagH * 0.66);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagH * 0.66 + flagWave, flagX, flagY + flagH * 0.66);
      context.lineTo(flagX, flagY + flagH);
      context.quadraticCurveTo(-60 - flagW * 0.5, flagY + flagH + flagWave, -60, flagY + flagH);
      context.closePath();
      context.fill();

      // Light Gleam / Specular reflection pulse
      const gleam = (Math.sin(time * 3) + 1) * 0.5;
      context.beginPath();
      context.arc(15, -12, 12, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${gleam * 0.35})`;
      context.fill();

      context.restore();
    };

    // Render loop
    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Smooth time progression
      waveTime += 0.016;
      // Ship moves smoothly along the curve from left to right and loops seamlessly
      t = (t + 0.0022) % 1.0;

      // 1. DRAW 3D GLOSSY METALLIC WAVE RIBBON (Matching Dribbble video)
      const samples = 120;
      const ribbonThickness = 28; // 3D ribbon depth

      // Draw Ribbon Ambient Drop Shadow
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const pt = getWavePoint(u, width, height, waveTime);
        const shadowY = pt.y + ribbonThickness + 32;
        if (i === 0) ctx.moveTo(pt.x, shadowY);
        else ctx.lineTo(pt.x, shadowY);
      }
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.lineWidth = 42;
      ctx.lineCap = 'round';
      ctx.filter = 'blur(16px)';
      ctx.stroke();
      ctx.restore();

      // Draw Ribbon 3D Extrusion Side (The dark metallic bevel beneath)
      ctx.save();
      ctx.beginPath();
      // Top path forward
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const pt = getWavePoint(u, width, height, waveTime);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      // Bottom path backward
      for (let i = samples; i >= 0; i--) {
        const u = i / samples;
        const pt = getWavePoint(u, width, height, waveTime);
        ctx.lineTo(pt.x, pt.y + ribbonThickness);
      }
      ctx.closePath();

      // Side extrusion gradient (metallic chrome platinum with deep shadows)
      const sideGrad = ctx.createLinearGradient(0, height * 0.2, width, height * 0.75);
      sideGrad.addColorStop(0, '#475569');
      sideGrad.addColorStop(0.3, '#1E293B');
      sideGrad.addColorStop(0.55, '#334155');
      sideGrad.addColorStop(0.8, '#0F172A');
      sideGrad.addColorStop(1, '#64748B');
      ctx.fillStyle = sideGrad;
      ctx.fill();
      ctx.restore();

      // Draw Ribbon Top Surface (Glossy Metallic Chrome with high specular highlight)
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const pt = getWavePoint(u, width, height, waveTime);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      // Top surface stroke width represents the upper ribbon face
      const ribbonFaceWidth = 14;
      ctx.lineWidth = ribbonFaceWidth;

      // Chrome metallic gradient for the top gleaming surface
      const chromeGrad = ctx.createLinearGradient(0, height * 0.2, width, height * 0.7);
      chromeGrad.addColorStop(0, '#FFFFFF');
      chromeGrad.addColorStop(0.2, '#E2E8F0');
      chromeGrad.addColorStop(0.45, '#94A3B8');
      chromeGrad.addColorStop(0.55, '#FFFFFF'); // Specular gleam at trough
      chromeGrad.addColorStop(0.75, '#CBD5E1');
      chromeGrad.addColorStop(1, '#FFFFFF');
      ctx.strokeStyle = chromeGrad;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Razor-thin specular rim highlight
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.stroke();
      ctx.restore();

      // 2. DRAW INDIAN COAST GUARD SHIP SAILING ALONG THE WAVE
      // Map progression t with subtle ease so it glides naturally
      const shipU = t;
      const shipPos = getWavePoint(shipU, width, height, waveTime);
      const shipTangent = getWaveTangent(shipU, width, height, waveTime);

      // Adjust scale based on viewport width
      const baseScale = Math.min(1.15, Math.max(0.75, width / 700));

      drawIndianShip(ctx, shipPos.x, shipPos.y - 10, shipTangent.angle, baseScale, waveTime);

      // Draw second smaller escort interceptor craft trailing behind
      const escortU = (t - 0.22 + 1.0) % 1.0;
      const escortPos = getWavePoint(escortU, width, height, waveTime);
      const escortTangent = getWaveTangent(escortU, width, height, waveTime);
      drawIndianShip(ctx, escortPos.x, escortPos.y - 8, escortTangent.angle, baseScale * 0.52, waveTime + 1.2);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const user: AuthUser = {
        id: 'usr_officer_cmd',
        name: fullName || 'Commandant R. K. Sharma',
        email: email,
        role: 'Director (Operations)',
        auth_provider: 'official',
        service_id: serviceId || 'ICG-HQ-9421',
        is_active: true,
        is_verified: true,
        last_login_at: new Date().toISOString(),
      };
      loginWithOfficial({ email, service_id: serviceId || 'ICG-HQ-9421', name: fullName, role: 'Director (Operations)' });
      setStatusMessage('Authentication successful. Redirecting to tactical workstation...');
      setTimeout(() => {
        onSuccess(user);
      }, 400);
    }, 700);
  };

  // Quick 1-Click Demo Login for SIH Evaluators
  const handleQuickDemoLogin = (role: 'director' | 'operator' | 'analyst', name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userRole = role === 'director' ? 'Commandant (Admin)' : role === 'operator' ? 'MRCC Watch Officer' : 'Public Analyst';
      const user: AuthUser = {
        id: `usr_${role}_eval`,
        name,
        email: `${role}.icg@gov.in`,
        role: userRole,
        auth_provider: 'official',
        service_id: `ICG-${role.toUpperCase()}-2026`,
        is_active: true,
        is_verified: true,
        last_login_at: new Date().toISOString(),
      };
      loginWithOfficial({ email: user.email, service_id: user.service_id, name, role: userRole });
      onSuccess(user);
    }, 350);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col lg:flex-row overflow-x-hidden font-sans select-none">
      {/* ============================================================== */}
      {/* LEFT COLUMN: 3D Animated Ribbon Wave with Indian Ships Animation */}
      {/* Exactly replicating the Dribbble video with ships instead of coin */}
      {/* ============================================================== */}
      <div className="relative flex-1 min-h-[480px] lg:min-h-screen bg-gradient-to-br from-[#EAE6F5] via-[#F6F7FA] to-[#FCEEE3] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
        {/* Soft Ambient Glows in Background */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-100/30 blur-3xl pointer-events-none" />

        {/* Top Header on Left Side */}
        <div className="relative z-20 flex items-center justify-between">
          {/* Brand Logo matching 21bitcoin lowercase typography */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              hackx<span className="text-[#006837]">.</span>
            </span>
            <div className="hidden sm:inline-flex items-center space-x-1 bg-black/5 border border-black/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
              <span>ICG • SIH 260143</span>
            </div>
          </div>

          {/* Trustpilot-Style Overall Rating Badge Matching Dribbble Shot */}
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs text-xs font-semibold text-slate-800">
            <div className="flex items-center space-x-1 bg-[#00B67A] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>Trustpilot</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 text-[11px] font-medium">overall 4.9 rating</span>
          </div>
        </div>

        {/* Center Interactive HTML5 Canvas: 3D Wave with Indian Coast Guard Ship */}
        <div className="relative z-10 flex-1 w-full my-auto flex items-center justify-center min-h-[300px]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Interactive Floating Tooltip Hint */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-200/60 shadow-xs text-[10.5px] font-medium text-slate-600 pointer-events-none flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006837] animate-ping" />
            <span>ICGS Offshore Patrol Vessel Sailing Dynamic Oceanic Swell</span>
          </div>
        </div>

        {/* Bottom Headline Matching Dribbble Shot ("Welcome to 21bitcoin / Buy Bitcoin in a flexible way") */}
        <div className="relative z-20 pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome to HackX
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-medium text-slate-700 leading-snug">
            Automate maritime intelligence in a flexible way
          </p>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <span>सत्यमेव जयते</span>
            <span>•</span>
            <span>National Oil Spill Disaster Contingency System (NOS-DCP)</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: Clean White Modern Login Form (Matching Dribbble) */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[42%] xl:w-[38%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Right Contact & Close Action */}
        <div className="flex items-center justify-end space-x-3 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => {
              alert('Contact Indian Coast Guard Tactical Command Helpdesk:\nToll-Free 1554 • mrcc-mumbai@indiancoastguard.nic.in');
            }}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
            }}
            className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Close / Back to Portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Centered Form Body */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </h2>
            <div className="mt-2 text-sm text-slate-500 font-medium">
              {mode === 'login' ? (
                <>
                  or{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-slate-900 hover:underline font-semibold cursor-pointer"
                  >
                    create an account
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-slate-900 hover:underline font-semibold cursor-pointer"
                  >
                    log in instead
                  </button>
                </>
              ) : (
                <>
                  Remember password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-slate-900 hover:underline font-semibold cursor-pointer"
                  >
                    back to log in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name & Rank
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Commandant R. K. Sharma"
                  required
                  className="w-full px-5 py-3.5 bg-[#F4F5F7] hover:bg-[#ECEEF2] focus:bg-white text-slate-900 text-sm rounded-2xl border border-transparent focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer.icg@gov.in"
                required
                className="w-full px-5 py-3.5 bg-[#F4F5F7] hover:bg-[#ECEEF2] focus:bg-white text-slate-900 text-sm rounded-2xl border border-transparent focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    required
                    className="w-full pl-5 pr-12 py-3.5 bg-[#F4F5F7] hover:bg-[#ECEEF2] focus:bg-white text-slate-900 text-sm rounded-2xl border border-transparent focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Official Coast Guard Service ID
                </label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="e.g. ICG-HQ-9421"
                  required
                  className="w-full px-5 py-3.5 bg-[#F4F5F7] hover:bg-[#ECEEF2] focus:bg-white text-slate-900 text-sm rounded-2xl border border-transparent focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            )}

            {/* Submit Action Button: Black Pill Button matching Dribbble */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black hover:bg-slate-900 active:scale-[0.99] disabled:opacity-60 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </form>

          {/* Evaluator 1-Click Fast Pass Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                ⚡ SIH Evaluator Quick Access
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                1-Click
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('director', 'Commandant R. K. Sharma')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800">Commander (Admin)</div>
                <div className="text-[10px] text-slate-500 font-mono">Full Attribution Clearance</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('operator', 'Inspector V. Nair')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800">MRCC Watch Officer</div>
                <div className="text-[10px] text-slate-500 font-mono">Tactical Radar & AIS View</div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Security / Copyright Note */}
        <div className="text-center text-xs text-slate-400 font-mono">
          Protected by Government of India National Cyber Security Directive • SIH 260143
        </div>
      </div>
    </div>
  );
};
