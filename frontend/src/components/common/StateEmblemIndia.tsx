import React from 'react';

interface StateEmblemIndiaProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'monochrome' | 'navy' | 'white';
}

/**
 * State Emblem of India (Lion Capital of Ashoka)
 * With national motto "सत्यमेव जयते" (Truth Alone Triumphs) in Devanagari script.
 */
export const StateEmblemIndia: React.FC<StateEmblemIndiaProps> = ({
  className = '',
  size = 'md',
  variant = 'gold',
}) => {
  const sizeMap = {
    xs: { w: 20, h: 28 },
    sm: { w: 28, h: 38 },
    md: { w: 36, h: 48 },
    lg: { w: 48, h: 64 },
    xl: { w: 64, h: 86 },
  };

  const { w, h } = sizeMap[size];

  const colorMap = {
    gold: {
      primary: '#D4AF37',
      secondary: '#B8860B',
      accent: '#854D0E',
      text: '#78350F',
    },
    monochrome: {
      primary: '#1E293B',
      secondary: '#334155',
      accent: '#0F172A',
      text: '#0F172A',
    },
    navy: {
      primary: '#0B2545',
      secondary: '#133E70',
      accent: '#00122E',
      text: '#0B2545',
    },
    white: {
      primary: '#F8FAFC',
      secondary: '#E2E8F0',
      accent: '#CBD5E1',
      text: '#FFFFFF',
    },
  };

  const c = colorMap[variant];

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="State Emblem of India"
    >
      {/* Three Lions Silhouette - Center, Left, Right */}
      {/* Central Lion Head & Mane */}
      <path
        d="M50 10 C42 10 38 16 38 24 C38 28 40 32 40 36 C36 34 33 37 33 42 C33 48 37 52 40 54 C40 57 42 62 45 66 C45 68 47 70 50 70 C53 70 55 68 55 66 C58 62 60 57 60 54 C63 52 67 48 67 42 C67 37 64 34 60 36 C60 32 62 28 62 24 C62 16 58 10 50 10 Z"
        fill={c.primary}
        stroke={c.secondary}
        strokeWidth="1.5"
      />
      {/* Central Lion Facial Features */}
      <path d="M47 26 C47 24 49 23 50 23 C51 23 53 24 53 26" stroke={c.accent} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M46 32 L50 36 L54 32" stroke={c.accent} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      <circle cx="45" cy="27" r="1.5" fill={c.accent} />
      <circle cx="55" cy="27" r="1.5" fill={c.accent} />
      <path d="M44 42 C47 45 53 45 56 42" stroke={c.accent} strokeWidth="1.2" strokeLinecap="round" />

      {/* Left Lion Head */}
      <path
        d="M36 20 C30 20 25 25 24 32 C23 38 26 44 28 48 C24 48 20 52 20 57 C20 63 25 66 30 66 C33 66 36 63 38 60 C37 55 36 48 36 42 Z"
        fill={c.secondary}
        stroke={c.accent}
        strokeWidth="1.2"
      />
      <circle cx="28" cy="34" r="1.2" fill={c.accent} />
      <path d="M25 40 C28 42 32 40 33 38" stroke={c.accent} strokeWidth="1" strokeLinecap="round" />

      {/* Right Lion Head */}
      <path
        d="M64 20 C70 20 75 25 76 32 C77 38 74 44 72 48 C76 48 80 52 80 57 C80 63 75 66 70 66 C67 66 64 63 62 60 C63 55 64 48 64 42 Z"
        fill={c.secondary}
        stroke={c.accent}
        strokeWidth="1.2"
      />
      <circle cx="72" cy="34" r="1.2" fill={c.accent} />
      <path d="M75 40 C72 42 68 40 67 38" stroke={c.accent} strokeWidth="1" strokeLinecap="round" />

      {/* Lion Manes & Chest Details */}
      <path d="M43 48 C41 54 41 62 44 67" stroke={c.accent} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M57 48 C59 54 59 62 56 67" stroke={c.accent} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M50 48 L50 67" stroke={c.accent} strokeWidth="1" strokeLinecap="round" />

      {/* Capital Abacus (Pedestal) */}
      <rect x="14" y="70" width="72" height="6" rx="1.5" fill={c.primary} stroke={c.secondary} strokeWidth="1.2" />
      <rect x="18" y="76" width="64" height="20" fill={c.secondary} stroke={c.accent} strokeWidth="1.2" />

      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="86" r="8" fill={c.primary} stroke={c.accent} strokeWidth="1.2" />
      <circle cx="50" cy="86" r="1.8" fill={c.accent} />
      {/* 24 Spokes (Represented as radial lines) */}
      <line x1="50" y1="78.5" x2="50" y2="93.5" stroke={c.accent} strokeWidth="0.8" />
      <line x1="42.5" y1="86" x2="57.5" y2="86" stroke={c.accent} strokeWidth="0.8" />
      <line x1="44.7" y1="80.7" x2="55.3" y2="91.3" stroke={c.accent} strokeWidth="0.8" />
      <line x1="55.3" y1="80.7" x2="44.7" y2="91.3" stroke={c.accent} strokeWidth="0.8" />
      <line x1="42.9" y1="83.2" x2="57.1" y2="88.8" stroke={c.accent} strokeWidth="0.8" />
      <line x1="57.1" y1="83.2" x2="42.9" y2="88.8" stroke={c.accent} strokeWidth="0.8" />
      <line x1="47.2" y1="78.9" x2="52.8" y2="93.1" stroke={c.accent} strokeWidth="0.8" />
      <line x1="52.8" y1="78.9" x2="47.2" y2="93.1" stroke={c.accent} strokeWidth="0.8" />

      {/* Galloping Horse on Left */}
      <path
        d="M26 82 C28 80 32 80 34 83 C36 85 36 89 33 90 C30 91 26 91 25 87 C24 84 25 83 26 82 Z"
        fill={c.primary}
      />
      {/* Bull on Right */}
      <path
        d="M66 83 C68 81 72 81 74 83 C76 86 75 90 73 91 C70 91 66 90 65 87 C65 84 66 83 66 83 Z"
        fill={c.primary}
      />

      {/* Inverted Lotus Base */}
      <path
        d="M12 96 C20 102 32 105 50 105 C68 105 80 102 88 96 L86 102 C78 108 66 111 50 111 C34 111 22 108 14 102 Z"
        fill={c.primary}
        stroke={c.secondary}
        strokeWidth="1.2"
      />
      <rect x="20" y="111" width="60" height="4" rx="1" fill={c.secondary} />

      {/* Motto "सत्यमेव जयते" (Satyameva Jayate) */}
      <text
        x="50"
        y="128"
        textAnchor="middle"
        fill={c.text}
        fontSize="9"
        fontFamily="'Noto Serif Devanagari', 'Tiro Devanagari Hindi', Georgia, serif"
        fontWeight="bold"
        letterSpacing="0.05em"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};
