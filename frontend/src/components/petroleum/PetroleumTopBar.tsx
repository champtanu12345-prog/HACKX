import React, { useState, useEffect } from 'react';
import { StateEmblemIndia } from '../common/StateEmblemIndia';
import {
  Shield,
  Clock,
  Radio,
  Download,
  AlertTriangle,
  Globe2,
  RefreshCw,
  Flame,
  Layers
} from 'lucide-react';

interface PetroleumTopBarProps {
  selectedBasin: string;
  onSelectBasin: (basin: string) => void;
  onExportAuditReport: () => void;
  onTriggerEmergencyDrill?: () => void;
}

export const PetroleumTopBar: React.FC<PetroleumTopBarProps> = ({
  selectedBasin,
  onSelectBasin,
  onExportAuditReport,
  onTriggerEmergencyDrill
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toUTCString().replace('GMT', 'UTC')
      );
      setIstTime(
        now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="bg-[#0D1117] text-[#F8F9FA] border-b border-[#C5A059]/30 shadow-2xl relative z-30 select-none">
      {/* Top Gold & Tricolor Micro Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C5A059] via-[#FF9933] via-[#FFFFFF] via-[#138808] to-[#C5A059]" />

      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Official State Insignia & Authority Title */}
        <div className="flex items-center gap-3.5">
          <div className="p-1.5 bg-[#161B22] border border-[#C5A059]/40 rounded-sm shadow-md flex items-center justify-center">
            <StateEmblemIndia className="h-9 w-auto text-[#C5A059]" />
          </div>

          <div className="border-l border-[#1F2937] pl-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm md:text-base font-bold tracking-wide text-[#F8F9FA] font-['Playfair_Display']">
                भारत सरकार • MINISTRY OF PETROLEUM & NATURAL GAS
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] font-semibold tracking-wider">
                <Shield className="w-2.5 h-2.5" /> Level-V Secretariat
              </span>
            </div>
            <div className="text-[11px] text-[#C5A059] flex items-center gap-2 tracking-wide font-sans">
              <span className="font-medium">Directorate General of Hydrocarbons (DGH)</span>
              <span className="text-[#1F2937]">|</span>
              <span className="text-gray-400 font-mono text-[10px]">NAT-SCADA GRID OPS • SEC-156</span>
            </div>
          </div>
        </div>

        {/* Center: Basin Filter & Grid Status */}
        <div className="hidden xl:flex items-center gap-3 bg-[#161B22]/90 border border-[#C5A059]/20 px-3 py-1.5 rounded">
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Globe2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="font-serif text-xs text-[#C5A059]">बेसिन कार्यक्षेत्र / Basin:</span>
          </div>

          <select
            value={selectedBasin}
            onChange={(e) => onSelectBasin(e.target.value)}
            className="bg-[#0D1117] text-xs font-mono text-white border border-[#C5A059]/40 rounded px-2.5 py-1 focus:outline-none focus:border-[#C5A059] cursor-pointer"
          >
            <option value="ALL">All National Basins (राष्ट्रीय स्तर)</option>
            <option value="Western Offshore">Western Offshore (Mumbai High / Panna)</option>
            <option value="Eastern Deepwater">Eastern Deepwater (KG-D6 Basin)</option>
            <option value="Rajasthan Inland">Rajasthan Rift Basin (Barmer)</option>
            <option value="Upper Assam">Upper Assam Tertiary (Digboi)</option>
            <option value="Strategic SPM">Strategic SPM & Mega-Terminals</option>
          </select>

          <div className="h-4 w-px bg-[#1F2937]" />

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GRID SYNCHRONIZED</span>
          </div>
        </div>

        {/* Right: Telemetry Time, Export Ledger & Actions */}
        <div className="flex items-center gap-3">
          {/* Real-time clocks */}
          <div className="hidden sm:flex flex-col text-right font-mono text-[11px] leading-tight">
            <div className="text-gray-200 flex items-center justify-end gap-1.5">
              <Clock className="w-3 h-3 text-[#C5A059]" />
              <span>{istTime || 'Loading...'}</span>
            </div>
            <div className="text-[10px] text-gray-400">{currentTime || '00:00:00 UTC'}</div>
          </div>

          <div className="h-6 w-px bg-[#1F2937] hidden sm:block" />

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Force SCADA Poll"
            className="p-1.5 text-gray-400 hover:text-[#C5A059] bg-[#161B22] border border-[#1F2937] hover:border-[#C5A059]/40 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C5A059]' : ''}`} />
          </button>

          {/* Export Audit Dossier */}
          <button
            onClick={onExportAuditReport}
            className="flex items-center gap-1.5 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/50 hover:border-[#C5A059] px-3 py-1.5 rounded text-xs font-serif font-medium transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ऑडिट रिपोर्ट / Audit Ledger</span>
          </button>

          {/* Emergency Safety Protocol Button */}
          {onTriggerEmergencyDrill && (
            <button
              onClick={onTriggerEmergencyDrill}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded text-xs font-mono transition-all"
              title="Initiate OISD-156 Safety Response Protocol"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden lg:inline">OISD-156</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
