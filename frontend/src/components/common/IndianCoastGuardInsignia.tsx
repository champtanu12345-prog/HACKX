import React from 'react';

interface IndianCoastGuardInsigniaProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'color' | 'monochrome' | 'gold';
}

/**
 * Indian Coast Guard (भारतीय तटरक्षक) Crest & Insignia
 * Features crossed naval anchors, national Ashoka Chakra, laurel wreath,
 * and the official Coast Guard motto "वयं रक्षामः" (We Protect).
 */
export const IndianCoastGuardInsignia: React.FC<IndianCoastGuardInsigniaProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
}) => {
  const sizeMap = {
    xs: { w: 24, h: 24 },
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 56, h: 56 },
  };

  const { w, h } = sizeMap[size];

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="Indian Coast Guard Crest"
    >
      <defs>
        <linearGradient id="icgNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2545" />
          <stop offset="100%" stopColor="#00122E" />
        </linearGradient>
        <linearGradient id="icgGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="icgSaffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Crossed Naval Anchors */}
      <g stroke={variant === 'monochrome' ? '#334155' : 'url(#icgGoldGrad)'} strokeWidth="3" strokeLinecap="round">
        {/* Anchor 1: Top-left to bottom-right */}
        <line x1="26" y1="26" x2="74" y2="74" />
        <circle cx="26" cy="26" r="4" fill="none" strokeWidth="2.5" />
        <path d="M68 62 C73 70 78 72 74 74 C70 76 62 71 54 66" fill="none" strokeWidth="2.5" />
        
        {/* Anchor 2: Top-right to bottom-left */}
        <line x1="74" y1="26" x2="26" y2="74" />
        <circle cx="74" cy="26" r="4" fill="none" strokeWidth="2.5" />
        <path d="M32 62 C27 70 22 72 26 74 C30 76 38 71 46 66" fill="none" strokeWidth="2.5" />
      </g>

      {/* Central Shield Base */}
      <path
        d="M50 14 L76 22 C76 52 50 78 50 78 C50 78 24 52 24 22 Z"
        fill={variant === 'monochrome' ? '#1E293B' : 'url(#icgNavyGrad)'}
        stroke={variant === 'monochrome' ? '#64748B' : '#D4AF37'}
        strokeWidth="2.5"
      />

      {/* Tricolor Arc inside Shield */}
      <path
        d="M32 26 Q50 32 68 26"
        stroke="#FF9933"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 32 Q50 38 70 32"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 38 Q50 44 68 38"
        stroke="#138808"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Central Ashoka Chakra */}
      <circle cx="50" cy="48" r="11" fill="#FFFFFF" stroke="#000080" strokeWidth="1.5" />
      <circle cx="50" cy="48" r="2.5" fill="#000080" />
      {/* 24 Rays */}
      <g stroke="#000080" strokeWidth="0.8">
        <line x1="50" y1="38" x2="50" y2="58" />
        <line x1="40" y1="48" x2="60" y2="48" />
        <line x1="43" y1="41" x2="57" y2="55" />
        <line x1="57" y1="41" x2="43" y2="55" />
        <line x1="41" y1="44" x2="59" y2="52" />
        <line x1="41" y1="52" x2="59" y2="44" />
        <line x1="46" y1="39" x2="54" y2="57" />
        <line x1="54" y1="39" x2="46" y2="57" />
      </g>

      {/* Laurel Wreath on Sides */}
      <path
        d="M20 34 C16 48 18 64 28 74 M80 34 C84 48 82 64 72 74"
        stroke={variant === 'monochrome' ? '#94A3B8' : '#D4AF37'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 3"
        fill="none"
      />

      {/* Bottom Motto Scroll Ribbon */}
      <path
        d="M16 83 L28 80 L50 83 L72 80 L84 83 L80 91 L50 88 L20 91 Z"
        fill={variant === 'monochrome' ? '#0F172A' : '#0B2545'}
        stroke={variant === 'monochrome' ? '#475569' : '#D4AF37'}
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="87"
        textAnchor="middle"
        fill="#FFD700"
        fontSize="5.2"
        fontFamily="'Noto Serif Devanagari', 'Tiro Devanagari Hindi', Georgia, serif"
        fontWeight="bold"
        letterSpacing="0.04em"
      >
        वयं रक्षामः
      </text>

      {/* English subtitle */}
      <text
        x="50"
        y="96"
        textAnchor="middle"
        fill={variant === 'monochrome' ? '#64748B' : '#0B2545'}
        fontSize="4.2"
        fontFamily="sans-serif"
        fontWeight="bold"
        letterSpacing="0.08em"
      >
        INDIAN COAST GUARD
      </text>
    </svg>
  );
};
