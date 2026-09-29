import React, { useState, useEffect } from 'react';
import { StateEmblemIndia } from './StateEmblemIndia';
import { IndianCoastGuardInsignia } from './IndianCoastGuardInsignia';
import { TricolorRibbon } from './TricolorRibbon';
import { Clock, Shield, Globe, Eye, ChevronRight, LogIn, LogOut, UserCheck, ChevronDown, Database } from 'lucide-react';
import { AuthUser } from '../../api/auth';

interface GovMastheadProps {
  fontSizeLevel?: number; // -1, 0, 1
  onFontSizeChange?: (level: number) => void;
  lang?: 'en' | 'hi';
  onToggleLang?: () => void;
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  className?: string;
}

export const GovMasthead: React.FC<GovMastheadProps> = ({
  fontSizeLevel = 0,
  onFontSizeChange,
  lang = 'en',
  onToggleLang,
  currentUser = null,
  onOpenLogin,
  onLogout,
  className = '',
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

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
    <div className={`w-full bg-white select-none border-b border-slate-200 shadow-2xs ${className}`}>
      {/* Sleek Minimal Indian Coast Guard Masthead (English Only, Minimalist Logo) */}
      <div className="bg-white px-4 py-1.5 flex items-center justify-between h-11">
        {/* Left: Minimal Logo & Streamlined Title */}
        <div className="flex items-center space-x-3">
          {/* Minimal State Emblem */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <StateEmblemIndia size="xs" variant="gold" />
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Minimal Clean Heading */}
          <div className="flex items-center space-x-2">
            <span className="font-classic font-bold tracking-wider text-slate-900 text-xs sm:text-sm">
              INDIAN COAST GUARD
            </span>
            <span className="text-slate-300 font-sans hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-sky-800 hidden sm:inline">
              HackX Maritime Intelligence
            </span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono font-medium hidden md:inline border border-slate-200">
              MRCC Mumbai
            </span>
          </div>
        </div>

        {/* Right: Minimal Live Clock & Compact Account Action */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Minimal Clock */}
          <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">{istTime || '29 Sept 2026, 20:48 IST'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[10px]">{utcTime || '15:18 UTC'}</span>
          </div>

          {/* Minimal ICG Crest */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center opacity-90">
            <IndianCoastGuardInsignia size="xs" variant="color" />
          </div>

          {/* User Auth Profile Chip / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer border border-slate-200"
              >
                <div className="w-4 h-4 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-[9px]">
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-semibold text-[11px] hidden md:inline truncate max-w-[90px]">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 z-50 text-slate-800 text-xs space-y-2">
                  <div className="border-b border-slate-100 pb-1.5">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{currentUser.role}</div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onLogout) onLogout();
                      }}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-[11px] font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer shadow-xs transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

