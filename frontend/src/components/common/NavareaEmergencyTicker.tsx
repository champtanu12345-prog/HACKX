import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  ShieldAlert,
  Waves,
  Compass,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  LifeBuoy,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audioAlerts';

export interface NavareaEmergencyTickerProps {
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  onOpenContainmentSimulator?: () => void;
  onOpenCitizenReport?: () => void;
  lang?: 'en' | 'hi';
}

interface BulletinItem {
  id: string;
  category: 'NAVAREA VIII' | 'MET-OCEAN' | 'SAR/ICG' | 'POLLUTION';
  priority: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  textEn: string;
  textHi: string;
  timestamp: string;
  coordinates?: string;
}

export const NavareaEmergencyTicker: React.FC<NavareaEmergencyTickerProps> = ({
  isNightMode = false,
  onToggleNightMode,
  onOpenContainmentSimulator,
  onOpenCitizenReport,
  lang = 'en',
}) => {
  const bulletins: BulletinItem[] = [
    {
      id: 'NAV-01',
      category: 'NAVAREA VIII',
      priority: 'CRITICAL',
      textEn:
        'NAVAREA VIII 0419/2026: UNIDENTIFIED HEAVY FUEL OIL SLICK DETECTED 24 NM OFF BOMBAY HIGH. ICG DORNIER 761 DISPATCHED FOR AERIAL ATOMIZATION.',
      textHi:
        'नावएरिया VIII 0419/2026: बॉम्बे हाई से 24 समुद्री मील दूर भारी तेल रिसाव देखा गया। आईसीजी डोर्नियर 761 को हवाई परीक्षण के लिए भेजा गया।',
      timestamp: '10 MIN AGO',
      coordinates: '19.124° N, 71.852° E',
    },
    {
      id: 'NAV-02',
      category: 'SAR/ICG',
      priority: 'WARNING',
      textEn:
        'ICG MRCC MUMBAI: TIER-1 POLLUTION RESPONSE TEAMS (PRT) ON STANDBY AT JNPT HARBOUR. 1,500M EXCLUSION BOOMS PRE-STAGED.',
      textHi:
        'आईसीजी एमआरसीसी मुंबई: जेएनपीटी बंदरगाह पर टियर-1 प्रदूषण प्रतिक्रिया दल (पीआरटी) सतर्क। 1,500 मीटर बूम तैयार।',
      timestamp: '25 MIN AGO',
      coordinates: '18.950° N, 72.950° E',
    },
    {
      id: 'NAV-03',
      category: 'MET-OCEAN',
      priority: 'WARNING',
      textEn:
        'INCOIS MET-OCEAN WARNING: SURFACE DRIFT CURRENT 1.4 KTS HEADING 068° ENE TOWARDS ALIBAG COASTLINE. SWELL HEIGHT 2.1M.',
      textHi:
        'इन्कॉइस चेतावनी: समुद्री सतही बहाव 1.4 समुद्री मील 068° ईएनई दिशा में अलीबाग तट की ओर। लहरें 2.1 मीटर।',
      timestamp: '42 MIN AGO',
      coordinates: 'ARABIAN SEA SECTOR MH-4',
    },
    {
      id: 'NAV-04',
      category: 'POLLUTION',
      priority: 'CRITICAL',
      textEn:
        'AIS TRANSIT AUDIT: SUSPECT TANKER MMSI 419001234 SHOWS 6.4-HOUR AIS TRANSPONDER GAP COINCIDING WITH MIDNIGHT DISCHARGE ZONE.',
      textHi:
        'एआईएस ऑडिट: संदिग्ध टैंकर एमएमएसआई 419001234 का 6.4 घंटे का ट्रांसपोंडर अंतराल आधी रात के रिसाव क्षेत्र से मेल खाता है।',
      timestamp: '1 HOUR AGO',
      coordinates: '19.040° N, 72.100° E',
    },
    {
      id: 'NAV-05',
      category: 'SAR/ICG',
      priority: 'ADVISORY',
      textEn:
        'FISHERMEN ADVISORY: ISRO DAT-SG SECOND-GENERATION DISTRESS UNITS SYNCHRONIZED VIA NavIC SATELLITE NETWORK. CONTINUOUS CH-16 MONITORING.',
      textHi:
        'मछुआरों की सलाह: इसरो डीएटी-एसजी सैटेलाइट आपातकालीन संदेश प्रणाली नाविक नेटवर्क से जुड़ी। वीएचएफ चैनल 16 की निरंतर निगरानी।',
      timestamp: '2 HOURS AGO',
      coordinates: 'COASTAL MAHARASHTRA & GUJARAT',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-cycle through bulletins every 6.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bulletins.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, bulletins.length]);

  const currentBulletin = bulletins[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bulletins.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bulletins.length) % bulletins.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`w-full border-b select-none transition-colors duration-300 z-20 flex flex-wrap items-center justify-between px-3 sm:px-6 py-1.5 text-xs font-sans ${
        isNightMode
          ? 'bg-[#040A14] border-cyan-500/30 text-slate-100 shadow-[0_2px_15px_rgba(6,182,212,0.15)]'
          : 'bg-[#FFFBEB] border-amber-300/80 text-amber-950 shadow-xs'
      }`}
    >
      {/* Left: Priority Badge & Ticker Crawl */}
      <div className="flex items-center space-x-2.5 flex-1 min-w-[280px] overflow-hidden mr-2">
        {/* Flashing Beacon */}
        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded font-mono font-black text-[10px] tracking-wider uppercase flex-shrink-0 ${
            currentBulletin.priority === 'CRITICAL'
              ? 'bg-rose-600 text-white animate-pulse shadow-xs'
              : currentBulletin.priority === 'WARNING'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-sky-600 text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>{currentBulletin.category}</span>
        </div>

        {/* Scrolling Bulletin Headline */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-2 text-[11px] truncate">
            <span className="font-mono font-bold text-amber-600 dark:text-cyan-300 flex-shrink-0">
              [{currentBulletin.id}]
            </span>
            <span
              className={`font-semibold tracking-wide truncate ${
                isNightMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              {lang === 'hi' ? currentBulletin.textHi : currentBulletin.textEn}
            </span>
            {currentBulletin.coordinates && (
              <span className="hidden xl:inline-block font-mono text-[10px] text-slate-400 bg-black/20 px-1.5 py-0.2 rounded flex-shrink-0">
                📍 {currentBulletin.coordinates}
              </span>
            )}
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="hidden sm:flex items-center space-x-1 flex-shrink-0 text-slate-400 font-mono text-[10px]">
          <button
            onClick={handlePrev}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Previous Bulletin"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>
            {currentIndex + 1}/{bulletins.length}
          </span>
          <button
            onClick={handleNext}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Next Bulletin"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Quick Action Controls (Simulator, Citizen Report, Night Mode) */}
      <div className="flex items-center space-x-2 flex-shrink-0 mt-1 sm:mt-0">
        {/* 1. Interactive Oil Spill Containment Simulator Button */}
        {onOpenContainmentSimulator && (
          <button
            onClick={onOpenContainmentSimulator}
            className="px-2.5 py-1 rounded bg-[#006837] hover:bg-[#00522c] text-white text-[11px] font-bold shadow-xs hover:shadow transition-all flex items-center space-x-1 cursor-pointer"
            title="Launch Interactive Oil Spill Containment Simulator (Booms & Skimmers)"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="hidden md:inline">Containment Simulator</span>
            <span className="md:hidden">Simulator</span>
          </button>
        )}

        {/* 2. Citizen Coastal Incident Reporting Portal Button */}
        {onOpenCitizenReport && (
          <button
            onClick={onOpenCitizenReport}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-400/50 text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
            title="Citizen & Fishermen Coastal Pollution Reporting Tool (Photo & GPS)"
          >
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Report Spill</span>
          </button>
        )}

        {/* 3. Military CIC Combat Mode (Night / Day Toggle) */}
        {onToggleNightMode && (
          <button
            onClick={onToggleNightMode}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              isNightMode
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
            }`}
            title={
              isNightMode
                ? 'Combat Information Center (CIC) Mode Active — Click to switch to Daylight GIGW Mode'
                : 'Daylight Mode Active — Click to switch to Military CIC Night Stealth Mode'
            }
          >
            {isNightMode ? (
              <>
                <Moon className="w-3 h-3 text-cyan-300 animate-pulse" />
                <span className="hidden sm:inline">CIC NIGHT</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">DAY OPS</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
