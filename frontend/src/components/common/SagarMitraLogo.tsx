import React from 'react';

interface SagarMitraLogoProps {
  size?: number; // pixel width/height (default 42)
  className?: string;
  withPulse?: boolean;
}

export const SagarMitraLogo: React.FC<SagarMitraLogoProps> = ({
  size = 42,
  className = '',
  withPulse = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Ambient Expanding Golden Radar Ring (Appearing/Breathing Animation) */}
      {withPulse && (
        <span
          className="absolute inset-0 rounded-full bg-[#D4AF37]/30 animate-ping opacity-60 pointer-events-none"
          style={{ animationDuration: '3.2s' }}
        />
      )}

      {/* 2. Classical Naval Insignia SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transform transition-transform duration-500 hover:rotate-6"
      >
        <defs>
          {/* Royal Maritime Gold Metallic Gradient */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFFBEB" />
            <stop offset="75%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Deep Naval Enamel Gradient */}
          <linearGradient id="navalEnamel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E2A47" />
            <stop offset="50%" stopColor="#07192C" />
            <stop offset="100%" stopColor="#030C16" />
          </linearGradient>

          {/* Radar Glow Gradient */}
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="65%" stopColor="#0B2545" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#07192C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Classical Burnished Gold Border */}
        <circle cx="50" cy="50" r="47" stroke="url(#goldRim)" strokeWidth="3" />

        {/* Classical Beaded Nautical Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeDasharray="2.5 3.5"
          opacity="0.85"
        />

        {/* Deep Naval Blue Enamel Center */}
        <circle cx="50" cy="50" r="41.5" fill="url(#navalEnamel)" />

        {/* Tactical Radar Concentric Circles */}
        <circle cx="50" cy="50" r="32" stroke="#38BDF8" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="21" stroke="#38BDF8" strokeWidth="0.8" opacity="0.4" />
        <circle cx="50" cy="50" r="10" stroke="#38BDF8" strokeWidth="0.8" opacity="0.5" />

        {/* Radar Ambient Sweep Sector */}
        <circle cx="50" cy="50" r="38" fill="url(#radarSweep)" />

        {/* Navigational 4-Point Compass Crosshairs */}
        <line x1="50" y1="12" x2="50" y2="88" stroke="#D4AF37" strokeWidth="0.9" opacity="0.5" />
        <line x1="12" y1="50" x2="88" y2="50" stroke="#D4AF37" strokeWidth="0.9" opacity="0.5" />

        {/* Classical Indian Coast Guard / Naval Anchor Motif */}
        {/* Anchor Ring Top */}
        <circle cx="50" cy="24" r="5" stroke="url(#goldRim)" strokeWidth="2.2" fill="none" />
        <circle cx="50" cy="24" r="2" fill="#D4AF37" />

        {/* Anchor Stock (Horizontal bar) */}
        <line x1="38" y1="32" x2="62" y2="32" stroke="url(#goldRim)" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="38" cy="32" r="1.5" fill="#FFFBEB" />
        <circle cx="62" cy="32" r="1.5" fill="#FFFBEB" />

        {/* Anchor Shank (Vertical shaft) */}
        <line x1="50" y1="28" x2="50" y2="72" stroke="url(#goldRim)" strokeWidth="3.2" strokeLinecap="round" />

        {/* Anchor Flukes / Curved Crescent */}
        <path
          d="M 30 58 Q 50 82 70 58"
          stroke="url(#goldRim)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Arrowhead Fluke */}
        <polygon points="30,58 25,62 33,65" fill="#D4AF37" />

        {/* Right Arrowhead Fluke */}
        <polygon points="70,58 75,62 67,65" fill="#D4AF37" />

        {/* Anchor Crown Tip */}
        <polygon points="50,75 46,70 54,70" fill="#FFFBEB" />

        {/* Classical AI Diamond Core (Intertwined Innovation) */}
        <polygon
          points="50,44 55,50 50,56 45,50"
          fill="#10B981"
          stroke="#D4AF37"
          strokeWidth="1.2"
          className="animate-pulse"
        />
        <circle cx="50" cy="50" r="1.6" fill="#FFFFFF" />

        {/* Sovereign Tricolor Accent Arc at Bottom */}
        <path d="M 38 90 Q 50 93 62 90" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <path d="M 40 92 Q 50 95 60 92" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
        <path d="M 42 94 Q 50 97 58 94" stroke="#138808" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
  );
};
