import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  FileText,
  Ship,
  UserCheck,
  Globe,
  Anchor,
  PlayCircle,
  ExternalLink,
  ArrowUp,
  Shield,
  Radio,
  Waves,
  Sparkles,
  AlertTriangle,
  X,
  ArrowRight,
  Compass,
  Satellite,
  Cpu,
  Scale,
  CheckCircle2,
  Eye,
  MapPin,
  Wind,
  Clock,
  Flame,
  Activity,
  Award,
  LogIn,
  Film,
} from 'lucide-react';
import { StateEmblemIndia } from '../components/common/StateEmblemIndia';
import { IndianCoastGuardInsignia } from '../components/common/IndianCoastGuardInsignia';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { TRANSLATIONS, Language } from '../i18n/translations';
import { AuthUser } from '../api/auth';

export interface PublicPortalViewProps {
  onLaunchWorkstation: () => void;
  onOpenGuidedTour?: () => void;
  onOpenDossier?: () => void;
  onSelectScenario?: (id: string) => void;
  onOpenLogin?: () => void;
  currentUser?: AuthUser | null;
  lang?: Language;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  onLaunchWorkstation,
  onOpenGuidedTour,
  onOpenDossier,
  onSelectScenario,
  onOpenLogin,
  currentUser = null,
  lang = 'en',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [isTickerPlaying, setIsTickerPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'whatsNew' | 'pressRelease' | 'tenders'>('whatsNew');
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; desc: string } | null>(null);
  const [showDgModal, setShowDgModal] = useState<boolean>(false);
  const [selectedScenarioTab, setSelectedScenarioTab] = useState<'scenario_a' | 'scenario_b' | 'scenario_c'>('scenario_a');

  // Character-by-character typewriter loop state
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const charIndexRef = useRef<number>(0);

