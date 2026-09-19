import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Compass, AlertTriangle, FileText, Database } from 'lucide-react';
import { SystemHealth } from '../../types';

interface HeaderProps {
  health?: SystemHealth;
  activeSpillCount: number;
  currentView: 'dashboard' | 'investigations';
  onViewChange: (view: 'dashboard' | 'investigations') => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeSpillCount,
  currentView,
  onViewChange,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-bridge-900 tactical-border-b px-4 flex items-center justify-between text-xs select-none">
      {/* Left: Project Branding & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-bridge-850 border border-bridge-700 flex items-center justify-center text-tactical-cyan">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wider text-bridge-100 uppercase">HACKX</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bridge-800 text-tactical-cyan border border-bridge-700 font-mono">
                SIH 260143
              </span>
            </div>
            <p className="text-[10px] text-bridge-400 font-mono tracking-tight">
              MARITIME OIL SPILL INTELLIGENCE & ATTRIBUTION
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-bridge-700 hidden md:block" />

        {/* Agency Tag */}
        <div className="hidden lg:flex items-center space-x-2 text-bridge-300">
          <Compass className="w-3.5 h-3.5 text-tactical-amber" />
          <span className="font-mono text-[11px]">COAST GUARD WORKSTATION // ARABIAN SEA OP-ZONE</span>
        </div>
      </div>

      {/* Center: Live Telemetry Status */}
      <div className="hidden xl:flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-tactical-emerald radar-live" />
          <span className="text-bridge-300 font-mono">SAR INGESTION: ACTIVE</span>
        </div>
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-tactical-cyan" />
          <span className="text-bridge-300 font-mono">AIS STREAM: CONNECTED</span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-tactical-red" />
          <span className="text-tactical-red font-mono font-medium">
            ACTIVE SPILLS: {activeSpillCount}
          </span>
        </div>
      </div>

      {/* Right: Clock & Navigation Tabs */}
      <div className="flex items-center space-x-4">
        {/* Navigation buttons */}
        <div className="flex bg-bridge-950 p-0.5 rounded border border-bridge-700">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-bridge-800 text-tactical-cyan shadow-sm'
                : 'text-bridge-400 hover:text-bridge-200'
            }`}
          >
            Tactical Map
          </button>
          <button
            onClick={() => onViewChange('investigations')}
            className={`px-3 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
              currentView === 'investigations'
                ? 'bg-bridge-800 text-tactical-cyan shadow-sm'
                : 'text-bridge-400 hover:text-bridge-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Dossiers</span>
          </button>
        </div>

        {/* UTC Clock */}
        <div className="font-mono text-bridge-300 bg-bridge-950 px-2.5 py-1 rounded border border-bridge-700 text-[11px] min-w-[170px] text-right">
          {utcTime || 'UTC --:--:--'}
        </div>
      </div>
    </header>
  );
};
