import React from 'react';
import { AlertCircle, ChevronRight, ShieldAlert, Anchor } from 'lucide-react';
import { SuspectAttribution } from '../../types';

interface SuspectTableProps {
  suspects: SuspectAttribution[];
  selectedVessel?: SuspectAttribution;
  onSelectVessel: (vessel: SuspectAttribution) => void;
  onEscalate: (vessel: SuspectAttribution) => void;
}

export const SuspectTable: React.FC<SuspectTableProps> = ({
  suspects,
  selectedVessel,
  onSelectVessel,
  onEscalate,
}) => {
  return (
    <div className="flex flex-col h-full bg-bridge-900 border-t border-bridge-700 select-none">
      {/* Table Header */}
      <div className="h-9 px-3 bg-bridge-850 border-b border-bridge-700 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-tactical-amber" />
          <span className="font-mono font-bold tracking-wide text-bridge-100 uppercase">
            AIS Correlation & Suspect Attribution Leaderboard
          </span>
          <span className="px-1.5 py-0.2 rounded bg-bridge-800 text-[10px] font-mono text-bridge-400">
            {suspects.length} EVALUATED
          </span>
        </div>
        <div className="text-[10px] text-bridge-400 font-mono">
          RANKED BY WEIGHTED SUSPICION INDEX (WGS84 SPATIO-TEMPORAL PROXIMITY + AIS ANOMALIES)
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-[11px] font-mono">
          <thead>
            <tr className="bg-bridge-950/60 text-bridge-400 border-b border-bridge-800 uppercase text-[10px]">
              <th className="py-2 px-3 w-12 text-center">Rank</th>
              <th className="py-2 px-3">Vessel Identity</th>
              <th className="py-2 px-3">MMSI</th>
              <th className="py-2 px-3">Vessel Type</th>
              <th className="py-2 px-3">Flag</th>
              <th className="py-2 px-3">Min Dist</th>
              <th className="py-2 px-3">Detected Anomalies</th>
              <th className="py-2 px-3 text-center">Suspicion Score</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bridge-800/60">
            {suspects.map((vessel) => {
              const isSelected = selectedVessel?.mmsi === vessel.mmsi;
              const isPrimary = vessel.rank === 1;

              let scoreColor = 'text-tactical-emerald';
              let scoreBg = 'bg-emerald-950/40 border-emerald-800/60';
              if (vessel.composite_score >= 75) {
                scoreColor = 'text-tactical-red';
                scoreBg = 'bg-red-950/60 border-red-800/80';
              } else if (vessel.composite_score >= 40) {
                scoreColor = 'text-tactical-amber';
                scoreBg = 'bg-amber-950/40 border-amber-800/60';
              }

              return (
                <tr
                  key={vessel.mmsi}
                  onClick={() => onSelectVessel(vessel)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-bridge-800/80 border-l-2 border-tactical-cyan'
                      : 'hover:bg-bridge-850/50'
                  }`}
                >
                  <td className="py-2 px-3 text-center font-bold">
                    <span
                      className={`inline-block w-5 h-5 rounded leading-5 text-center text-[10px] ${
                        isPrimary
                          ? 'bg-red-900/60 text-tactical-red border border-red-700'
                          : 'bg-bridge-800 text-bridge-300'
                      }`}
                    >
                      #{vessel.rank}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-bridge-100 flex items-center space-x-1.5">
                    <Anchor className="w-3 h-3 text-bridge-400" />
                    <span>{vessel.name}</span>
                  </td>
                  <td className="py-2 px-3 text-bridge-300">{vessel.mmsi}</td>
                  <td className="py-2 px-3 text-bridge-300">{vessel.vessel_type}</td>
                  <td className="py-2 px-3 text-bridge-300">{vessel.flag_country}</td>
                  <td className="py-2 px-3 text-bridge-300">
                    {vessel.min_distance_nm !== undefined ? `${vessel.min_distance_nm} nm` : '--'}
                  </td>
                  <td className="py-2 px-3">
                    {vessel.anomalies && vessel.anomalies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {vessel.anomalies.map((anom, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] bg-red-950/70 border border-red-800 text-tactical-red"
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>{anom.anomaly_type.replace(/_/g, ' ')}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-bridge-500 text-[10px]">No anomalous events</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${scoreColor} ${scoreBg}`}
                    >
                      {vessel.composite_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEscalate(vessel);
                      }}
                      className="px-2 py-1 rounded bg-bridge-800 hover:bg-bridge-700 text-tactical-cyan border border-bridge-600 text-[10px] transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
