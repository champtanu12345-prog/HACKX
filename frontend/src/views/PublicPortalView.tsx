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
} from 'lucide-react';
import { StateEmblemIndia } from '../components/common/StateEmblemIndia';
import { IndianCoastGuardInsignia } from '../components/common/IndianCoastGuardInsignia';

interface PublicPortalViewProps {
  onLaunchWorkstation: () => void;
}

const PORTAL_TICKER_ALERTS = [
  {
    id: 1,
    category: 'SAR DETECTION',
    text: 'Sentinel-1A SAR Pass: 14.85 km² oil slick verified in Mumbai High offshore sector. Damping confirmed at σ° < -24 dB.',
  },
  {
    id: 2,
    category: 'AIS BLACKOUT',
    text: 'PRIORITY ALERT: MT ARABIAN STAR (MMSI: 419000123) logged 92-min transponder blackout across estimated discharge locus.',
  },
  {
    id: 3,
    category: 'INCOIS DRIFT',
    text: 'INCOIS Metocean Hydrodynamics: Surface current 0.85 kts @ 235° with 15 kts windage. Lagrangian hindcast confirms 98.2% correlation.',
  },
  {
    id: 4,
    category: 'LEGAL PROSECUTION',
    text: 'Section 356C Merchant Shipping Act 1958: Official forensic evidence dossier compiled with SHA-256 digest: 7f83b165... Issued to Magistrate.',
  },
  {
    id: 5,
    category: 'COMMAND MOTTO',
    text: '"वयं रक्षामः // WE PROTECT" — Bharatiya Tatrakshak (Indian Coast Guard) 24x7 Sovereign Maritime Sentinel.',
  },
];

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({ onLaunchWorkstation }) => {
  const [isTickerPlaying, setIsTickerPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'whatsNew' | 'pressRelease' | 'tenders'>('whatsNew');
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; desc: string } | null>(null);
  const [showDgModal, setShowDgModal] = useState<boolean>(false);

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

    const currentAlert = PORTAL_TICKER_ALERTS[tickerIndex].text;
    const interval = setInterval(() => {
      if (charIndexRef.current < currentAlert.length) {
        charIndexRef.current++;
        setTypedText(currentAlert.slice(0, charIndexRef.current));
      } else {
        clearInterval(interval);
        setIsTyping(false);
        const timer = setTimeout(() => {
          setTickerIndex((prev) => (prev + 1) % PORTAL_TICKER_ALERTS.length);
        }, 3200);
        return () => clearTimeout(timer);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [tickerIndex, isTickerPlaying]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#042813] text-slate-800 font-sans overflow-y-auto select-none">
      {/* 1. TOP TICKER BAR: Real-Time Character-by-Character Typewriter */}
      <div className="bg-[#032B13] text-white px-4 py-2 flex items-center justify-between border-b border-emerald-800 shadow-xs z-20">
        <div className="flex items-center space-x-3 overflow-hidden flex-1">
          {/* Latest Update Pill with Animated Indicator */}
          <div className="bg-gradient-to-r from-[#10B981] to-[#064E26] px-3 py-1 rounded-[2px] font-bold text-xs uppercase tracking-wider flex-shrink-0 text-[#FFD700] border border-emerald-400/40 shadow-xs flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
            <span>Latest Update</span>
          </div>

          {/* Typewriter text canvas */}
          <div
            onClick={() => onLaunchWorkstation()}
            className="flex items-center space-x-2 text-xs text-emerald-100 overflow-hidden flex-1 font-mono cursor-pointer hover:text-white transition-colors"
            title="Click to launch Tactical Workstation"
          >
            <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300 border border-emerald-700/60 uppercase tracking-wider flex-shrink-0">
              {PORTAL_TICKER_ALERTS[tickerIndex].category}
            </span>
            <span className="text-[#FFD700] font-bold">››</span>
            <span className="truncate font-semibold tracking-wide text-white">{typedText}</span>
            {/* Blinking Teletype Cursor */}
            <span
              className={`inline-block w-2 h-3.5 bg-[#FFD700] shadow-[0_0_8px_#FFD700] flex-shrink-0 ${
                isTyping ? 'opacity-100' : 'animate-pulse'
              }`}
            />
          </div>
        </div>

        {/* Ticker Controls (Pause/Play & Prev/Next Arrows) */}
        <div className="flex items-center space-x-1.5 pl-3 flex-shrink-0 font-mono text-[10px]">
          <span className="text-emerald-400 font-bold mr-1 hidden sm:inline">
            {tickerIndex + 1}/{PORTAL_TICKER_ALERTS.length}
          </span>
          <button
            onClick={() => setIsTickerPlaying(!isTickerPlaying)}
            className="w-6 h-6 rounded-full bg-[#064E26] hover:bg-[#0D5204] border border-emerald-500/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            title={isTickerPlaying ? 'Pause Typewriter' : 'Resume Typewriter'}
          >
            {isTickerPlaying ? <Pause className="w-3 h-3 text-[#FFD700]" /> : <Play className="w-3 h-3 text-[#FFD700]" />}
          </button>
          <button
            onClick={() =>
              setTickerIndex((prev) => (prev === 0 ? PORTAL_TICKER_ALERTS.length - 1 : prev - 1))
            }
            className="w-6 h-6 rounded-full bg-[#064E26] hover:bg-[#0D5204] border border-emerald-500/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Previous Alert"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTickerIndex((prev) => (prev + 1) % PORTAL_TICKER_ALERTS.length)}
            className="w-6 h-6 rounded-full bg-[#064E26] hover:bg-[#0D5204] border border-emerald-500/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Next Alert"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. HERO SECTION: Light Green Ocean Waves Pattern */}
      <div className="relative bg-gradient-to-b from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0] p-6 lg:p-8 overflow-hidden shadow-inner border-b-4 border-[#064E26]">
        {/* Subtle SVG Wave Shapes in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
            <path
              fill="#FFFFFF"
              d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,133.3C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* A. LEFT: Message from the Director General Card */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header Pill */}
              <div className="bg-[#064E26] text-white py-2 px-3 text-center font-bold text-xs uppercase tracking-wide">
                Message from the Director General
              </div>

              {/* DG Portrait */}
              <div className="p-4 flex flex-col items-center text-center">
                <div className="w-32 h-36 rounded-lg overflow-hidden shadow-md border-2 border-amber-400 bg-gradient-to-b from-slate-100 to-slate-300 relative flex items-center justify-center group">
                  {/* Dignified Officer Portrait Illustration */}
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#064E26] text-white p-2">
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
                  Director General Paramesh Sivamani, AVSM, PTM, TM
                </h3>
                <div className="text-[11px] font-bold text-[#064E26] font-mono mt-0.5">
                  DGICG
                </div>

                <blockquote className="mt-2 text-[11px] italic text-slate-700 leading-relaxed border-t border-slate-100 pt-2 font-serif">
                  "The connection between serving personnel and veterans is intangible, everlasting and strong"
                </blockquote>
              </div>
            </div>

            <div className="p-3 pt-0 flex justify-center">
              <button
                onClick={() => setShowDgModal(true)}
                className="w-28 py-1.5 rounded-full bg-[#064E26] hover:bg-[#0D5204] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Read More
              </button>
            </div>
          </div>

          {/* B. MIDDLE: About Us & Operational Gateway */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-5 shadow-lg border border-emerald-200 space-y-3">
              <h2 className="font-serif font-black text-xl text-[#064E26] flex items-center space-x-2 border-b border-emerald-100 pb-2">
                <span>About Us</span>
              </h2>

              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                <strong>Bharatiya Tatrakshak</strong> is an Armed Force of the Union constituted under the Coast Guard Act, 1978, entrusted with safeguarding Bharat's maritime interests and upholding the Nation's sovereign rights across its maritime domain. As the country's premier maritime law enforcement agency, Bharatiya Tatrakshak stands as a steadfast sentinel of the seas, ensuring maritime safety, maritime security, coastal security, and the protection of the marine environment.
              </p>

              <div>
                <button
                  onClick={() => alert("Bharatiya Tatrakshak (Indian Coast Guard) operates under the Ministry of Defence, safeguarding India's 7,516 km coastline and Exclusive Economic Zone (EEZ).")}
                  className="px-5 py-1.5 rounded-full bg-[#064E26] hover:bg-[#0D5204] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Read More
                </button>
              </div>
            </div>

            {/* HIGH-IMPACT COMMAND GATEWAY: Launch HACKX Tactical Workstation */}
            <div className="bg-gradient-to-r from-[#064E26] via-[#0B3A1E] to-[#064E26] text-white rounded-xl p-4 shadow-xl border-2 border-[#FFD700] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center flex-shrink-0 text-[#FFD700]">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="font-serif font-bold text-xs text-[#FFD700] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>MRCC MUMBAI // TACTICAL INTELLIGENCE WORKSTATION</span>
                  </div>
                  <div className="text-[11px] text-emerald-100 font-sans">
                    Active SAR Slick Incident in Sector MH-4 · Lagrangian Drift & AIS Attribution
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunchWorkstation}
                className="px-4 py-2 rounded-lg bg-[#FFD700] hover:bg-[#F2C200] text-[#064E26] font-sans font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md hover:shadow-xl cursor-pointer flex-shrink-0"
              >
                <span>कार्यक्षेत्र प्रारंभ करें / ENTER WORKSTATION</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#064E26]" />
              </button>
            </div>
          </div>

          {/* C. RIGHT: 4 Action Cards (Commands, Veterans, E-Sewa, Join ICG) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            {/* Card 1: CG Commands and Regions */}
            <div
              onClick={() => alert("Indian Coast Guard Headquarters is in New Delhi. Regional Headquarters are in Mumbai (West), Chennai (East), Kolkata (North East), Port Blair (A&N), and Gandhinagar (North West).")}
              className="bg-gradient-to-r from-[#10B981] to-[#064E26] hover:from-[#059669] hover:to-[#032B13] text-white rounded-xl p-3.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                  <Ship className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm leading-tight">CG Commands and Regions</div>
                  <div className="text-[11px] text-emerald-100 hover:underline">Read more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>

            {/* Card 2: CG Veterans Affairs */}
            <div
              onClick={() => alert("Indian Coast Guard Veterans Affairs Directorate provides welfare, pensions, and healthcare schemes for serving and retired veterans.")}
              className="bg-gradient-to-r from-[#10B981] to-[#064E26] hover:from-[#059669] hover:to-[#032B13] text-white rounded-xl p-3.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm leading-tight">CG Veterans Affairs</div>
                  <div className="text-[11px] text-emerald-100 hover:underline">Read more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>

            {/* Card 3: Welcome To E-SEWA */}
            <div
              onClick={() => alert("E-SEWA Portal provides digital citizen services, maritime clearances, and public grievance redressal.")}
              className="bg-gradient-to-r from-[#10B981] to-[#064E26] hover:from-[#059669] hover:to-[#032B13] text-white rounded-xl p-3.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm leading-tight">Welcome To E-SEWA</div>
                  <div className="text-[11px] text-emerald-100 hover:underline">Read more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>

            {/* Card 4: Join Indian Coast Guard */}
            <div
              onClick={() => alert("Join Indian Coast Guard as Officer (General Duty/Pilot/Technical) or Enrolled Personnel (Navik/Yantrik). Visit joinindiancoastguard.cdac.in")}
              className="bg-gradient-to-r from-[#10B981] to-[#064E26] hover:from-[#059669] hover:to-[#032B13] text-white rounded-xl p-3.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm leading-tight">Join Indian Coast Guard</div>
                  <div className="text-[11px] text-emerald-100 hover:underline">Read more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER SECTION: Deep Forest Green Background */}
      <div className="bg-[#032B13] p-6 lg:p-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* A. LEFT: Tabbed News & Tender Board (What's New / Press Release / Tenders) */}
          <div className="lg:col-span-6 bg-white rounded-xl shadow-xl overflow-hidden border border-emerald-900/40 flex flex-col">
            {/* Tab Headers (Matches Screenshot: 3 Tabs) */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <button
                onClick={() => setActiveTab('whatsNew')}
                className={`flex-1 py-3 px-3 text-center transition-all cursor-pointer ${
                  activeTab === 'whatsNew'
                    ? 'bg-[#064E26] text-white shadow-xs font-extrabold'
                    : 'hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                What's New
              </button>
              <button
                onClick={() => setActiveTab('pressRelease')}
                className={`flex-1 py-3 px-3 text-center transition-all cursor-pointer ${
                  activeTab === 'pressRelease'
                    ? 'bg-[#064E26] text-white shadow-xs font-extrabold'
                    : 'hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Press Release
              </button>
              <button
                onClick={() => setActiveTab('tenders')}
                className={`flex-1 py-3 px-3 text-center transition-all cursor-pointer ${
                  activeTab === 'tenders'
                    ? 'bg-[#064E26] text-white shadow-xs font-extrabold'
                    : 'hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Tenders and Recruitment
              </button>
            </div>

            {/* Notification Items with PDF Icons */}
            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[300px]">
              {activeTab === 'whatsNew' && (
                <>
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <a
                          href="#rfi-merv"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Request for Information (RFI) for Acquisition of 05 Multi-Purpose Emergency Response Vessels (05 MERVs) for Indian Coast Guard under Make in India.");
                          }}
                          className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                        >
                          Request for Information (RFI) for Acquisition of 05 Multi-Purpose Emergency Response Vessels (05 MERVs)
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
                            alert("RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS) for maritime reconnaissance.");
                          }}
                          className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                        >
                          RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS)
                        </a>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">17/06/2026</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <a
                          href="#retraction"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Retraction notice issued regarding technical amendment in CGSUAS tender specification.");
                          }}
                          className="font-semibold text-xs text-blue-900 hover:underline leading-snug"
                        >
                          Retraction of RFP for PROCUREMENT OF FOUR (04) COAST GUARD SHIPBORNE UNMANNED AERIAL SYSTEM (CGSUAS)
                        </a>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">04/06/2026</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <a
                          href="#hackx-launch"
                          onClick={(e) => {
                            e.preventDefault();
                            onLaunchWorkstation();
                          }}
                          className="font-bold text-xs text-emerald-800 hover:underline leading-snug"
                        >
                          Deployment of HACKX Autonomous Maritime Oil Spill Intelligence & Legal Attribution System at MRCC Mumbai (SIH 260143)
                        </a>
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">LATEST ADVISORY // CLICK TO LAUNCH</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pressRelease' && (
                <div className="space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <div className="font-semibold text-xs text-blue-900">
                      Indian Coast Guard Rescues 14 Crew Members off Goa Coast in Severe Monsoon Sea State
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">18/09/2026</div>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <div className="font-semibold text-xs text-blue-900">
                      National Maritime Pollution Response Exercise (NATPOLREX-X) Commences in Arabian Sea
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">14/09/2026</div>
                  </div>
                </div>
              )}

              {activeTab === 'tenders' && (
                <div className="space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <div className="font-semibold text-xs text-blue-900">
                      Tender Notice: Annual Maintenance Contract for Marine Pollution Response Skimmers and Containment Booms
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">10/08/2026</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. RIGHT: Video Gallery (Matches Screenshot: Video Gallery + Chetak & Valour at Sea) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-white border-b border-emerald-400/30 pb-2">
              <h2 className="font-serif font-black text-xl tracking-wide flex items-center space-x-2">
                <span>Video Gallery</span>
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert("Showing previous video gallery items")}
                  className="w-7 h-7 rounded-full bg-[#064E26] hover:bg-[#0D5204] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert("Showing next video gallery items")}
                  className="w-7 h-7 rounded-full bg-[#064E26] hover:bg-[#0D5204] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Video 1: Chetak/ALH Dhruv Helicopter SAR */}
              <div
                onClick={() =>
                  setSelectedVideo({
                    title: 'Indian Coast Guard Aviation Search & Rescue',
                    desc: 'Chetak and ALH Dhruv helicopters conducting open-sea medical evacuations and maritime environmental monitoring over Indian EEZ.',
                  })
                }
                className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-emerald-400/40 group cursor-pointer relative"
              >
                <div className="h-44 bg-gradient-to-t from-black/80 via-black/20 to-transparent relative flex items-center justify-center">
                  {/* Helicopter & Ship Illustration */}
                  <div className="absolute inset-0 bg-[#064E26] flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-3xl mb-1">🚁 🚢</div>
                    <div className="font-serif font-bold text-xs text-white">
                      ICG AIR SQUADRON
                    </div>
                    <div className="text-[10px] text-emerald-200">
                      Search and Rescue Maritime Reconnaissance
                    </div>
                  </div>

                  {/* Red Play Button Overlay (Matches Screenshot) */}
                  <div className="relative z-10 w-12 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-700 transition-all">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-10 border-l-white ml-0.5" />
                  </div>
                </div>

                <div className="p-2.5 bg-[#032B13] text-white">
                  <div className="font-semibold text-xs truncate">Search & Rescue Operations</div>
                  <div className="text-[10px] text-emerald-200">Indian Coast Guard Aviation</div>
                </div>
              </div>

              {/* Video 2: Valour at Sea Offshore Patrol Vessel */}
              <div
                onClick={() =>
                  setSelectedVideo({
                    title: 'Valour at Sea: Sentinels of the Deep',
                    desc: 'Official Indian Coast Guard documentary highlighting offshore fleet patrol, anti-smuggling interdiction, and marine environmental protection.',
                  })
                }
                className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-emerald-400/40 group cursor-pointer relative"
              >
                <div className="h-44 bg-gradient-to-t from-black/80 via-black/20 to-transparent relative flex items-center justify-center">
                  {/* Ship Deck Illustration */}
                  <div className="absolute inset-0 bg-[#032B13] flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-3xl mb-1">⚓ 🌊</div>
                    <div className="font-serif font-black text-sm text-[#FFD700] tracking-widest uppercase">
                      VALOUR AT SEA
                    </div>
                    <div className="text-[10px] text-emerald-200">
                      Offshore Patrol Fleet in High Seas
                    </div>
                  </div>

                  {/* Red Play Button Overlay (Matches Screenshot) */}
                  <div className="relative z-10 w-12 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-700 transition-all">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-10 border-l-white ml-0.5" />
                  </div>
                </div>

                <div className="p-2.5 bg-[#032B13] text-white">
                  <div className="font-semibold text-xs truncate">Valour at Sea Documentary</div>
                  <div className="text-[10px] text-emerald-200">Sentinels of Bharat's Seas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING BACK-TO-TOP BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={scrollToTop}
          className="w-10 h-16 rounded-full bg-white text-[#064E26] hover:bg-emerald-50 border-2 border-[#064E26] flex flex-col items-center justify-center shadow-xl transition-transform hover:-translate-y-1 cursor-pointer"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5 font-bold" />
        </button>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-3 shadow-2xl relative border-2 border-[#0B4A8B]">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-base text-[#0B4A8B]">
              {selectedVideo.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedVideo.desc}
            </p>
            <div className="h-48 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white">
              <PlayCircle className="w-12 h-12 text-red-500 mb-2" />
              <div className="font-mono text-xs text-slate-300">
                Official Ministry of Defence Video Broadcast
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DG Message Modal */}
      {showDgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-3 shadow-2xl relative border-2 border-[#0B4A8B]">
            <button
              onClick={() => setShowDgModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-sm text-[#0B4A8B]">
              Message from Director General Paramesh Sivamani, AVSM, PTM, TM
            </h3>
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed text-justify">
              <p>
                "As the Director General of the Indian Coast Guard, I commend our valiant officers and men who maintain an unyielding 24x7 vigil across our maritime zones."
              </p>
              <p>
                "With the adoption of indigenous AI-driven satellite radar intelligence and autonomous spill attribution systems like HACKX (SIH 260143), we strengthen India's resolve to enforce MARPOL Annex-I and prosecute illegal high-seas polluters with court-admissible forensic rigor."
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDgModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#0B4A8B] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
