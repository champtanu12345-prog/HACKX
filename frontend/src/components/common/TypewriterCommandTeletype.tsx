import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Radio,
  Satellite,
  Compass,
  ShieldAlert,
  Wind,
  Pause,
  Play,
  SkipForward,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audioAlerts';

interface TeleprinterMessage {
  id: number;
  category: string;
  hindiCategory: string;
  text: string;
  classification: string;
  icon: React.ReactNode;
  badgeBg: string;
}

const TELEPRINTER_MESSAGES: TeleprinterMessage[] = [
  {
    id: 1,
    category: 'SAR RADAR PASS',
    hindiCategory: 'उपग्रह सार रडार',
    text: 'Sentinel-1A C-SAR IW Swath over Western EEZ: 14.85 km² hydrocarbon slick verified at 19°6\'43"N, 72°23\'42"E (Sector MH-4).',
    classification: 'CONFIDENTIAL',
    icon: <Satellite className="w-3.5 h-3.5 text-emerald-300" />,
    badgeBg: 'bg-emerald-900/80 border-emerald-500 text-emerald-200',
  },
  {
    id: 2,
    category: 'AIS BLACKOUT ANOMALY',
    hindiCategory: 'एआईएस ब्लैकआउट विसंगति',
    text: 'ALERT // MT ARABIAN STAR (MMSI: 419000123): 92-minute transponder blackout detected directly over estimated spill locus. SOG dropped to 3.8 kn.',
    classification: 'CRITICAL',
    icon: <Radio className="w-3.5 h-3.5 text-[#FFD700]" />,
    badgeBg: 'bg-amber-950/80 border-amber-500 text-[#FFD700]',
  },
  {
    id: 3,
    category: 'LAGRANGIAN HINDCAST',
    hindiCategory: 'लैग्रेंजियन बहाव विश्लेषण',
    text: 'INCOIS Hydrodynamics v2.4 + NOAA GFS Windage: Reverse 18-hour advection trajectory matches MT ARABIAN STAR transit corridor with 98.2% correlation.',
    classification: 'VERIFIED',
    icon: <Compass className="w-3.5 h-3.5 text-emerald-300" />,
    badgeBg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
  },
  {
    id: 4,
    category: 'STATUTORY PROSECUTION',
    hindiCategory: 'वैधानिक न्यायालय साक्ष्य',
    text: 'Section 356C Merchant Shipping Act 1958 & MARPOL 73/78: Tamper-evident forensic dossier compiled with SHA-256 digest: 7f83b165... Issued to Maritime Magistrate.',
    classification: 'LEGAL WARRANT',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
    badgeBg: 'bg-red-950/80 border-red-500 text-red-300',
  },
  {
    id: 5,
    category: 'DGICG COMMAND DIRECTIVE',
    hindiCategory: 'महानिदेशक तटरक्षक निर्देश',
    text: '"Maintain unyielding 24x7 maritime surveillance across Bharat\'s maritime zones. Execute zero-tolerance enforcement against marine pollution violators."',
    classification: 'DIRECTIVE',
    icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
    badgeBg: 'bg-emerald-900/80 border-emerald-400 text-emerald-100',
  },
];

interface TypewriterCommandTeletypeProps {
  className?: string;
  onMessageClick?: (msg: TeleprinterMessage) => void;
}

