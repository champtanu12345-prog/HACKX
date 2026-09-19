import React from 'react';
import { AlertTriangle, Play, CheckCircle2, Clock, Globe, BarChart2 } from 'lucide-react';
import { SpillDetection, DriftRun } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';

interface SpillSidebarProps {
  spills: SpillDetection[];
  selectedSpill?: SpillDetection;
  onSelectSpill: (spill: SpillDetection) => void;
  activeDrift?: DriftRun;
  onTriggerDrift: () => void;
  isDriftRunning: boolean;
}

export const SpillSidebar: React.FC<SpillSidebarProps> = ({
  spills,
  selectedSpill,
  onSelectSpill,
  activeDrift,
  onTriggerDrift,
  isDriftRunning,
}) => {
  return (
    <aside className="w-80 bg-bridge-900 tactical-border-r flex flex-col h-full select-none text-xs">
      {/* Sidebar Header */}
      <div className="h-10 px-3 bg-bridge-850 border-b border-bridge-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-tactical-red" />
          <span className="font-mono font-bold tracking-wider text-bridge-200 uppercase">
            DETECTED OIL SLICKS
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-bridge-800 text-[10px] font-mono text-tactical-cyan">
          {spills.length} ACTIVE
        </span>
      </div>

      {/* Spills List Selector */}
      <div className="max-h-48 overflow-y-auto border-b border-bridge-700 divide-y divide-bridge-800">
        {spills.map((spill) => {
          const isSelected = selectedSpill?.id === spill.id;
          return (
            <div
              key={spill.id}
              onClick={() => onSelectSpill(spill)}
              className={`p-2.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-bridge-800 border-l-2 border-tactical-red'
                  : 'hover:bg-bridge-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-semibold text-bridge-100 text-[11px] truncate">
                  {spill.region_name}
                </span>
                <StatusBadge
                  status={spill.confidence_score >= 0.85 ? 'HIGH' : 'MEDIUM'}
                  type="severity"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-bridge-400">
                <span>AREA: {spill.area_sqkm} km²</span>
                <span>CONF: {(spill.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[9px] font-mono text-bridge-500 mt-0.5">
                {new Date(spill.detection_time).toUTCString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Slick Operational Telemetry */}
      {selectedSpill && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-bridge-800 pb-1.5">
            <span className="text-[11px] font-bold text-tactical-cyan uppercase flex items-center space-x-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>SLICK TELEMETRY METRICS</span>
            </span>
            <span className="text-[10px] text-bridge-500">{selectedSpill.id.slice(0, 8)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Slick Area"
              value={selectedSpill.area_sqkm}
              unit="km²"
              variant="red"
            />
            <MetricCard
              label="Perimeter"
              value={selectedSpill.perimeter_km}
              unit="km"
              variant="default"
            />
            <MetricCard
              label="Est. Volume"
              value={selectedSpill.estimated_volume_m3 || 420}
              unit="m³"
              variant="amber"
            />
            <MetricCard
              label="Slick Age"
              value={selectedSpill.estimated_age_hours}
              unit="hrs"
              variant="cyan"
            />
          </div>

          {/* Centroid Coordinates */}
          <div className="p-2 rounded bg-bridge-950 border border-bridge-800 text-[10px] space-y-1">
            <div className="text-bridge-400 flex items-center justify-between">
              <span>CENTROID WGS84:</span>
              <span className="text-bridge-200">
                {selectedSpill.centroid_lat.toFixed(4)}°N, {selectedSpill.centroid_lon.toFixed(4)}°E
              </span>
            </div>
            <div className="text-bridge-400 flex items-center justify-between">
              <span>SATELLITE SENSOR:</span>
              <span className="text-tactical-cyan">Sentinel-1 C-SAR IW</span>
            </div>
          </div>

          {/* Lagrangian Drift Simulation Controls */}
          <div className="p-2.5 rounded bg-bridge-950 border border-bridge-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-bridge-300 uppercase">
                LAGRANGIAN HINDCAST ENGINE
              </span>
              {activeDrift && (
                <span className="text-[9px] text-tactical-emerald flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SIMULATED</span>
                </span>
              )}
            </div>

            <p className="text-[10px] text-bridge-400 leading-tight">
              Reverse-traces slick dispersion back 14-24h using NOAA GFS 10m wind and CMEMS current vectors.
            </p>

            {activeDrift && activeDrift.estimated_origin_lat && (
              <div className="p-1.5 rounded bg-bridge-900 border border-bridge-700 text-[10px] text-tactical-cyan">
                <div>EST. DUMP ORIGIN:</div>
                <div className="font-bold">
                  {activeDrift.estimated_origin_lat.toFixed(4)}°N, {activeDrift.estimated_origin_lon?.toFixed(4)}°E
                </div>
              </div>
            )}

            <button
              onClick={onTriggerDrift}
              disabled={isDriftRunning}
              className="w-full py-1.5 px-2.5 rounded bg-tactical-cyan hover:bg-cyan-600 disabled:opacity-50 text-bridge-950 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDriftRunning ? 'RUNNING INTEGRATOR...' : 'EXECUTE DRIFT HINDCAST'}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
