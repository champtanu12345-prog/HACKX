import React, { useEffect, useRef } from 'react';

export interface WarpBackgroundCanvasProps {
  /** Number of high-speed radiating particles (default: 700) */
  starCount?: number;
  /** Warp forward velocity speed factor (default: 22) */
  speed?: number;
  /** Particle trail stretch length factor (default: 0.65) */
  trailLength?: number;
  /** Mouse parallax perspective sensitivity (default: 0.25) */
  parallaxFactor?: number;
  /** Dual-tone color palette mode */
  colorMode?: 'dualtone' | 'cyan' | 'amber';
  /** Pitch black background hex override (default: #050505) */
  backgroundColor?: string;
  /** Additional custom classNames */
  className?: string;
  /** Pause / Resume rendering */
  isActive?: boolean;
}

interface PaletteColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  glow: string;
  core: string;
}

const PALETTES: Record<'cyan' | 'amber', PaletteColor> = {
  cyan: {
    r: 0,
    g: 240,
    b: 255,
    hex: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.8)',
    core: 'rgba(230, 252, 255, 0.95)',
  },
  amber: {
    r: 255,
    g: 106,
    b: 0,
    hex: '#FF6A00',
    glow: 'rgba(255, 106, 0, 0.85)',
    core: 'rgba(255, 240, 220, 0.95)',
  },
};