export const TypewriterCommandTeletype: React.FC<TypewriterCommandTeletypeProps> = ({
  className = '',
  onMessageClick,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const currentMessage = TELEPRINTER_MESSAGES[currentMessageIndex];
  const charIndexRef = useRef<number>(0);
  const textToType = currentMessage.text;

  // Typewriter Loop
  useEffect(() => {
    if (isPaused) return;

    charIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typeSpeedMs = 28; // Rapid military teletype typing speed
    const pauseAtEndMs = 3200; // Time to read before next alert

    const typingInterval = setInterval(() => {
      if (charIndexRef.current < textToType.length) {
        charIndexRef.current += 1;
        setDisplayedText(textToType.slice(0, charIndexRef.current));

        // Occasional gentle audio click if enabled
        if (soundEnabled && charIndexRef.current % 4 === 0) {
          try {
            tacticalAudio.playSonarPing();
          } catch {}
        }
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Pause then advance to next message
        const nextTimer = setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % TELEPRINTER_MESSAGES.length);
        }, pauseAtEndMs);

        return () => clearTimeout(nextTimer);
      }
    }, typeSpeedMs);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, isPaused, soundEnabled, textToType]);

  const handleNext = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % TELEPRINTER_MESSAGES.length);
  };

  const handlePrev = () => {
    setCurrentMessageIndex((prev) =>
      prev === 0 ? TELEPRINTER_MESSAGES.length - 1 : prev - 1
    );
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#032B13] via-[#064E26] to-[#032B13] text-white border-b-2 border-[#10B981]/50 flex items-center overflow-hidden h-8 select-none text-[11px] shadow-sm relative z-20 ${className}`}
      role="region"
      aria-label="Live Maritime Command Teleprinter"
    >
      {/* 1. Left Teleprinter Badge with Animated Blinking Pulse */}
      <div className="flex-shrink-0 bg-[#02210F] text-[#FFD700] px-3 h-full flex items-center space-x-1.5 border-r border-[#10B981]/40 font-mono font-bold text-[10px] uppercase tracking-wider z-10 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        <Terminal className="w-3.5 h-3.5 text-[#FFD700]" />
        <span className="font-serif hidden sm:inline">तटरक्षक टेलीप्रिंटर</span>
        <span className="text-emerald-400 hidden sm:inline">|</span>
        <span className="text-white">COMMAND TELETYPE</span>
      </div>

      {/* 2. Message Category Tag Pill */}
      <div className="flex-shrink-0 px-2 py-0.5 ml-2 hidden md:flex items-center space-x-1.5 rounded-[2px] border text-[9.5px] font-mono font-bold uppercase tracking-wider shadow-2xs">
        <span className={`px-1.5 py-0.5 rounded-[2px] border ${currentMessage.badgeBg} flex items-center space-x-1`}>
          {currentMessage.icon}
          <span>{currentMessage.category}</span>
        </span>
      </div>

      {/* 3. Real-Time Typing Text Canvas */}
      <div
        onClick={() => onMessageClick && onMessageClick(currentMessage)}
        className="flex-1 overflow-hidden px-3 flex items-center font-mono text-[11.5px] text-emerald-100 truncate cursor-pointer hover:text-white transition-colors"
        title="Click to inspect this operational alert"
      >
        <span className="text-[#FFD700] font-bold mr-1.5 flex-shrink-0">››</span>
        <span className="truncate">{displayedText}</span>

        {/* Blinking Teletype Cursor */}
        <span
          className={`inline-block w-2 h-3.5 ml-0.5 bg-[#FFD700] shadow-[0_0_6px_#FFD700] ${
            isTyping ? 'opacity-100' : 'animate-cursor-blink'
          }`}
        />
      </div>

      {/* 4. Controls: Prev / Next / Pause / Audio Toggle */}
      <div className="flex-shrink-0 flex items-center space-x-1.5 pr-2.5 pl-2 bg-[#02210F]/90 h-full border-l border-[#10B981]/30 font-mono text-[10px]">
        {/* Classification Tag */}
        <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-[2px] bg-red-950/80 text-red-300 border border-red-700/60 font-bold text-[9px] mr-1">
          {currentMessage.classification}
        </span>

        {/* Prev Alert */}
        <button
          onClick={handlePrev}
          className="p-1 rounded hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-colors cursor-pointer"
          title="Previous Command Teleprinter Alert"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Pause / Play */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 rounded hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-colors cursor-pointer"
          title={isPaused ? 'Resume Teleprinter' : 'Pause Teleprinter'}
        >
          {isPaused ? <Play className="w-3 h-3 text-[#FFD700]" /> : <Pause className="w-3 h-3" />}
        </button>

        {/* Next Alert */}
        <button
          onClick={handleNext}
          className="p-1 rounded hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-colors cursor-pointer"
          title="Next Command Teleprinter Alert"
        >
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Index Indicator */}
        <span className="text-emerald-400 font-bold pl-1 hidden sm:inline">
          {currentMessageIndex + 1}/{TELEPRINTER_MESSAGES.length}
        </span>
      </div>
    </div>
  );
};
