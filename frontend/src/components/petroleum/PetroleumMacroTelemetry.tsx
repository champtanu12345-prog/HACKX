import React from 'react';
import {
  Flame,
  Database,
  Gauge,
  Activity,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { MACRO_TELEMETRY_STATS } from '../../data/petroleumAuthorityData';

interface PetroleumMacroTelemetryProps {
  stats?: typeof MACRO_TELEMETRY_STATS;
}

export const PetroleumMacroTelemetry: React.FC<PetroleumMacroTelemetryProps> = ({
  stats = MACRO_TELEMETRY_STATS,
}) => {
  const yieldPct = ((stats.nationalExtractionBblPerDay / stats.targetQuotaBblPerDay) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-[#0D1117]/80 border-b border-[#1F2937]">
      {/* 1. National Extraction Throughput */}
      <div className="group relative bg-[#161B22] border border-[#1F2937] hover:border-[#C5A059]/60 rounded-sm p-3.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-serif uppercase tracking-wider text-[#C5A059] font-medium">
                दैनिक निष्कर्षण / Extraction Volume
              </div>
              <div className="text-[10px] text-gray-400 font-mono">Gross SCADA Direct Feed</div>
            </div>
          </div>
          <span className="flex items-center gap-0.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            <ArrowUpRight className="w-3 h-3" /> +4.2%
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold text-[#F8F9FA] tracking-tight">
            {stats.nationalExtractionBblPerDay.toLocaleString()}
            <span className="ml-1.5 text-xs font-normal text-gray-400 font-sans">BBL/Day</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Target Quota: {stats.targetQuotaBblPerDay.toLocaleString()} BBL</span>
          <span className="text-amber-400 font-medium">Yield: {yieldPct}%</span>
        </div>
      </div>

      {/* 2. Strategic Petroleum Reserves (ISPRL) */}
      <div className="group relative bg-[#161B22] border border-[#1F2937] hover:border-[#C5A059]/60 rounded-sm p-3.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-serif uppercase tracking-wider text-[#C5A059] font-medium">
                सामरिक रिज़र्व / Strategic Reserves
              </div>
              <div className="text-[10px] text-gray-400 font-mono">ISPRL Underground Caverns</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded border border-[#C5A059]/30">
            90-DAY BUFFER
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold text-[#F8F9FA] tracking-tight">
            {stats.strategicReservePct}%
            <span className="ml-1.5 text-xs font-normal text-gray-400 font-sans">
              ({stats.strategicReserveBblMillions}M BBL)
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-2 pt-2 border-t border-[#1F2937] flex flex-col gap-1">
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5A059] to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.strategicReservePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400">
            <span>Padur / Mangalore / Vizag</span>
            <span className="text-emerald-400">OPTIMAL FILL</span>
          </div>
        </div>
      </div>

      {/* 3. National Grid Pipeline Pressure */}
      <div className="group relative bg-[#161B22] border border-[#1F2937] hover:border-[#C5A059]/60 rounded-sm p-3.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-serif uppercase tracking-wider text-[#C5A059] font-medium">
                ग्रिड दबाव / Pipeline Pressure
              </div>
              <div className="text-[10px] text-gray-400 font-mono">14,280 km Active Network</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            NOMINAL
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold text-[#F8F9FA] tracking-tight">
            {stats.nationalGridPressureAvgBar}
            <span className="ml-1.5 text-xs font-normal text-gray-400 font-sans">bar avg</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-gray-300">
              Ref: {stats.nationalGridPressureTargetBar} bar
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Active Lines: 4 Trunklines</span>
          <span className="text-emerald-400">Δ +2.2 bar stable</span>
        </div>
      </div>

      {/* 4. Regulatory & Environmental Compliance */}
      <div className="group relative bg-[#161B22] border border-[#1F2937] hover:border-[#C5A059]/60 rounded-sm p-3.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-serif uppercase tracking-wider text-[#C5A059] font-medium">
                पर्यावरण अनुपालन / Zero-Flaring
              </div>
              <div className="text-[10px] text-gray-400 font-mono">OISD / MARPOL Annex VI</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            PASS (SHA-256)
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold text-emerald-400 tracking-tight">
            {stats.zeroFlaringCompliancePct}%
            <span className="ml-1.5 text-xs font-normal text-gray-400 font-sans">Re-injected</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-gray-300">
              CI: {stats.carbonIntensityKgPerBbl} kg/bbl
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Brent Ref: ${stats.crudePriceReferenceUsd}</span>
          <span className="text-emerald-400">+{stats.brentCrudeDeltaPct}%</span>
        </div>
      </div>
    </div>
  );
};