  useEffect(() => {
    if (!isTickerPlaying) return;
    charIndexRef.current = 0;
    setTypedText('');
    setIsTyping(true);

    const alerts = t.tickerAlerts;
    const currentAlert = alerts[tickerIndex]?.text || alerts[0].text;

    const interval = setInterval(() => {
      if (charIndexRef.current < currentAlert.length) {
        charIndexRef.current++;
        setTypedText(currentAlert.slice(0, charIndexRef.current));
      } else {
        clearInterval(interval);
        setIsTyping(false);
        const timer = setTimeout(() => {
          setTickerIndex((prev) => (prev + 1) % alerts.length);
        }, 3200);
        return () => clearTimeout(timer);
      }
    }, 26);

    return () => clearInterval(interval);
  }, [tickerIndex, isTickerPlaying, lang]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchScenario = (scId: string) => {
    if (onSelectScenario) {
      onSelectScenario(scId);
    } else {
      onLaunchWorkstation();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-800 font-sans overflow-y-auto select-none">
      {/* 1. TOP TICKER BAR: Real-Time Character-by-Character Typewriter & Live Telemetry Feed */}
      <div className="bg-[#071B33] text-white px-4 py-2 flex flex-wrap items-center justify-between border-b border-[#EA580C]/40 shadow-md z-30 sticky top-0 backdrop-blur-md">
        <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-[280px]">
          {/* Latest Update Pill with Animated Ping Indicator (Saffron) */}
          <div className="bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#C2410C] px-3 py-1 rounded-[2px] font-bold text-xs uppercase tracking-wider flex-shrink-0 text-white border border-orange-300/40 shadow-xs flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-mono text-[11px] font-extrabold">{t.liveIntelligence}</span>
          </div>

          {/* Typewriter text canvas */}
          <div
            onClick={onLaunchWorkstation}
            className="flex items-center space-x-2 text-xs text-orange-100 overflow-hidden flex-1 font-mono cursor-pointer hover:text-white transition-colors"
            title="Click to launch Tactical Workstation"
          >
            <span className="bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-bold text-[#FFD700] border border-[#D4AF37]/50 uppercase tracking-wider flex-shrink-0">
              {t.tickerAlerts[tickerIndex]?.category || 'SAR'}
            </span>
            <span className="text-[#FF9933] font-bold">››</span>
            <span className="truncate font-semibold tracking-wide text-white">{typedText}</span>
            {/* Blinking Teletype Cursor */}
            <span
              className={`inline-block w-2 h-3.5 bg-[#FF9933] shadow-[0_0_8px_#FF9933] flex-shrink-0 ${
                isTyping ? 'opacity-100' : 'animate-pulse'
              }`}
            />
          </div>
        </div>

        {/* Live Telemetry Chips & Ticker Controls */}
        <div className="flex items-center space-x-3 pl-3 flex-shrink-0 font-mono text-[10.5px]">
          <div className="hidden xl:flex items-center space-x-2 text-orange-200 border-l border-slate-700 pl-3">
            <span className="flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>{t.metoceanTicker}</span>
            </span>
            <span className="flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
              <Satellite className="w-3 h-3 text-[#FFD700]" />
              <span>{t.satPassTicker}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-orange-400 font-bold mr-1 hidden sm:inline">
              {tickerIndex + 1}/{t.tickerAlerts.length}
            </span>
            <button
              onClick={() => setIsTickerPlaying(!isTickerPlaying)}
              className="w-6 h-6 rounded-full bg-[#0B2545] hover:bg-[#133E70] border border-[#D4AF37]/40 flex items-center justify-center text-white transition-colors cursor-pointer"
              title={isTickerPlaying ? 'Pause Typewriter' : 'Resume Typewriter'}
            >
              {isTickerPlaying ? <Pause className="w-3 h-3 text-[#FFD700]" /> : <Play className="w-3 h-3 text-[#FFD700]" />}
            </button>
            <button
              onClick={() =>
                setTickerIndex((prev) => (prev === 0 ? t.tickerAlerts.length - 1 : prev - 1))
              }
              className="w-6 h-6 rounded-full bg-[#0B2545] hover:bg-[#133E70] border border-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Previous Alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTickerIndex((prev) => (prev + 1) % t.tickerAlerts.length)}
              className="w-6 h-6 rounded-full bg-[#0B2545] hover:bg-[#133E70] border border-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Next Alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. HIGH-IMPACT COMMAND HERO SECTION: Maritime Defense Sovereign Gateway & Live Incident Radar HUD */}
      <div className="relative bg-gradient-to-b from-[#071B33] via-[#0B2545] to-[#041021] text-white p-6 lg:p-10 overflow-hidden border-b-4 border-[#EA580C] shadow-2xl">
        {/* Dynamic Maritime Grid & Wave Pattern Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 animate-boot-grid" />
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 500" preserveAspectRatio="none">
            <path
              fill="#FF9933"
              d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,133.3C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,500L1392,500C1344,500,1248,500,1152,500C1056,500,960,500,864,500C768,500,672,500,576,500C480,500,384,500,288,500C192,500,96,500,48,500L0,500Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* A. LEFT COLUMN (7 Cols): Strategic Overview & Command Launch Hub */}
          <div className="lg:col-span-7 space-y-6">
            {/* National Strategic Emblems & Hackathon Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-black/40 border border-orange-500/40 px-3 py-1 rounded-full text-[11px] font-mono text-orange-200 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-white tracking-wider">{t.defenceIntelligence}</span>
                <span className="text-orange-400">|</span>
                <span className="text-[#FFD700] font-bold">SIH 260143</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 bg-[#C2410C]/60 border border-[#FFD700]/40 px-3 py-1 rounded-full text-[11px] font-serif text-[#FFFBEB]">
                <StateEmblemIndia className="w-3.5 h-4" />
                <span>{t.minOfDefence}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-200">
                <span>GIGW 3.0</span>
              </div>
            </div>

            {/* Main Headline & Motto */}
            <div className="space-y-2">
              <div className="font-serif text-xs md:text-sm font-bold tracking-widest text-[#FF9933] uppercase flex items-center space-x-2">
                <span>{lang === 'hi' ? 'भारतीय तटरक्षक बल // BHARATIYA TATRAKSHAK' : 'BHARATIYA TATRAKSHAK // INDIAN COAST GUARD'}</span>
                <span className="text-white">•</span>
                <span className="text-slate-200 italic font-sans font-normal">{t.mottoText}</span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                {t.heroHeadline}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl text-justify">
                {t.heroDescription}
              </p>
            </div>

            {/* High-Impact Command Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary CTA: Launch Tactical Workstation (Indian Saffron) */}
              <button
                onClick={onLaunchWorkstation}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#C2410C] hover:from-[#F97316] hover:to-[#EA580C] text-white font-sans font-black text-sm flex items-center space-x-2.5 shadow-xl hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-[#FDBA74]"
              >
                <Shield className="w-5 h-5 text-white" />
                <span>{t.launchWorkstationBtn}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {/* Secondary CTA: 5-Stage Evaluator Guided Tour (India Green) */}
              {onOpenGuidedTour && (
                <button
                  onClick={onOpenGuidedTour}
                  className="px-4 py-3 rounded-lg bg-[#138808] hover:bg-[#0D5204] text-white font-mono font-bold text-xs flex items-center space-x-2 border border-emerald-400/50 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>{t.evaluatorTourBtn}</span>
                </button>
              )}

              {/* Tertiary CTA: Legal Dossier Modal */}
              {onOpenDossier && (
                <button
                  onClick={onOpenDossier}
                  className="px-4 py-3 rounded-lg bg-black/40 hover:bg-black/60 text-slate-200 hover:text-white font-mono font-bold text-xs flex items-center space-x-2 border border-slate-600 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-emerald-300" />
                  <span>{t.viewDossierBtn}</span>
                </button>
              )}

              {/* Quaternary CTA: User Sign In / Profile Status */}
              {onOpenLogin && !currentUser && (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-[#FFD700] hover:text-white font-mono font-bold text-xs flex items-center space-x-2 border border-[#FFD700]/60 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#FFD700]" />
                  <span>{lang === 'hi' ? '🔑 उपयोगकर्ता प्रवेश / LOGIN' : '🔑 USER LOGIN'}</span>
                </button>
              )}

              {currentUser && (
                <div className="flex items-center space-x-2 bg-[#01140B] border border-emerald-500/70 px-3 py-2 rounded-lg text-xs font-mono shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-slate-400">{lang === 'hi' ? 'सक्रिय:' : 'Operator:'}</span>
                  <span className="text-[#FFD700] font-bold">{currentUser.name}</span>
                  <span className="text-emerald-300">({currentUser.role})</span>
                </div>
              )}
            </div>

            {/* Real-Time Operational Readiness Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/60 font-mono text-[10.5px]">
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>{t.statusMrcc}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <Satellite className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>{t.statusSar}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.statusHycom}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.statusLegal}</span>
              </div>
            </div>
          </div>

          {/* B. RIGHT COLUMN (5 Cols): Interactive Live Incident Radar HUD Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={onLaunchWorkstation}
              className="w-full max-w-md radar-hud-glass rounded-2xl p-4 border border-emerald-400/40 relative overflow-hidden shadow-2xl cursor-pointer group hover:border-[#FFD700]/70 transition-all"
              title="Click to enter active tactical incident in Mumbai High"
            >
              {/* Top HUD Header Banner */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/30 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-[#FFD700] tracking-wider">{t.liveRadarTitle}</span>
                </div>
                <div className="text-emerald-300 text-[10px]">
                  {t.sectorLabel}
                </div>
              </div>

              {/* Central Radar Scope Visualizer */}
              <div className="relative w-full aspect-square bg-[#02180D] rounded-xl border border-emerald-500/40 overflow-hidden flex items-center justify-center">
                {/* Tactical Radar Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20 border border-emerald-500/20">
                  <div className="border-r border-b border-emerald-500/30" />
                  <div className="border-r border-b border-emerald-500/30" />
                  <div className="border-r border-b border-emerald-500/30" />
                  <div className="border-b border-emerald-500/30" />
                </div>

                {/* Concentric Range Rings (5, 10, 15, 20 NM) */}
                <div className="absolute w-[88%] h-[88%] rounded-full border border-emerald-500/25 pointer-events-none" />
                <div className="absolute w-[66%] h-[66%] rounded-full border border-emerald-500/30 pointer-events-none" />
                <div className="absolute w-[44%] h-[44%] rounded-full border border-emerald-500/35 pointer-events-none" />
                <div className="absolute w-[22%] h-[22%] rounded-full border border-emerald-500/40 pointer-events-none" />

                {/* Cardinal Azimuth Crosshairs */}
                <div className="absolute w-full h-[1px] bg-emerald-500/30 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-emerald-500/30 pointer-events-none" />

                {/* Azimuth Markers */}
                <span className="absolute top-1 font-mono text-[9px] text-emerald-400 font-bold">{t.radarHeadingN}</span>
                <span className="absolute bottom-1 font-mono text-[9px] text-emerald-400 font-bold">{t.radarHeadingS}</span>
                <span className="absolute right-1 font-mono text-[9px] text-emerald-400 font-bold">{t.radarHeadingE}</span>
                <span className="absolute left-1 font-mono text-[9px] text-emerald-400 font-bold">{t.radarHeadingW}</span>

                {/* 360° Rotating Radar Sweep Beam */}
                <div className="absolute inset-0 pointer-events-none animate-radar-sweep">
                  <div
                    className="w-1/2 h-1/2 origin-bottom-right"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.4) 0deg, rgba(16, 185, 129, 0) 55deg)',
                    }}
                  />
                </div>

                {/* Sonar Ping Wave Expansion */}
                <div className="absolute w-12 h-12 rounded-full border-2 border-emerald-400/80 animate-sonar-wave pointer-events-none" />

                {/* SVG Active Oil Slick Polygon (14.85 km² Spill in Mumbai High) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  viewBox="0 0 300 300"
                >
                  {/* Lagrangian Reverse Drift Hindcast Trajectory (Dotted Path) */}
                  <path
                    d="M 120 185 L 140 165 L 165 140 L 195 115 L 210 95"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="1.8"
                    strokeDasharray="4,3"
                    className="opacity-80"
                  />

                  {/* Oil Spill Plume Polygon */}
                  <polygon
                    points="140,165 170,150 190,168 185,185 155,195 132,180"
                    fill="rgba(220, 38, 38, 0.45)"
                    stroke="#EF4444"
                    strokeWidth="2"
                    className="animate-spill-glow"
                  />

                  {/* Estimated Discharge Locus Crosshair */}
                  <circle cx="210" cy="95" r="4" fill="#FFD700" />
                  <circle cx="210" cy="95" r="9" fill="none" stroke="#FFD700" strokeWidth="1" className="animate-ping" />
                  <text x="220" y="98" fill="#FFD700" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {t.dischargeLocusLabel}
                  </text>
                </svg>

                {/* Suspect Vessel Marker (MT ARABIAN STAR) */}
                <div
                  className="absolute z-20 flex flex-col items-center pointer-events-none"
                  style={{ top: '24%', left: '64%' }}
                >
                  <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <Ship className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="bg-red-950/90 border border-red-500/80 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                    {t.suspectVesselLabel}
                  </div>
                </div>

                {/* Spill Centroid Label */}
                <div
                  className="absolute z-20 flex flex-col items-center pointer-events-none"
                  style={{ top: '56%', left: '46%' }}
                >
                  <div className="bg-black/80 border border-amber-400 text-amber-300 font-mono text-[8px] font-bold px-1 py-0.5 rounded">
                    {t.slickSizeLabel}
                  </div>
                </div>

                {/* Click to Launch Tactical Workstation Hover Overlay */}
                <div className="absolute inset-0 bg-[#021B0F]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center z-30 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-[#FFD700] text-[#042813] flex items-center justify-center mb-2 shadow-xl animate-bounce">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <div className="font-serif font-black text-sm text-[#FFD700] uppercase">
                    {t.radarHoverOverlayTitle}
                  </div>
                  <div className="text-[10.5px] text-emerald-200 font-mono mt-1">
                    {t.radarHoverOverlayDesc}
                  </div>
                </div>
              </div>

              {/* Bottom Radar HUD Telemetry Chips */}
              <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[10px]">
                <div className="bg-emerald-950/70 border border-emerald-500/30 rounded p-1.5">
                  <span className="text-slate-400 block text-[9px]">{lang === 'hi' ? 'संदिग्ध पोत' : 'SUSPECT VESSEL'}</span>
                  <span className="font-bold text-red-400">MT ARABIAN STAR</span>
                </div>
                <div className="bg-emerald-950/70 border border-emerald-500/30 rounded p-1.5">
                  <span className="text-slate-400 block text-[9px]">{lang === 'hi' ? 'दायित्व निर्धारण' : 'ATTRIBUTION SCORE'}</span>
                  <span className="font-bold text-[#FFD700]">{t.radarAttributionScoreLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANIMATED KEY DEFENCE METRICS BAND */}
      <div className="bg-[#0B2545] border-b-2 border-[#EA580C] px-4 py-6 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 - Saffron Accent */}
          <div className="bg-gradient-to-br from-[#EA580C]/20 to-[#07192C] border border-[#EA580C]/50 rounded-xl p-4 flex items-center space-x-3.5 shadow-md hover:border-[#EA580C] transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 flex items-center justify-center flex-shrink-0 text-[#FF9933]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-white flex items-baseline space-x-1">
                <AnimatedCounter value={7516} duration={1400} />
                <span className="text-xs text-[#FF9933] font-bold">{t.metric1Unit}</span>
              </div>
              <div className="text-xs font-serif font-bold text-slate-100">{t.metric1Title}</div>
              <div className="text-[10px] text-orange-200/80 font-mono">{t.metric1Subtitle}</div>
            </div>
          </div>

          {/* Metric 2 - Gold / White Accent */}
          <div className="bg-gradient-to-br from-amber-500/15 to-[#07192C] border border-amber-400/40 rounded-xl p-4 flex items-center space-x-3.5 shadow-md hover:border-amber-300 transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-[#FFD700]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#FFD700] flex items-baseline space-x-1">
                <span>&lt;</span>
                <AnimatedCounter value={15} duration={1200} />
                <span className="text-xs text-amber-300 font-bold">{t.metric2Unit}</span>
              </div>
              <div className="text-xs font-serif font-bold text-slate-100">{t.metric2Title}</div>
              <div className="text-[10px] text-amber-200/80 font-mono">{t.metric2Subtitle}</div>
            </div>
          </div>

          {/* Metric 3 - Pure White / Cyan Accent */}
          <div className="bg-gradient-to-br from-cyan-500/15 to-[#07192C] border border-cyan-400/40 rounded-xl p-4 flex items-center space-x-3.5 shadow-md hover:border-cyan-300 transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 text-cyan-300">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-cyan-300 flex items-baseline space-x-1">
                <AnimatedCounter value={98.2} decimals={1} duration={1600} />
                <span className="text-xs text-cyan-400 font-bold">{t.metric3Unit}</span>
              </div>
              <div className="text-xs font-serif font-bold text-slate-100">{t.metric3Title}</div>
              <div className="text-[10px] text-cyan-200/80 font-mono">{t.metric3Subtitle}</div>
            </div>
          </div>

          {/* Metric 4 - Sovereign Green Accent */}
          <div className="bg-gradient-to-br from-[#138808]/25 to-[#07192C] border border-[#138808]/50 rounded-xl p-4 flex items-center space-x-3.5 shadow-md hover:border-[#138808] transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-[#138808]/20 border border-[#138808]/40 flex items-center justify-center flex-shrink-0 text-[#10B981]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-emerald-200 flex items-baseline space-x-1">
                <AnimatedCounter value={100} duration={1000} />
                <span className="text-xs text-emerald-400 font-bold">{t.metric4Unit}</span>
              </div>
              <div className="text-xs font-serif font-bold text-slate-100">{t.metric4Title}</div>
              <div className="text-[10px] text-emerald-200/80 font-mono">{t.metric4Subtitle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOUR TECHNOLOGICAL SUBSYSTEMS (Architecture Intelligence Showcase) */}
      <div className="bg-gradient-to-b from-white via-orange-50/20 to-emerald-50/30 p-6 lg:p-10 border-b-4 border-[#138808] text-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-[#C2410C] text-white px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-[#FED7AA]" />
              <span>{t.subsystemsHeader}</span>
            </div>
            <h2 className="font-serif font-black text-2xl lg:text-3xl text-[#0B2545]">
              {t.subsystemsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.subsystemsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {/* Subsystem 1: Spaceborne SAR/EO (Orange / Saffron) */}
            <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-orange-200 hover:border-[#EA580C] transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-300 flex items-center justify-center text-[#C2410C] group-hover:scale-110 transition-transform">
                  <Satellite className="w-6 h-6 text-[#C2410C]" />
                </div>
                <div className="font-mono text-[10px] font-bold text-[#C2410C] uppercase tracking-wide">
                  {t.sub1Stage}
                </div>
                <h3 className="font-serif font-bold text-base text-[#0B2545] leading-snug">
                  {t.sub1Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {t.sub1Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-[#C2410C] font-bold">{t.sub1Tag1}</span>
                <span className="bg-orange-100 text-[#9A3412] px-2 py-0.5 rounded font-bold">{t.sub1Tag2}</span>
              </div>
            </div>

            {/* Subsystem 2: Lagrangian Drift Hindcasting (Oceanic Cyan / Blue) */}
            <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-cyan-200 hover:border-cyan-500 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-800 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6 text-cyan-700" />
                </div>
                <div className="font-mono text-[10px] font-bold text-cyan-700 uppercase tracking-wide">
                  {t.sub2Stage}
                </div>
                <h3 className="font-serif font-bold text-base text-[#0B2545] leading-snug">
                  {t.sub2Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {t.sub2Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-cyan-800 font-bold">{t.sub2Tag1}</span>
                <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">{t.sub2Tag2}</span>
              </div>
            </div>

            {/* Subsystem 3: AIS Telemetry & Dark Vessel Interrogation (Indian Green) */}
            <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-emerald-200 hover:border-emerald-600 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-[#0D5204] group-hover:scale-110 transition-transform">
                  <Ship className="w-6 h-6 text-[#0D5204]" />
                </div>
                <div className="font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  {t.sub3Stage}
                </div>
                <h3 className="font-serif font-bold text-base text-[#0B2545] leading-snug">
                  {t.sub3Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {t.sub3Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-[#0D5204] font-bold">{t.sub3Tag1}</span>
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">{t.sub3Tag2}</span>
              </div>
            </div>

            {/* Subsystem 4: Legal Dossier Generator (Ashoka Gold / Navy) */}
            <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-amber-200 hover:border-amber-500 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform">
                  <Scale className="w-6 h-6 text-amber-700" />
                </div>
                <div className="font-mono text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                  {t.sub4Stage}
                </div>
                <h3 className="font-serif font-bold text-base text-[#0B2545] leading-snug">
                  {t.sub4Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {t.sub4Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-amber-800 font-bold">{t.sub4Tag1}</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{t.sub4Tag2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE LIVE SCENARIO SWITCHER (Demonstration Incidents) */}
      <div className="bg-[#021B0F] p-6 lg:p-10 border-b border-emerald-800/80 text-white">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
            <div>
              <div className="font-mono text-xs font-bold text-[#FFD700] uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                <span>{t.scenariosHeader}</span>
              </div>
              <h2 className="font-serif font-black text-xl lg:text-2xl text-white mt-1">
                {t.scenariosTitle}
              </h2>
            </div>
            <div className="text-xs text-emerald-300 font-mono">
              {t.scenariosSubtitle}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Scenario A Card */}
            <div
              onClick={() => handleLaunchScenario('scenario_a')}
              className={`rounded-xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                selectedScenarioTab === 'scenario_a'
                  ? 'bg-[#0B2545]/90 border-[#EA580C] shadow-[0_0_20px_rgba(234,88,12,0.35)]'
                  : 'bg-[#07192C]/80 border-slate-700/60 hover:border-[#EA580C]/80 hover:bg-[#0B2545]/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950/80 text-red-300 border border-red-500/60">
                    {t.scenarioATag}
                  </span>
                  <span className="font-mono text-[10px] text-orange-300">SCENARIO A</span>
                </div>
                <h3 className="font-serif font-bold text-base text-white group-hover:text-[#FF9933] transition-colors">
                  {t.scenarioATitle}
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {t.scenarioADesc}
                </p>
                <div className="space-y-1.5 pt-1 font-mono text-[11px] text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विस्तार:' : 'Slick Extent:'}</span>
                    <span className="font-bold text-white">{t.scenarioASlickLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'मुख्य संदिग्ध:' : 'Prime Suspect:'}</span>
                    <span className="font-bold text-red-400">{t.scenarioASuspectLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विश्वास स्तर:' : 'Confidence:'}</span>
                    <span className="font-bold text-[#FFD700]">{t.scenarioAConfidenceLabel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-[#FF9933] group-hover:translate-x-1 transition-transform">
                <span>{t.scenarioBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Scenario B Card */}
            <div
              onClick={() => handleLaunchScenario('scenario_b')}
              className={`rounded-xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                selectedScenarioTab === 'scenario_b'
                  ? 'bg-[#0B2545]/90 border-[#EA580C] shadow-[0_0_20px_rgba(234,88,12,0.35)]'
                  : 'bg-[#07192C]/80 border-slate-700/60 hover:border-[#EA580C]/80 hover:bg-[#0B2545]/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-500/60">
                    {t.scenarioBTag}
                  </span>
                  <span className="font-mono text-[10px] text-orange-300">SCENARIO B</span>
                </div>
                <h3 className="font-serif font-bold text-base text-white group-hover:text-[#FF9933] transition-colors">
                  {t.scenarioBTitle}
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {t.scenarioBDesc}
                </p>
                <div className="space-y-1.5 pt-1 font-mono text-[11px] text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विस्तार:' : 'Slick Extent:'}</span>
                    <span className="font-bold text-white">{t.scenarioBSlickLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'मुख्य संदिग्ध:' : 'Prime Suspect:'}</span>
                    <span className="font-bold text-amber-400">{t.scenarioBSuspectLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विश्वास स्तर:' : 'Confidence:'}</span>
                    <span className="font-bold text-[#FFD700]">{t.scenarioBConfidenceLabel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-[#FF9933] group-hover:translate-x-1 transition-transform">
                <span>{t.scenarioBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Scenario C Card */}
            <div
              onClick={() => handleLaunchScenario('scenario_c')}
              className={`rounded-xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                selectedScenarioTab === 'scenario_c'
                  ? 'bg-[#0B2545]/90 border-[#EA580C] shadow-[0_0_20px_rgba(234,88,12,0.35)]'
                  : 'bg-[#07192C]/80 border-slate-700/60 hover:border-[#EA580C]/80 hover:bg-[#0B2545]/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/60">
                    {t.scenarioCTag}
                  </span>
                  <span className="font-mono text-[10px] text-amber-300">SCENARIO C</span>
                </div>
                <h3 className="font-serif font-bold text-base text-white group-hover:text-[#FFD700] transition-colors">
                  {t.scenarioCTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.scenarioCDesc}
                </p>
                <div className="space-y-1.5 pt-1 font-mono text-[11px] text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विस्तार:' : 'Slick Extent:'}</span>
                    <span className="font-bold text-white">{t.scenarioCSlickLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'मुख्य संदिग्ध:' : 'Prime Suspect:'}</span>
                    <span className="font-bold text-purple-300">{t.scenarioCSuspectLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'hi' ? 'विश्वास स्तर:' : 'Confidence:'}</span>
                    <span className="font-bold text-[#FFD700]">{t.scenarioCConfidenceLabel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700/80 flex items-center justify-between text-xs font-bold text-[#FFD700] group-hover:translate-x-1 transition-transform">
                <span>{t.scenarioBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. INSTITUTIONAL DIGNITY HUB (DG Message, Official Bulletins & Video Gallery) */}
      <div className="bg-[#081B30] p-6 lg:p-10 flex-1 border-t-4 border-[#138808]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* A. LEFT (3 Cols): Director General Message Card */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wide">
                {t.dgCardHeader}
              </div>

              <div className="p-4 flex flex-col items-center text-center">
                <div className="w-32 h-36 rounded-lg overflow-hidden shadow-md border-2 border-amber-400 bg-gradient-to-b from-slate-100 to-slate-300 relative flex items-center justify-center group">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0B2545] to-[#07192C] text-white p-2">
                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-[#FFD700] flex items-center justify-center mb-1">
                      <Anchor className="w-8 h-8 text-[#FFD700]" />
                    </div>
                    <div className="font-serif font-bold text-[10px] text-[#FFD700] leading-tight">
                      DGICG
                    </div>
                    <div className="text-[8px] font-mono text-slate-200">
                      INDIAN COAST GUARD
                    </div>
                  </div>
                </div>

                <h3 className="font-serif font-extrabold text-xs text-slate-900 mt-2.5 leading-snug">
                  {t.dgName}
                </h3>
                <div className="text-[11px] font-bold text-[#EA580C] font-mono mt-0.5">
                  {t.dgRank}
                </div>

                <blockquote className="mt-2 text-[11px] italic text-slate-700 leading-relaxed border-t border-slate-100 pt-2 font-serif">
                  {t.dgQuote}
                </blockquote>
              </div>
            </div>

            <div className="p-3 pt-0 flex justify-center">
              <button
                onClick={() => setShowDgModal(true)}
                className="w-28 py-1.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {t.dgReadMoreBtn}
              </button>
            </div>
          </div>

          {/* B. MIDDLE (5 Cols): Tabbed Bulletin Board (What's New / Press Release / Tenders) */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col justify-between">
            <div>
              {/* Tab Headers */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                <button
                  onClick={() => setActiveTab('whatsNew')}
                  className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer ${
                    activeTab === 'whatsNew'
                      ? 'bg-[#EA580C] text-white shadow-xs font-extrabold'
                      : 'hover:bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {t.tabWhatsNew}
                </button>
                <button
                  onClick={() => setActiveTab('pressRelease')}
                  className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer ${
                    activeTab === 'pressRelease'
                      ? 'bg-[#0B2545] text-white shadow-xs font-extrabold'
                      : 'hover:bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {t.tabPressRelease}
                </button>
                <button
                  onClick={() => setActiveTab('tenders')}
                  className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer ${
                    activeTab === 'tenders'
                      ? 'bg-[#138808] text-white shadow-xs font-extrabold'
                      : 'hover:bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {t.tabTenders}
                </button>
              </div>

              {/* Notification Items */}
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[300px]">
                {activeTab === 'whatsNew' && (
                  <>
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-[#EA580C] flex-shrink-0 mt-0.5" />
                        <div>
                          <a
                            href="#hackx-launch"
                            onClick={(e) => {
                              e.preventDefault();
                              onLaunchWorkstation();
                            }}
                            className="font-bold text-xs text-[#0B2545] hover:text-[#EA580C] leading-snug hover:underline"
                          >
                            {lang === 'hi'
                              ? 'एमआरसीसी मुंबई (SIH 260143) में हैक-एक्स स्वायत्त समुद्री तेल रिसाव आसूचना एवं विधिक संज्ञान प्रणाली की सफल तैनाती'
                              : 'Deployment of HACKX Autonomous Maritime Oil Spill Intelligence & Legal Attribution System at MRCC Mumbai (SIH 260143)'}
                          </a>
                          <div className="text-[10px] text-[#138808] font-mono mt-0.5 font-bold">
                            {lang === 'hi' ? 'नवीनतम एडवाइजरी // कार्यक्षेत्र खोलने हेतु क्लिक करें' : 'LATEST ADVISORY // CLICK TO LAUNCH WORKSTATION'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <a
                            href="#rfi-merv"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(lang === 'hi' ? "मेक इन इंडिया के तहत भारतीय तटरक्षक के लिए 05 बहुउद्देश्यीय आपातकालीन प्रतिक्रिया जहाजों (MERVs) के अधिग्रहण हेतु सूचना के लिए अनुरोध (RFI)" : "Request for Information (RFI) for Acquisition of 05 Multi-Purpose Emergency Response Vessels (05 MERVs) for Indian Coast Guard under Make in India.");
                            }}
                            className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                          >
                            {lang === 'hi'
                              ? '05 बहुउद्देश्यीय आपातकालीन प्रतिक्रिया जहाजों (05 MERVs) के अधिग्रहण हेतु सूचना के लिए अनुरोध (RFI)'
                              : 'Request for Information (RFI) for Acquisition of 05 Multi-Purpose Emergency Response Vessels (05 MERVs)'}
                          </a>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">13/07/2026</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <a
                            href="#rfp-cgsuas"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(lang === 'hi' ? "समुद्री टोही मिशन हेतु 04 तटरक्षक पोत-आधारित मानवरहित हवाई प्रणाली (CGSUAS) की खरीद हेतु प्रस्ताव के लिए अनुरोध (RFP)" : "RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS) for maritime reconnaissance.");
                            }}
                            className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                          >
                            {lang === 'hi'
                              ? 'चार (04) तटरक्षक पोत-आधारित मानवरहित हवाई प्रणाली (CGSUAS) की खरीद हेतु आरएफपी'
                              : 'RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS)'}
                          </a>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">17/06/2026</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <a
                            href="#retraction"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(lang === 'hi' ? "तटरक्षक जहाज-आधारित मानवरहित हवाई प्रणाली (CGSUAS) तकनीकी संशोधन के संबंध में नोटिस" : "Retraction notice issued regarding technical amendment in CGSUAS tender specification.");
                            }}
                            className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                          >
                            {lang === 'hi'
                              ? 'चार (04) तटरक्षक पोत-आधारित मानवरहित हवाई प्रणाली (CGSUAS) की खरीद के संबंध में शुद्धिपत्र'
                              : 'Retraction of RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS)'}
                          </a>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">04/06/2026</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'pressRelease' && (
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="font-semibold text-xs text-blue-900">
                        {lang === 'hi'
                          ? 'भारतीय तटरक्षक ने गंभीर मानसूनी समुद्र में गोवा तट के पास 14 नाविकों को सुरक्षित बचाया'
                          : 'Indian Coast Guard Rescues 14 Crew Members off Goa Coast in Severe Monsoon Sea State'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">18/09/2026</div>
                    </div>
                    <div className="border-b border-slate-100 pb-2">
                      <div className="font-semibold text-xs text-blue-900">
                        {lang === 'hi'
                          ? 'अरब सागर में राष्ट्रीय समुद्री प्रदूषण प्रतिक्रिया अभ्यास (NATPOLREX-X) प्रारंभ'
                          : 'National Maritime Pollution Response Exercise (NATPOLREX-X) Commences in Arabian Sea'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">14/09/2026</div>
                    </div>
                  </div>
                )}

                {activeTab === 'tenders' && (
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="font-semibold text-xs text-blue-900">
                        {lang === 'hi'
                          ? 'निविदा सूचना: समुद्री प्रदूषण निवारण स्किमर्स एवं नियंत्रण बूम का वार्षिक रखरखाव अनुबंध'
                          : 'Tender Notice: Annual Maintenance Contract for Marine Pollution Response Skimmers and Containment Booms'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">10/08/2026</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Link Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-mono">
                {t.bulletinFooterText}
              </span>
            </div>
          </div>

          {/* C. RIGHT (4 Cols): Video Gallery & Official Portals */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Video Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white border-b border-amber-500/40 pb-2">
                <h2 className="font-serif font-black text-lg tracking-wide flex items-center space-x-2">
                  <span>{t.videoGalleryHeader}</span>
                </h2>
                <span className="text-[10px] font-mono text-amber-300">{t.videoGalleryModTag}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Video 1 - Saffron Card */}
                <div
                  onClick={() =>
                    setSelectedVideo({
                      title: t.video1ModalTitle,
                      desc: t.video1ModalDesc,
                    })
                  }
                  className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-orange-500/50 group cursor-pointer relative"
                >
                  <div className="h-28 bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex flex-col items-center justify-center p-2 text-center relative">
                    <div className="text-2xl mb-1">🚁 🚢</div>
                    <div className="font-serif font-bold text-[10px] text-white">
                      {lang === 'hi' ? 'विमानन स्क्वाड्रन' : 'AIR SQUADRON'}
                    </div>
                    {/* Red Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all">
                      <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#0F172A] text-white">
                    <div className="font-semibold text-[11px] truncate">{t.video1Title}</div>
                    <div className="text-[9px] text-orange-200">{t.video1Sub}</div>
                  </div>
                </div>

                {/* Video 2 - Sovereign Green Card */}
                <div
                  onClick={() =>
                    setSelectedVideo({
                      title: t.video2ModalTitle,
                      desc: t.video2ModalDesc,
                    })
                  }
                  className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-emerald-500/50 group cursor-pointer relative"
                >
                  <div className="h-28 bg-gradient-to-br from-[#138808] to-[#0D5204] flex flex-col items-center justify-center p-2 text-center relative">
                    <div className="text-2xl mb-1">⚓ 🌊</div>
                    <div className="font-serif font-black text-[10px] text-[#FFD700] uppercase tracking-wider">
                      {lang === 'hi' ? 'समुद्र में पराक्रम' : 'VALOUR AT SEA'}
                    </div>
                    {/* Red Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all">
                      <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#021B0F] text-white">
                    <div className="font-semibold text-[11px] truncate">{t.video2Title}</div>
                    <div className="text-[9px] text-emerald-300">{t.video2Sub}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Links - Tricolor Pair (Orange & Green) */}
            <div className="space-y-2">
              <div
                onClick={() => alert(lang === 'hi' ? "भारतीय तटरक्षक का मुख्यालय नई दिल्ली में स्थित है। क्षेत्रीय मुख्यालय मुंबई (पश्चिम), चेन्नई (पूर्व), कोलकाता (उत्तर पूर्व), पोर्ट ब्लेयर (अंडमान व निकोबार) तथा गांधीनगर (उत्तर पश्चिम) में हैं।" : "Indian Coast Guard Headquarters is in New Delhi. Regional Headquarters are in Mumbai (West), Chennai (East), Kolkata (North East), Port Blair (A&N), and Gandhinagar (North West).")}
                className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white rounded-lg p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center space-x-2.5">
                  <Ship className="w-4 h-4 text-white" />
                  <span className="font-serif font-bold text-xs">{t.linkCommands}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80" />
              </div>

              <div
                onClick={() => alert(lang === 'hi' ? "भारतीय तटरक्षक में अधिकारी (जनरल ड्यूटी/पायलट/तकनीकी) अथवा नामांकित कार्मिक (नाविक/यांत्रिक) के रूप में शामिल हों। joinindiancoastguard.cdac.in पर जाएं।" : "Join Indian Coast Guard as Officer (General Duty/Pilot/Technical) or Enrolled Personnel (Navik/Yantrik). Visit joinindiancoastguard.cdac.in")}
                className="bg-gradient-to-r from-[#138808] to-[#0D5204] hover:from-[#0D5204] hover:to-[#064E26] text-white rounded-lg p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center space-x-2.5">
                  <Anchor className="w-4 h-4 text-white" />
                  <span className="font-serif font-bold text-xs">{t.linkJoinIcg}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. FLOATING BACK-TO-TOP BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={scrollToTop}
          className="w-10 h-16 rounded-full bg-white text-[#EA580C] hover:bg-orange-50 border-2 border-[#EA580C] flex flex-col items-center justify-center shadow-xl transition-transform hover:-translate-y-1 cursor-pointer"
          title={t.backToTop}
        >
          <ArrowUp className="w-5 h-5 font-bold" />
        </button>
      </div>

      {/* Classic Video Footage Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b1320] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-amber-500/40 ring-1 ring-white/10 text-white font-sans">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0e192a] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    OFFICIAL SURVEILLANCE FOOTAGE ARCHIVE
                  </div>
                  <h3 className="font-serif font-bold text-sm text-slate-100">
                    {selectedVideo.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Footage Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Canvas Container with Classic Scanline & Maritime Telemetry HUD */}
            <div className="relative h-64 sm:h-72 bg-gradient-to-b from-slate-950 via-[#07111e] to-slate-950 flex flex-col justify-between p-4 overflow-hidden border-b border-slate-800">
              {/* Scanline CRT overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0px, rgba(0, 0, 0, 0.5) 1px, transparent 1px, transparent 2px)',
                }}
              />

              {/* Top Telemetry Watermark */}
              <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-amber-300/80">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold tracking-wider">LIVE REC [CH-04]</span>
                  <span className="text-slate-500">|</span>
                  <span>DORNIER-228 FLIR OPTICAL</span>
                </div>
                <div className="tracking-widest">
                  19°17.04' N, 71°50.95' E
                </div>
              </div>

              {/* Center Playback Visualizer */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-3 my-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer group">
                  <Play className="w-7 h-7 fill-slate-950 text-slate-950 ml-1 group-hover:scale-105 transition-transform" />
                </div>
                <div className="text-center space-y-1">
                  <div className="font-mono text-xs text-amber-200 font-bold tracking-wide">
                    {lang === 'hi' ? 'भारतीय तटरक्षक बल — प्रमाणित फुटेज' : 'Indian Coast Guard — Verified Tactical Footage'}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    SENSITIVE MARITIME INVESTIGATION RECORD • 1080P 60FPS
                  </div>
                </div>
              </div>

              {/* Bottom Scrubber & Transport Bar */}
              <div className="relative z-10 space-y-1.5">
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                  <div className="w-1/3 h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-amber-300 font-bold">01:14 / 03:42</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                      HD STEREO
                    </span>
                    <span>AUDIO TRACK ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Official Note */}
            <div className="p-4 space-y-2 bg-[#0a121e]">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedVideo.desc}
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                  <span>DEPT OF DEFENCE DIGITAL WATERMARK VERIFIED</span>
                </span>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer font-sans"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DG Message Modal */}
      {showDgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-3 shadow-2xl relative border-2 border-[#EA580C]">
            <button
              onClick={() => setShowDgModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-sm text-[#C2410C]">
              {t.dgModalTitle}
            </h3>
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed text-justify">
              <p>{t.dgModalP1}</p>
              <p>{t.dgModalP2}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDgModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                {t.dgModalClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
