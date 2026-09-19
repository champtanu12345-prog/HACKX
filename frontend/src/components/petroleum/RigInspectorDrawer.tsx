import React, { useState } from 'react';
import { ExtractionPlatform } from '../../data/petroleumAuthorityData';
import {
  X,
  Gauge,
  Activity,
  Flame,
  Shield,
  ShieldCheck,
  AlertOctagon,
  Sliders,
  Droplet,
  Wind,
  Layers,
  CheckCircle,
  FileCheck2,
  Lock
} from 'lucide-react';

interface RigInspectorDrawerProps {
  platform: ExtractionPlatform | null;
  onClose: () => void;
  onUpdateChoke?: (platformId: string, newChoke: number) => void;
}

export const RigInspectorDrawer: React.FC<RigInspectorDrawerProps> = ({
  platform,
  onClose,
  onUpdateChoke,
}) => {
  if (!platform) return null;

  const [chokeValue, setChokeValue] = useState<number>(platform.chokePositionPct);
  const [esdArmed, setEsdArmed] = useState<boolean>(false);
  const [esdTriggered, setEsdTriggered] = useState<boolean>(false);

  const handleChokeChange = (val: number) => {
    setChokeValue(val);
    onUpdateChoke?.(platform.id, val);
  };

  const handleTriggerESD = () => {
    if (!esdArmed) return;
    setEsdTriggered(true);
    setChokeValue(0);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0D1117] border-l border-[#C5A059]/40 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="bg-[#161B22] p-4 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider font-semibold">
              SCADA WELLHEAD INSPECTOR • {platform.code}
            </span>
            <h3 className="font-serif font-bold text-white text-base leading-snug">
              {platform.name}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded text-gray-400 hover:text-white bg-[#0D1117] border border-[#1F2937] hover:border-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Drawer Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
        {/* Health Score & Operating Basin */}
        <div className="bg-[#161B22] border border-[#1F2937] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 font-mono">OPERATIONAL BASIN</div>
            <div className="text-xs font-semibold text-white mt-0.5">{platform.basin}</div>
            <div className="text-[10px] text-[#C5A059] font-mono mt-0.5">{platform.operator}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 font-mono">HEALTH SCORE</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {platform.healthScore}%
            </div>
          </div>
        </div>

        {/* Live Gauges: Wellhead vs Casing Pressure */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#161B22] border border-[#1F2937] p-3 rounded">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-[#C5A059]" /> WELLHEAD PRESS.
              </span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#C5A059]">
              {platform.wellheadPressureBar}
              <span className="text-xs font-normal text-gray-400 ml-1">bar</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">
              Threshold: &lt; 250 bar
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#1F2937] p-3 rounded">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" /> CASING PRESS.
              </span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-blue-400">
              {platform.casingPressureBar}
              <span className="text-xs font-normal text-gray-400 ml-1">bar</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">
              Annulus Integrity: 100%
            </div>
          </div>
        </div>

        {/* Choke Valve Actuator Slider */}
        <div className="bg-[#161B22] border border-[#1F2937] p-3.5 rounded">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#C5A059]" />
              चोक वाल्व नियंत्रण / Choke Valve Position
            </span>
            <span className="font-mono text-sm font-bold text-[#C5A059] bg-[#0D1117] px-2 py-0.5 rounded border border-[#1F2937]">
              {chokeValue}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={chokeValue}
            onChange={(e) => handleChokeChange(Number(e.target.value))}
            className="w-full mt-3 accent-[#C5A059] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
            <span>0% (Closed)</span>
            <span>50% (Throttled)</span>
            <span>100% (Full Bore)</span>
          </div>
        </div>

        {/* Crude Hydrocarbon Composition */}
        <div className="bg-[#161B22] border border-[#1F2937] p-3.5 rounded">
          <div className="text-xs font-serif font-bold text-white mb-2 flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-emerald-400" />
            कच्चे तेल का विश्लेषण / Crude Chemical Assay
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0D1117] p-2 rounded border border-[#1F2937]">
              <div className="text-[10px] text-gray-400">API GRAVITY</div>
              <div className="font-bold text-white mt-0.5">{platform.apiGravity}° API</div>
              <div className="text-[9px] text-[#C5A059]">{platform.crudeGrade}</div>
            </div>

            <div className="bg-[#0D1117] p-2 rounded border border-[#1F2937]">
              <div className="text-[10px] text-gray-400">SULFUR CONTENT</div>
              <div className="font-bold text-white mt-0.5">{platform.sulfurContentPct}%</div>
              <div className="text-[9px] text-emerald-400">Sweet Grade</div>
            </div>

            <div className="bg-[#0D1117] p-2 rounded border border-[#1F2937]">
              <div className="text-[10px] text-gray-400">WATER CUT (BS&W)</div>
              <div className="font-bold text-white mt-0.5">{platform.waterCutPct}%</div>
              <div className="text-[9px] text-gray-400">Centrifuge Checked</div>
            </div>

            <div className="bg-[#0D1117] p-2 rounded border border-[#1F2937]">
              <div className="text-[10px] text-gray-400">GAS-OIL RATIO (GOR)</div>
              <div className="font-bold text-white mt-0.5">{platform.gasOilRatio} SCF/BBL</div>
              <div className="text-[9px] text-emerald-400">Associated Gas Capture</div>
            </div>
          </div>
        </div>

        {/* Blowout Preventer (BOP) Certification */}
        <div className="bg-[#161B22] border border-emerald-500/30 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-serif font-bold text-white">
                BOP Subsea Safety Certification
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
              PASSED
            </span>
          </div>
          <div className="text-[11px] font-mono text-gray-300 mt-2">
            Last Acoustic Test: {platform.lastBopTest}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Complies with OISD-GDN-169 Subsea Blowout Prevention Standards.
          </div>
        </div>

        {/* Emergency Shutdown (ESD) Section */}
        <div className="bg-red-950/30 border border-red-500/40 p-3.5 rounded">
          <div className="flex items-center gap-2 text-red-400 text-xs font-serif font-bold">
            <AlertOctagon className="w-4 h-4" />
            आपतकालीन शटडाउन / Emergency Shutdown (ESD)
          </div>
          <p className="text-[10px] text-gray-300 mt-1">
            Arming ESD will override manual choke and actuate subsurface safety valves (SSSV) within 1.2 seconds.
          </p>

          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esdArmed}
                onChange={(e) => setEsdArmed(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-xs font-mono text-gray-300">ARM ESD SYSTEM</span>
            </label>

            <button
              disabled={!esdArmed || esdTriggered}
              onClick={handleTriggerESD}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                esdTriggered
                  ? 'bg-red-600 text-white'
                  : esdArmed
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {esdTriggered ? 'ESD ACTIVATED' : 'TRIGGER ESD'}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="bg-[#161B22] p-3 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
        <span>SCADA Unit ID: {platform.code}</span>
        <button
          onClick={onClose}
          className="bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#C5A059] border border-[#C5A059]/40 px-3 py-1 rounded text-xs"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
