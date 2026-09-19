import React, { useState } from 'react';
import { PipelineRoute, PIPELINE_ROUTES } from '../../data/petroleumAuthorityData';
import {
  Activity,
  Gauge,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle
} from 'lucide-react';

interface PipelineDiagnosticsPanelProps {
  pipelines?: PipelineRoute[];
  onSelectPipeline?: (pipeline: PipelineRoute) => void;
}

export const PipelineDiagnosticsPanel: React.FC<PipelineDiagnosticsPanelProps> = ({
  pipelines = PIPELINE_ROUTES,
  onSelectPipeline,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');
  const [selectedPipeId, setSelectedPipeId] = useState<string>(pipelines[0]?.id || '');

  const filteredPipelines = pipelines.filter((pipe) => {
    if (filterMode === 'CRITICAL') return pipe.status === 'ELEVATED_PRESSURE' || pipe.status === 'CAUTION';
    if (filterMode === 'NORMAL') return pipe.status === 'NORMAL';
    return true;
  });

  return (
    <div className="bg-[#0D1117] border border-[#C5A059]/30 rounded-sm shadow-xl flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="bg-[#161B22] px-4 py-2.5 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C5A059]" />
          <h3 className="font-serif font-bold text-white text-xs tracking-wider uppercase font-['Playfair_Display']">
            पाइपलाइन प्रवाह एवं दबाव निदान / Flow & Pipeline Diagnostics
          </h3>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-[#0D1117] p-0.5 rounded border border-[#1F2937] text-[10px] font-mono">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2 py-0.5 rounded transition-all ${
              filterMode === 'ALL'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ALL ({pipelines.length})
          </button>
          <button
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-2 py-0.5 rounded transition-all ${
              filterMode === 'CRITICAL'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ALERTS
          </button>
        </div>
      </div>

      {/* Pipeline Diagnostic Cards Feed */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-gray-800">
        {filteredPipelines.map((pipe) => {
          const isElevated = pipe.status === 'ELEVATED_PRESSURE' || pipe.status === 'CAUTION';
          const pressurePct = (pipe.operatingPressureBar / pipe.maxPressureBar) * 100;

          return (
            <div
              key={pipe.id}
              onClick={() => {
                setSelectedPipeId(pipe.id);
                onSelectPipeline?.(pipe);
              }}
              className={`p-3 rounded bg-[#161B22]/90 border transition-all cursor-pointer hover:border-[#C5A059] ${
                selectedPipeId === pipe.id
                  ? 'border-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.15)] ring-1 ring-[#C5A059]/40'
                  : 'border-[#1F2937]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-white text-xs">
                      {pipe.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.2 rounded border border-[#C5A059]/30">
                      {pipe.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-sans mt-0.5">
                    <span>{pipe.fromNode}</span>
                    <ArrowRight className="w-3 h-3 text-[#C5A059]" />
                    <span>{pipe.toNode}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    isElevated
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {pipe.status}
                </span>
              </div>

              {/* Real-time Telemetry Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-[#1F2937]/80 text-[11px] font-mono">
                {/* Flow Rate */}
                <div className="bg-[#0D1117] p-1.5 rounded border border-[#1F2937]">
                  <div className="text-[9px] text-gray-400 flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-[#C5A059]" /> FLOW RATE
                  </div>
                  <div className="font-bold text-white mt-0.5">
                    {pipe.flowRateM3h.toLocaleString()}{' '}
                    <span className="text-[9px] text-gray-400 font-normal">m³/h</span>
                  </div>
                </div>

                {/* Operating Pressure */}
                <div className="bg-[#0D1117] p-1.5 rounded border border-[#1F2937]">
                  <div className="text-[9px] text-gray-400 flex items-center gap-1">
                    <Gauge className="w-2.5 h-2.5 text-blue-400" /> PRESSURE
                  </div>
                  <div className={`font-bold mt-0.5 ${isElevated ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {pipe.operatingPressureBar}{' '}
                    <span className="text-[9px] text-gray-400 font-normal">bar</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-[#0D1117] p-1.5 rounded border border-[#1F2937]">
                  <div className="text-[9px] text-gray-400 flex items-center gap-1">
                    <Thermometer className="w-2.5 h-2.5 text-amber-400" /> TEMP
                  </div>
                  <div className="font-bold text-gray-200 mt-0.5">
                    {pipe.temperatureC}°C
                  </div>
                </div>

                {/* Leak Detection Integrity */}
                <div className="bg-[#0D1117] p-1.5 rounded border border-[#1F2937]">
                  <div className="text-[9px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> INTEGRITY
                  </div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {pipe.leakDetectionIndex}%
                  </div>
                </div>
              </div>

              {/* Pressure Bar & Threshold Gauge */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>Trunkline Pressure Capacity ({pressurePct.toFixed(0)}%)</span>
                  <span>Max: {pipe.maxPressureBar} bar</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      pressurePct > 85
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-emerald-500 to-[#C5A059]'
                    }`}
                    style={{ width: `${pressurePct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Footer */}
      <div className="bg-[#111620] px-4 py-2 border-t border-[#1F2937] text-[10px] font-mono text-gray-400 flex items-center justify-between">
        <span>OISD Standard 141 Certified</span>
        <span className="text-[#C5A059] flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" /> Acoustic Leak SCADA: ACTIVE
        </span>
      </div>
    </div>
  );
};