export const WarpBackgroundCanvas: React.FC<WarpBackgroundCanvasProps> = ({
  starCount = 700,
  speed = 22,
  trailLength = 0.65,
  parallaxFactor = 0.25,
  colorMode = 'dualtone',
  backgroundColor = '#050505',
  className = '',
  isActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep animated params synced to refs so animate loop always reads latest props without re-initializing
  const paramsRef = useRef({
    starCount,
    speed,
    trailLength,
    parallaxFactor,
    colorMode,
    backgroundColor,
    isActive,
  });

  useEffect(() => {
    paramsRef.current = {
      starCount,
      speed,
      trailLength,
      parallaxFactor,
      colorMode,
      backgroundColor,
      isActive,
    };
  }, [starCount, speed, trailLength, parallaxFactor, colorMode, backgroundColor, isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let centerX = width / 2;
    let centerY = height / 2;

    let targetVanishingX = centerX;
    let targetVanishingY = centerY;
    let vanishingX = centerX;
    let vanishingY = centerY;

    // Warp Streak Particle Definition
    class WarpStreak {
      x: number = 0;
      y: number = 0;
      z: number = 0;
      pz: number = 0;
      speedMultiplier: number = 1;
      width: number = 1;
      palette: PaletteColor = PALETTES.cyan;

      constructor(initial = true) {
        this.reset(initial);
      }

      reset(initial = false) {
        const maxDepth = 1800;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.pow(Math.random(), 0.7) * (Math.max(width, height) * 0.9) + 40;

        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.z = initial ? Math.random() * maxDepth : maxDepth;
        this.pz = this.z;

        this.speedMultiplier = 0.85 + Math.random() * 0.4;
        this.width = 0.5 + Math.random() * 1.5;

        // Assign Dual-tone Color
        let isCyan = true;
        const currentMode = paramsRef.current.colorMode;
        if (currentMode === 'dualtone') {
          isCyan = Math.random() < 0.5;
        } else if (currentMode === 'amber') {
          isCyan = Math.random() < 0.15;
        } else {
          isCyan = Math.random() < 0.85;
        }

        this.palette = isCyan ? PALETTES.cyan : PALETTES.amber;
      }

      update(effectiveSpeed: number) {
        this.pz = this.z;
        this.z -= effectiveSpeed * this.speedMultiplier;

        if (this.z <= 12) {
          this.reset(false);
        }
      }

      draw() {
        if (!ctx) return;
        const fov = 320;
        const maxDepth = 1800;
        const kCurrent = fov / this.z;
        const sx = this.x * kCurrent + vanishingX;
        const sy = this.y * kCurrent + vanishingY;

        const currentTrail = paramsRef.current.trailLength;
        const trailZ = this.z + (this.pz - this.z) * (currentTrail * 3.5);
        const kPrev = fov / Math.max(trailZ, 1);
        const px = this.x * kPrev + vanishingX;
        const py = this.y * kPrev + vanishingY;

        // Viewport bounds culling
        if (
          (sx < -100 && px < -100) ||
          (sx > width + 100 && px > width + 100) ||
          (sy < -100 && py < -100) ||
          (sy > height + 100 && py > height + 100)
        ) {
          if (this.z < maxDepth * 0.5) {
            this.reset(false);
          }
          return;
        }

        const proximity = 1 - Math.min(this.z / maxDepth, 1);
        const streakWidth = this.width + proximity * 3.2;

        const dx = sx - px;
        const dy = sy - py;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1.0) return;

        // Linear gradient: Fading tail -> Saturated body -> Radiating white tip
        const gradient = ctx.createLinearGradient(px, py, sx, sy);
        const { r, g, b } = this.palette;

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${0.5 + proximity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${Math.min(0.95, 0.7 + proximity * 0.3)})`);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = streakWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Star tip glint
        if (proximity > 0.65) {
          ctx.beginPath();
          ctx.arc(sx, sy, streakWidth * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = this.palette.core;
          ctx.fill();
        }
      }
    }

    // Initialize particles array
    let particles: WarpStreak[] = [];
    const targetCount = paramsRef.current.starCount;
    for (let i = 0; i < targetCount; i++) {
      particles.push(new WarpStreak(true));
    }

    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      centerX = width / 2;
      centerY = height / 2;
      targetVanishingX = centerX;
      targetVanishingY = centerY;
    };

    // Mouse Tracking for Parallax Perspective Shift
    // Window-level listener ensures non-blocking pointer-events: none canvas captures cursor everywhere
    const handleMouseMove = (e: MouseEvent) => {
      const pFactor = paramsRef.current.parallaxFactor;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      targetVanishingX = centerX + deltaX * pFactor;
      targetVanishingY = centerY + deltaY * pFactor;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const pFactor = paramsRef.current.parallaxFactor;
        const deltaX = t.clientX - centerX;
        const deltaY = t.clientY - centerY;
        targetVanishingX = centerX + deltaX * pFactor;
        targetVanishingY = centerY + deltaY * pFactor;
      }
    };

    const handleMouseLeave = () => {
      targetVanishingX = centerX;
      targetVanishingY = centerY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    handleResize();

    // Main Animation Loop
    const animate = () => {
      if (!paramsRef.current.isActive) {
        animFrameId = requestAnimationFrame(animate);
        return;
      }

      // Maintain particle density dynamically if prop changes
      const wantedCount = paramsRef.current.starCount;
      while (particles.length < wantedCount) {
        particles.push(new WarpStreak(false));
      }
      if (particles.length > wantedCount) {
        particles.length = wantedCount;
      }

      // Smooth Vanishing Point Perspective Interpolation (Spring Lerp)
      vanishingX += (targetVanishingX - vanishingX) * 0.08;
      vanishingY += (targetVanishingY - vanishingY) * 0.08;

      const currentSpeed = paramsRef.current.speed;

      // 1. Motion Blur Background Fill (Pitch Black #050505 with subtle opacity persistence)
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 5, 5, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // 2. Central Hyperspace Horizon Core Glow
      const glowRadius = 180;
      const centralGlow = ctx.createRadialGradient(
        vanishingX,
        vanishingY,
        0,
        vanishingX,
        vanishingY,
        glowRadius
      );
      centralGlow.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      centralGlow.addColorStop(0.35, 'rgba(255, 106, 0, 0.06)');
      centralGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');

      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(vanishingX, vanishingY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Render Streaks with Additive Lighter Blending
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(currentSpeed);
        p.draw();
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-screen h-screen pointer-events-none -z-10 bg-[#050505] block ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        backgroundColor: '#050505',
      }}
      aria-hidden="true"
    />
  );
};

export default WarpBackgroundCanvas;
