import React, { useState, useEffect } from 'react';
import { StateEmblemIndia } from './StateEmblemIndia';
import { IndianCoastGuardInsignia } from './IndianCoastGuardInsignia';
import { TricolorRibbon } from './TricolorRibbon';
import { Clock, Shield, Globe, Eye, ChevronRight } from 'lucide-react';

interface GovMastheadProps {
  fontSizeLevel?: number; // -1, 0, 1
  onFontSizeChange?: (level: number) => void;
  lang?: 'en' | 'hi';
  onToggleLang?: () => void;
  className?: string;
}

export const GovMasthead: React.FC<GovMastheadProps> = ({
  fontSizeLevel = 0,
  onFontSizeChange,
  lang = 'en',
  onToggleLang,
  className = '',
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      // Format IST (UTC + 5:30)
      const istOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setIstTime(`${new Intl.DateTimeFormat('en-IN', istOptions).format(now)} IST`);

      // Format UTC
      const pad = (n: number) => n.toString().padStart(2, '0');
      const utcHrs = pad(now.getUTCHours());
      const utcMins = pad(now.getUTCMinutes());
      const utcSecs = pad(now.getUTCSeconds());
      setUtcTime(`${utcHrs}:${utcMins}:${utcSecs} UTC`);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full bg-[#064E26] text-white border-b-2 border-[#032B13] select-none ${className}`}>
      {/* 1. National Flag Tricolor Accent Bar */}
      <TricolorRibbon height="md" />

      {/* 2. Top GIGW Accessibility & National Identity Bar */}
      <div className="bg-[#032B13] px-4 py-1 flex items-center justify-between text-[11.5px] border-b border-[#043D1B] font-sans">
        {/* Left: National Identity Links */}
        <div className="flex items-center space-x-3 text-slate-200">
          <div className="flex items-center space-x-1.5 font-semibold">
            <span className="font-serif text-[#FF9933] font-bold text-xs tracking-wide">भारत सरकार</span>
            <span className="text-emerald-400">|</span>
            <span className="font-classic text-white font-bold tracking-wider text-[11px]">GOVERNMENT OF INDIA</span>
          </div>
          <span className="text-emerald-500 hidden md:inline">•</span>
          <div className="hidden md:flex items-center space-x-1.5 text-slate-200">
            <span className="font-serif text-slate-200 font-semibold text-xs">रक्षा मंत्रालय</span>
            <span className="text-emerald-400">|</span>
            <span className="font-classic text-slate-100 font-semibold tracking-wider text-[11px]">MINISTRY OF DEFENCE</span>
          </div>
        </div>

        {/* Right: Accessibility Controls & Clocks */}
        <div className="flex items-center space-x-3 text-[11.5px]">
          {/* Classification Banner */}
          <div className="hidden lg:flex items-center space-x-1 bg-[#138808]/30 text-[#86EFAC] border border-[#22C55E]/40 px-2 py-0.5 rounded-[2px] font-mono text-[9.5px] font-bold tracking-wider uppercase">
            <Shield className="w-2.5 h-2.5 text-[#FFD700]" />
            <span>LAW ENFORCEMENT SENSITIVE // ICG-MRCC</span>
          </div>

          {/* GIGW Font Size Switcher */}
          <div className="hidden sm:flex items-center space-x-1 bg-[#064E26] px-1.5 py-0.5 rounded-[2px] border border-emerald-700/60 font-mono text-[10.5px]">
            <span className="text-emerald-200 mr-1 font-bold">FONT:</span>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange(-1)}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${fontSizeLevel === -1 ? 'bg-white text-[#064E26] font-extrabold shadow-xs' : 'text-slate-200 hover:bg-emerald-800'}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange(0)}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${fontSizeLevel === 0 ? 'bg-white text-[#064E26] font-extrabold shadow-xs' : 'text-slate-200 hover:bg-emerald-800'}`}
              title="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange && onFontSizeChange(1)}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${fontSizeLevel === 1 ? 'bg-white text-[#064E26] font-extrabold shadow-xs' : 'text-slate-200 hover:bg-emerald-800'}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center space-x-1.5 bg-[#064E26] hover:bg-[#0D5204] text-white px-2.5 py-0.5 rounded-[2px] border border-emerald-600 transition-colors font-sans text-xs font-bold cursor-pointer shadow-xs"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Official Masthead: State Emblem + ICG Insignia + Department Titles */}
      <div className="bg-gradient-to-r from-[#032B13] via-[#0D5204] to-[#032B13] px-4 py-2.5 flex items-center justify-between border-t border-emerald-800/40">
        {/* Left: Official State Emblem & Department Titles */}
        <div className="flex items-center space-x-4">
          {/* Ashoka Lion Capital Emblem */}
          <div className="flex-shrink-0 p-1 bg-white/10 rounded-[3px] border border-[#D4AF37]/50 shadow-sm">
            <StateEmblemIndia size="md" variant="gold" />
          </div>

          {/* Departmental Titles */}
          <div className="leading-tight">
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-extrabold text-base tracking-wide text-white flex items-center space-x-2">
                <span className="text-[#FFD700]">भारतीय तटरक्षक</span>
                <span className="text-[#FF9933]">|</span>
                <span className="font-classic font-bold tracking-widest text-white text-sm">INDIAN COAST GUARD</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-[2px] bg-white/20 text-[#DCFCE7] border border-white/40 font-mono font-bold tracking-wider">
                SIH 260143
              </span>
            </div>

            <p className="text-[12.5px] font-semibold text-white mt-1 tracking-tight flex items-center space-x-1.5">
              <span className="text-[#FFD700] font-serif font-bold text-[13px]">राष्ट्रीय समुद्री तेल रिसाव निगरानी एवं पोत दायित्व प्रणाली</span>
              <span className="text-emerald-300 hidden md:inline">•</span>
              <span className="text-emerald-100 font-sans font-medium hidden md:inline text-xs">HACKX Maritime Intelligence Workstation</span>
            </p>

            <p className="text-[10.5px] text-emerald-200 font-mono tracking-normal mt-0.5">
              मुख्यालय तटरक्षक क्षेत्र (पश्चिम), मुंबई // Maritime Rescue Coordination Centre (MRCC)
            </p>
          </div>
        </div>

        {/* Right: Indian Coast Guard Insignia & Live Operational Dual Clocks */}
        <div className="flex items-center space-x-3">
          {/* Dual Time Display (IST + UTC) */}
          <div className="hidden sm:flex flex-col items-end text-right font-mono bg-[#02210F] border border-emerald-600/60 px-3.5 py-1.5 rounded-[2px] shadow-inner">
            <div className="flex items-center space-x-2 text-xs text-[#FFD700] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="tabular-nums tracking-wide">{istTime || '19 Sept 2026, 02:36:51 IST'}</span>
            </div>
            <div className="text-[10px] text-emerald-300 tracking-wider font-semibold">
              {utcTime || '21:04:51 UTC'}
            </div>
          </div>

          {/* Official Indian Coast Guard Crest */}
          <div className="flex-shrink-0 p-1 bg-white/10 rounded border border-amber-500/40">
            <IndianCoastGuardInsignia size="sm" variant="color" />
          </div>
        </div>
      </div>
    </div>
  );
};
