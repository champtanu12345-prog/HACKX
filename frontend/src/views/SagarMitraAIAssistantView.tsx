import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Shield,
  Waves,
  Radio,
  FileText,
  Activity,
  ArrowRight,
  ExternalLink,
  Send,
  Globe,
  Compass,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  X,
  Volume2,
  Share2,
  Anchor,
  Search,
} from 'lucide-react';
import { NavView } from '../components/shell/Sidebar';
import { generateCopilotResponseAsync, generateCopilotResponse } from '../utils/copilotEngine';
import { DEMO_SCENARIOS } from '../data/maritimeDemoData';

interface SagarMitraAIAssistantViewProps {
  onNavigate?: (view: NavView) => void;
  onOpenWorkstation?: () => void;
  onOpenPortal?: () => void;
}

export const SagarMitraAIAssistantView: React.FC<SagarMitraAIAssistantViewProps> = ({
  onNavigate,
  onOpenWorkstation,
  onOpenPortal,
}) => {
  // Active Capability selected in the 8-node orbital wheel
  const [selectedCapability, setSelectedCapability] = useState<number>(0);

  // Live prompt & interactive chat state in the bottom-right card
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; time: string; action?: any }>
  >([
    {
      sender: 'assistant',
      text: 'जय हिन्द! I am Sagar Mitra (सागर मित्र), the autonomous maritime intelligence copilot for the Indian Coast Guard. How can I assist with satellite SAR attribution, drift simulation, or MARPOL compliance today?',
      time: 'Just now',
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Capabilities in the 8-node orbital wheel (matching the Dribbble design)
  const capabilities = [
    {
      id: 0,
      title: 'Satellite SAR Detection',
      icon: '🛰️',
      code: 'SAR-TELEMETRY',
      description:
        'Analyzes Sentinel-1 & RISAT Synthetic Aperture Radar normalized radar cross-section (NRCS) to detect covert midnight oil slicks through cloud cover.',
      metrics: 'Resolution: 10m • Cloud-penetrating C-Band',
    },
    {
      id: 1,
      title: 'Lagrangian Drift Physics',
      icon: '🌊',
      code: 'HYDRO-DRIFT-v2.4',
      description:
        'Runs backward and forward trajectory simulations powered by INCOIS surface currents, tidal vectors, and wind-drift coefficients.',
      metrics: 'Error Ellipse: < 1.2 NM at 48h horizon',
    },
    {
      id: 2,
      title: 'AIS Vessel Correlation',
      icon: '🚢',
      code: 'AIS-SPOOF-AUDIT',
      description:
        'Cross-correlates vessel positions with historical tracks, flagging unannounced AIS transmission dropouts and velocity drops near slicks.',
      metrics: 'Coverage: 15,400+ vessels in Arabian Sea',
    },
    {
      id: 3,
      title: 'MARPOL Legal Dossiers',
      icon: '⚖️',
      code: 'ANNEX-I-FORENSICS',
      description:
        'Automates court-admissible legal dossiers documenting vessel particulars, P&I Club underwriters, and chain-of-custody sensor proof.',
      metrics: 'Compliance: Merchant Shipping Act 1958',
    },
    {
      id: 4,
      title: 'Multilingual Voice & Chat',
      icon: '🎙️',
      code: 'VOICE-LLM-HINDI',
      description:
        'Seamlessly understands commands in English and Hindi (हिन्दी) for natural tactical interaction during fast-paced naval operations.',
      metrics: 'Dialects: 12 Coastal Indian Languages',
    },
    {
      id: 5,
      title: 'Attribution Probability',
      icon: '🎯',
      code: 'BAYESIAN-SCORER',
      description:
        'Calculates transparent mathematical suspicion score (0-100%) factoring CPA distance, drift intersection time, and tank wash profiles.',
      metrics: 'Attribution Confidence: 99.4%',
    },
    {
      id: 6,
      title: 'EEZ Sovereign Shield',
      icon: '🛡️',
      code: 'EEZ-DEFENSE-200NM',
      description:
        '24/7 autonomous shield across India’s 200 NM Exclusive Economic Zone, safeguarding high-risk petroleum transit sectors like Mumbai High.',
      metrics: 'Perimeter: 7,516 km Indian Coastline',
    },
    {
      id: 7,
      title: 'Tactical Multi-Alert',
      icon: '⚡',
      code: 'EMERGENCY-DISPATCH',
      description:
        'Instant multi-channel alert dispatch to MRCC Mumbai desks, Pollution Response Teams (PRTs), and naval patrol helicopters via SATCOM.',
      metrics: 'Latency: < 450ms End-to-End',
    },
  ];

  // Quick prompt suggestions for testing
  const quickPrompts = [
    'Attribute oil spill in Sector MH-4 to nearby tankers',
    'Simulate 48h Lagrangian drift towards Mumbai',
    'Generate MARPOL Annex I violation dossier',
    'List high suspicion vessels in Arabian Sea',
  ];

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await generateCopilotResponseAsync(
        text,
        DEMO_SCENARIOS.scenario_a,
        'overview',
        'en'
      );

      const assistantMsg = {
        sender: 'assistant' as const,
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallback = generateCopilotResponse(text, DEMO_SCENARIOS.scenario_a, 'overview', 'en');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: fallback.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: fallback.action,
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050C16] text-white flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background Starry / Ocean Glow Particle Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Presentation Bar */}
      <header className="sticky top-0 z-40 bg-[#081220]/90 backdrop-blur-xl border-b border-sky-900/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Left Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#071322] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-white tracking-wide">
                SAGAR MITRA <span className="text-cyan-400 font-mono text-xs">v3.2 AI</span>
              </span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                सागर मित्र
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Indian Coast Guard • Autonomous Maritime Intelligence & Decision Support
            </div>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {onOpenPortal && (
            <button
              onClick={onOpenPortal}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ICG Portal</span>
            </button>
          )}

          {onOpenWorkstation && (
            <button
              onClick={onOpenWorkstation}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch Workstation</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Bento Grid Canvas (Exact Dribbble Architecture) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* ============================================================== */}
        {/* ROW 1: TOP 3 CARDS (Speed, Bot Avatar, #1 AI Agent)             */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* 1. TOP-LEFT CARD: Speed and Autonomous Precision (span-5) */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#0B1728]/90 to-[#07111E]/90 rounded-3xl p-6 sm:p-7 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-sky-400/40 transition-all duration-300">
            <div>
              {/* Horizontal Icon Action Bar matching Dribbble */}
              <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
                  <Waves className="w-4 h-4 text-sky-400" />
                </div>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
                  <Shield className="w-4 h-4 text-indigo-400" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Speed and Autonomous Precision
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Instant attribution response in under 0.8 seconds across Sector MH-4 and Exclusive Economic Zone corridors.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-4 border-t border-sky-900/30 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">0.8s Latency</span>
              </span>
              <span>INCOIS Live Sync</span>
              <span className="text-cyan-400 font-bold">99.4% Confidence</span>
            </div>
          </div>

          {/* 2. TOP-CENTER CARD: Glowing Sagar Mitra Avatar (span-2) */}
          <div className="md:col-span-2 bg-gradient-to-b from-[#0D1D33] to-[#071322] rounded-3xl p-6 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-400/60 transition-all duration-300">
            {/* Ambient Pulse Ring */}
            <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-500 p-0.5 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#06101D] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Glowing AI Face matching Dribbble avatar */}
                <Bot className="w-8 h-8 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-2 right-2 animate-pulse" />
              </div>
            </div>

            <div className="relative z-10 mt-3 text-center">
              <div className="text-[11px] font-mono font-bold text-cyan-300">SAGAR MITRA</div>
              <div className="text-[9px] text-slate-400 font-mono">Autonomous AI Bot</div>
            </div>
          </div>

          {/* 3. TOP-RIGHT CARD: #1 AI Maritime Agent (span-5) */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#0B1728]/90 to-[#07111E]/90 rounded-3xl p-6 sm:p-7 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-sky-400/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  #1 AI Agent
                </div>
                <div className="text-sm font-semibold text-cyan-400 mt-1">
                  for Maritime Environmental Defense
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              In a world of congested tanker routes and illicit midnight bilge discharges, Sagar Mitra attributes with
              court-admissible forensic certainty.
            </p>

            <div className="mt-6 pt-4 border-t border-sky-900/30 flex items-center space-x-2">
              <span className="text-[10px] font-mono bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded text-sky-300">
                SIH 260143
              </span>
              <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-emerald-300">
                NOS-DCP Certified
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 2: CENTER HERO CARD & 8-NODE ORBITAL WHEEL                  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* 4. CENTER BIG HERO CARD: "✦ Sagar Mitra" with Vortex Ripple (span-7) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-[#0A1628] via-[#06101D] to-[#040A14] rounded-3xl p-8 sm:p-10 border border-sky-500/25 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[380px] group">
            {/* Concentric Sonic / Radar Waves matching Dribbble center card */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700">
              <div className="w-[200px] h-[200px] rounded-full border border-cyan-500/20 animate-ping" />
              <div className="w-[340px] h-[340px] rounded-full border border-sky-500/15 absolute" />
              <div className="w-[480px] h-[480px] rounded-full border border-blue-500/10 absolute" />
              <div className="w-[620px] h-[620px] rounded-full border border-indigo-500/5 absolute" />
            </div>

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 bg-black/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>AUTONOMOUS OPERATIONAL COPILOT</span>
              </div>
              <span className="text-xs font-mono text-slate-500">2026 EDITION</span>
            </div>

            {/* Center Glowing Logo Text matching "Auron" in Dribbble */}
            <div className="relative z-10 my-auto py-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 p-0.5 shadow-[0_0_35px_rgba(6,182,212,0.5)] flex items-center justify-center mb-4 sm:mb-0">
                <div className="w-full h-full rounded-[14px] bg-[#050C16] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start space-x-3">
                  <span>Sagar Mitra</span>
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </h1>
                <div className="mt-1 text-sm font-serif font-bold text-amber-300/90 tracking-wide">
                  सागर मित्र • राष्ट्रीय समुद्री तेल रिसाव आसूचना सहायक
                </div>
              </div>
            </div>

            {/* Bottom Subtitle */}
            <div className="relative z-10 pt-4 border-t border-sky-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <span>Central Coordinating AI for National Oil Spill Contingency (NOS-DCP)</span>
              <button
                onClick={() => handleSendQuery('Explain how you attribute illegal oil spills in Indian waters')}
                className="inline-flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                <span>Ask Capability</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. MIDDLE-RIGHT CARD: 8-Node Orbital Capability Wheel (span-5) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0B1728]/95 to-[#07111E]/95 rounded-3xl p-6 sm:p-7 border border-sky-500/25 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  TACTICAL CAPABILITY MATRIX
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {selectedCapability + 1} / {capabilities.length} Selected
                </div>
              </div>

              {/* Orbital Wheel Grid matching Dribbble circular layout */}
              <div className="relative w-full aspect-square max-w-[240px] mx-auto my-2 flex items-center justify-center">
                {/* Orbit Rings */}
                <div className="absolute inset-0 rounded-full border border-sky-500/20" />
                <div className="absolute inset-6 rounded-full border border-cyan-500/15" />

                {/* Center Diamond Sparkle matching Dribbble */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center relative z-20">
                  <div className="w-full h-full rounded-full bg-[#071322] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '12s' }} />
                  </div>
                </div>

                {/* 8 Orbital Node Badges */}
                {capabilities.map((cap, idx) => {
                  const angle = (idx * 2 * Math.PI) / capabilities.length - Math.PI / 2;
                  const radius = 90; // px
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isSelected = selectedCapability === cap.id;

                  return (
                    <button
                      key={cap.id}
                      onClick={() => setSelectedCapability(cap.id)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110 border-2 border-white'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-sky-500/30 hover:scale-105'
                      }`}
                      title={cap.title}
                    >
                      <span className="text-sm">{cap.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Capability Detail Pane */}
            <div className="mt-4 p-3.5 bg-slate-900/90 rounded-2xl border border-sky-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>{capabilities[selectedCapability].icon}</span>
                  <span>{capabilities[selectedCapability].title}</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {capabilities[selectedCapability].code}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {capabilities[selectedCapability].description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 font-semibold">
                {capabilities[selectedCapability].metrics}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 3: BOTTOM 3 CARDS (Multilingual, Action CTA, Live Chat)     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* 6. BOTTOM-LEFT CARD: Multilingual & Neural Architecture (span-3) */}
          <div className="lg:col-span-3 bg-gradient-to-b from-[#0B1728]/90 to-[#07111E]/90 rounded-3xl p-6 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                NEURAL ARCHITECTURE
              </div>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-4xl font-serif font-black text-white">Aa</span>
                <span className="text-4xl font-serif font-black text-amber-400">म</span>
                <span className="text-xs text-slate-400 font-mono ml-auto">Multilingual LLM</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-3">
                Bilingual Hindi & English
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-normal">
                Natural tactical voice & text understanding for Coast Guard commanders in English and Hindi.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-900/30 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Devanagari NLP</span>
              <span className="text-cyan-400 font-bold">12 Dialects</span>
            </div>
          </div>

          {/* 7. BOTTOM-CENTER CARD: Smarter Ways to Safeguard (span-4) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#0B1728]/90 to-[#07111E]/90 rounded-3xl p-6 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2">
                MISSION READINESS
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                Smarter ways to safeguard our waters
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-normal">
                Trusted by Indian Coast Guard commanders, MRCC Mumbai watchstanders, and pollution defense teams.
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  if (onOpenWorkstation) onOpenWorkstation();
                  else if (onNavigate) onNavigate('overview');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer group hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Launch Sagar Mitra Copilot</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-900 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* 8. BOTTOM-RIGHT CARD: Live Interactive Sagar Mitra Prompt Bar (span-5) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0B1728]/95 to-[#07111E]/95 rounded-3xl p-6 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col justify-between min-h-[290px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-cyan-300">LIVE TACTICAL COPILOT</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Ready
                </span>
              </div>

              {/* Chat Stream (Scrollable Preview) */}
              <div
                ref={chatContainerRef}
                className="max-h-[140px] overflow-y-auto space-y-2 mb-3 pr-1 text-xs"
              >
                {chatMessages.slice(-2).map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl ${
                      msg.sender === 'user'
                        ? 'bg-sky-950/70 border border-sky-800/60 text-sky-100 ml-6 text-right'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-slate-400 mb-0.5">
                      {msg.sender === 'user' ? 'Officer' : 'Sagar Mitra AI'} • {msg.time}
                    </div>
                    <div className="leading-relaxed line-clamp-3">{msg.text}</div>
                  </div>
                ))}

                {isTyping && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-300 text-xs flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="font-mono text-[10px]">Analyzing SAR radar & AIS trajectories...</span>
                  </div>
                )}
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickPrompts.slice(0, 2).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(prompt)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-sky-900/40 transition-colors cursor-pointer truncate max-w-[200px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar matching Dribbble bottom-right card */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(chatInput);
              }}
              className="relative"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Sagar Mitra a question or make a request..."
                className="w-full pl-4 pr-11 py-3 bg-slate-900/95 hover:bg-slate-900 focus:bg-black text-white text-xs rounded-2xl border border-sky-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-500 font-medium"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-8 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 border-t border-sky-900/30 bg-[#040912] py-4 px-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
        <span>SAGAR MITRA (सागर मित्र) • Developed for Indian Coast Guard | Smart India Hackathon (SIH 260143)</span>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-cyan-400 font-bold">100% Autonomous</span>
          <span>•</span>
          <span>NOS-DCP Tier-I/II/III Ready</span>
        </div>
      </footer>
    </div>
  );
};
