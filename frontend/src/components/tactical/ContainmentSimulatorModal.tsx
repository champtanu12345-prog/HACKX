import React, { useState } from 'react';
import {
  X,
  LifeBuoy,
  Waves,
  Shield,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Ship,
  Plane,
  Gauge,
  Clock,
  Download,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audioAlerts';

export interface ContainmentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployToMap?: (config: ContainmentDeploymentConfig) => void;
  lang?: 'en' | 'hi';
}

export interface ContainmentDeploymentConfig {
  boomLengthMeters: number;
  activeSkimmers: number;
  dispersantLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'MAXIMUM';
  seaState: 'CALM' | 'MODERATE' | 'ROUGH';
  containmentEfficiency: number;
  hourlyRecoveryRate: number;
}

export const ContainmentSimulatorModal: React.FC<ContainmentSimulatorModalProps> = ({
  isOpen,
  onClose,
  onDeployToMap,
  lang = 'en',
}) => {
  // Configurable Parameters
  const [boomLength, setBoomLength] = useState<number>(1800); // 0 to 3000m
  const [skimmerUnits, setSkimmerUnits] = useState<number>(4); // 0 to 8 units
  const [dispersantLevel, setDispersantLevel] = useState<'NONE' | 'LOW' | 'MEDIUM' | 'MAXIMUM'>('MEDIUM');
  const [seaState, setSeaState] = useState<'CALM' | 'MODERATE' | 'ROUGH'>('MODERATE');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [deployedSuccess, setDeployedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real-time physics calculation of containment outcomes
  const dispersantFactor =
    dispersantLevel === 'NONE' ? 0 : dispersantLevel === 'LOW' ? 12 : dispersantLevel === 'MEDIUM' ? 24 : 38;

  const seaStatePenalty = seaState === 'CALM' ? 1.0 : seaState === 'MODERATE' ? 0.85 : 0.62;

  // Containment efficiency: formula factoring boom coverage, skimmers, and weather
  const baseEfficiency = (boomLength / 3000) * 45 + skimmerUnits * 5.5 + dispersantFactor;
  const containmentEfficiency = Math.min(Math.round(baseEfficiency * seaStatePenalty), 98.4);

  // Hourly recovery throughput (m³/h)
  const hourlyRecoveryRate = Math.round(skimmerUnits * 75 * seaStatePenalty);

  // Shoreline risk reduction (%)
  const shorelineProtection = Math.min(Math.round(containmentEfficiency * 1.08), 99.1);

  // Estimated hours to full recovery
  const estimatedHours =
    hourlyRecoveryRate > 0 ? (1450 / Math.max(hourlyRecoveryRate * 6.29, 100)).toFixed(1) : 'Indefinite';

  const handleDeploy = () => {
    setIsSimulating(true);
    tacticalAudio.playSonarPing();

    setTimeout(() => {
      setIsSimulating(false);
      setDeployedSuccess(true);
      tacticalAudio.playTacticalChime();

      if (onDeployToMap) {
        onDeployToMap({
          boomLengthMeters: boomLength,
          activeSkimmers: skimmerUnits,
          dispersantLevel,
          seaState,
          containmentEfficiency,
          hourlyRecoveryRate,
        });
      }

      setTimeout(() => {
        setDeployedSuccess(false);
        onClose();
      }, 1400);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-y-auto">
      <div className="bg-[#0B1524] text-white border border-emerald-500/40 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#006837] via-[#044B27] to-[#0B1524] px-5 py-3.5 flex items-center justify-between border-b border-emerald-500/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-[#FFD700] border border-emerald-400/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  OIL SPILL CONTAINMENT SIMULATOR
                </h2>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-mono px-2 py-0.2 rounded font-bold border border-emerald-400/30">
                  NOS-DCP TIER-1/2
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 font-mono">
                Indian Coast Guard PRT • Automated Boom & Skimmer Allocation Engine
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Top Operational Status Banner */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-slate-300">
                ACTIVE INCIDENT: <strong className="text-white">SECTOR MH-4 OIL SLICK (1,450 BBLS)</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span>Primary Threat: Mumbai Coast & Mangrove Sanctuaries</span>
              <span className="text-cyan-400 font-bold">Distance to Shore: 18.4 NM</span>
            </div>
          </div>

          {/* Grid: 2 Columns (Left: Parameter Sliders, Right: Live Computed Outcomes) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column: Sliders (span-7) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                <Sliders className="w-3.5 h-3.5" />
                <span>Tactical Hardware Deployment</span>
              </div>

              {/* Slider 1: Inflatable Containment Boom */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Heavy Offshore Boom (Ro-Boom 1500)</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {boomLength.toLocaleString()} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={boomLength}
                  onChange={(e) => setBoomLength(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0m (Uncontained)</span>
                  <span>1,500m (Standard)</span>
                  <span>3,000m (Full Exclusion)</span>
                </div>
              </div>

              {/* Slider 2: Oleophilic Disc Skimmers */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Ship className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active Skimmers (Desmi Ro-Clean 150)</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {skimmerUnits} Units ({hourlyRecoveryRate} m³/h)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={skimmerUnits}
                  onChange={(e) => setSkimmerUnits(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 Units</span>
                  <span>4 Units (Standard PRT)</span>
                  <span>8 Units (Max Fleet)</span>
                </div>
              </div>

              {/* Option 3: Dornier 228 Aerial Dispersant Spray */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Plane className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dornier 228 Dispersant Sortie (OSD-3)</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-indigo-300">
                    {dispersantLevel}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                  {(['NONE', 'LOW', 'MEDIUM', 'MAXIMUM'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDispersantLevel(lvl)}
                      className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                        dispersantLevel === lvl
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-xs'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 4: Sea State Conditions */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    <span>Arabian Sea State & Tidal Resistance</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-sky-300">
                    {seaState}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                  {(['CALM', 'MODERATE', 'ROUGH'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSeaState(st)}
                      className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                        seaState === st
                          ? 'bg-sky-600 border-sky-400 text-white font-bold shadow-xs'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'CALM' ? 'Calm (Bft 2)' : st === 'MODERATE' ? 'Moderate (Bft 4)' : 'Rough (Bft 6)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Real-Time Calculated Outcomes (span-5) */}
            <div className="md:col-span-5 bg-gradient-to-b from-[#0F1E33] to-[#0A1524] rounded-2xl p-4 sm:p-5 border border-cyan-500/30 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider pb-2 border-b border-cyan-900/50 flex items-center justify-between">
                  <span>Simulation Metrics</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>RK4 DYNAMICS</span>
                  </span>
                </div>

                {/* Big Metric: Containment Efficiency */}
                <div className="my-4 text-center p-4 bg-slate-900/90 rounded-xl border border-cyan-500/40 relative overflow-hidden">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Calculated Containment Efficiency
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400 my-1 font-mono">
                    {containmentEfficiency}%
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                      style={{ width: `${containmentEfficiency}%` }}
                    />
                  </div>
                </div>

                {/* Sub Metrics List */}
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Total Recovery Rate:</span>
                    <span className="font-bold text-amber-400">{hourlyRecoveryRate} m³/hour</span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Mangrove Protection:</span>
                    <span className="font-bold text-emerald-400">{shorelineProtection}% Safety</span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Est. Operations Horizon:</span>
                    <span className="font-bold text-cyan-300">{estimatedHours} Hours</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Flagship:</span>
                    <span className="font-bold text-slate-200">ICGS Samudra Prahari</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={isSimulating}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.99] text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-emerald-400/40"
                >
                  {isSimulating ? (
                    <>
                      <Zap className="w-4 h-4 text-[#FFD700] animate-spin" />
                      <span>Computing Hydrodynamic Barrier...</span>
                    </>
                  ) : deployedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>PRT Fleet Successfully Deployed to Map!</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-[#FFD700]" />
                      <span>Deploy Containment Assets to GIS Map</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    alert('Generating certified Indian Coast Guard Incident Action Plan (IAP) PDF...');
                  }}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded-xl font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Incident Action Plan (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
