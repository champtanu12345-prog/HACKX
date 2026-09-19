import React from 'react';
import {
  X,
  ShieldAlert,
  Download,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  MapPin,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SuspectAttribution, SpillDetection } from '../../types';

interface VesselDossierProps {
  vessel: SuspectAttribution;
  spill?: SpillDetection;
  onClose: () => void;
  onEscalateToCoastGuard: (vessel: SuspectAttribution) => void;
}

export const VesselDossier: React.FC<VesselDossierProps> = ({
  vessel,
  spill,
  onClose,
  onEscalateToCoastGuard,
}) => {
  // Format speed chart data from recent positions
  const speedData = (vessel.recent_positions || []).map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sog: p.sog,
    status: p.nav_status,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-bridge-900 border-l border-bridge-700 shadow-2xl z-50 flex flex-col select-none text-xs">
      {/* Dossier Header */}
      <div className="h-12 px-4 bg-bridge-850 border-b border-bridge-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-tactical-red" />
          <span className="font-mono font-bold text-bridge-100 uppercase tracking-wider">
            VESSEL ATTRIBUTION DOSSIER
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            title="Export Evidence Dossier"
            className="p-1.5 rounded hover:bg-bridge-700 text-bridge-400 hover:text-bridge-200 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-bridge-700 text-bridge-400 hover:text-bridge-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dossier Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
        {/* Culprit Highlight Card */}
        <div className="bg-bridge-950 border border-bridge-700 p-3 rounded">
          <div className="flex items-center justify-between border-b border-bridge-800 pb-2 mb-2">
            <div>
              <div className="text-sm font-bold text-bridge-100">{vessel.name}</div>
              <div className="text-[11px] text-bridge-400">
                {vessel.vessel_type} • Flag: {vessel.flag_country}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-bridge-400 uppercase">Suspicion Index</div>
              <div
                className={`text-lg font-bold ${
                  vessel.composite_score >= 75 ? 'text-tactical-red' : 'text-tactical-amber'
                }`}
              >
                {vessel.composite_score.toFixed(1)} / 100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-bridge-500">MMSI:</span>{' '}
              <span className="text-bridge-200">{vessel.mmsi}</span>
            </div>
            <div>
              <span className="text-bridge-500">IMO:</span>{' '}
              <span className="text-bridge-200">{vessel.imo || '9384712'}</span>
            </div>
            <div>
              <span className="text-bridge-500">Min Distance to Origin:</span>{' '}
              <span className="text-tactical-amber">{vessel.min_distance_nm ?? 1.2} nm</span>
            </div>
            <div>
              <span className="text-bridge-500">Ranking:</span>{' '}
              <span className="text-bridge-200">#{vessel.rank} of candidate vessels</span>
            </div>
          </div>
        </div>

        {/* Suspicion Breakdown Scorecard */}
        <div className="bg-bridge-950 border border-bridge-700 p-3 rounded space-y-2">
          <div className="text-xs font-bold text-bridge-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-tactical-cyan" />
            <span>ATTRIBUTION FACTOR ANALYSIS</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-bridge-400 mb-0.5">
                <span>Spatiotemporal Proximity (35%)</span>
                <span className="text-bridge-200">{vessel.proximity_score.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-bridge-800 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-tactical-red h-full rounded"
                  style={{ width: `${vessel.proximity_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-bridge-400 mb-0.5">
                <span>Trajectory & Heading Alignment (20%)</span>
                <span className="text-bridge-200">{vessel.trajectory_alignment.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-bridge-800 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-tactical-amber h-full rounded"
                  style={{ width: `${vessel.trajectory_alignment}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-bridge-400 mb-0.5">
                <span>Abnormal Deceleration Score (20%)</span>
                <span className="text-bridge-200">{vessel.speed_anomaly_score.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-bridge-800 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-tactical-red h-full rounded"
                  style={{ width: `${vessel.speed_anomaly_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-bridge-400 mb-0.5">
                <span>AIS Transponder Blackout Penalty (25%)</span>
                <span className="text-bridge-200">{vessel.ais_gap_penalty.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-bridge-800 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-tactical-red h-full rounded"
                  style={{ width: `${vessel.ais_gap_penalty}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Speed Profile Chart */}
        <div className="bg-bridge-950 border border-bridge-700 p-3 rounded">
          <div className="text-xs font-bold text-bridge-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-tactical-amber" />
              <span>TRANSIT SPEED OVER GROUND (SOG)</span>
            </div>
            <span className="text-[10px] text-tactical-red">DECELERATION DETECTED</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#4d6b95" fontSize={9} />
                <YAxis stroke="#4d6b95" fontSize={9} domain={[0, 20]} unit=" kn" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b131e', borderColor: '#22354f', fontSize: 10 }}
                />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Discharge Threshold', fill: '#ef4444', fontSize: 8 }} />
                <Line
                  type="monotone"
                  dataKey="sog"
                  name="Speed (knots)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detected Anomalies List */}
        <div className="bg-bridge-950 border border-bridge-700 p-3 rounded space-y-2">
          <div className="text-xs font-bold text-tactical-red uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>FLAGGED BEHAVIORAL ANOMALIES ({vessel.anomalies.length})</span>
          </div>

          {vessel.anomalies.map((anom, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-red-950/30 border border-red-900/60 text-[11px] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-tactical-red">
                  {anom.anomaly_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-red-900/40 text-red-300">
                  {anom.severity}
                </span>
              </div>
              <p className="text-bridge-300 text-[10px]">{anom.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dossier Footer Action Bar */}
      <div className="p-3 bg-bridge-850 border-t border-bridge-700 flex items-center justify-between">
        <div className="text-[10px] text-bridge-400 font-mono">
          EVIDENCE HASH: SHA256-VLD84
        </div>
        <button
          onClick={() => onEscalateToCoastGuard(vessel)}
          className="px-3 py-1.5 rounded bg-tactical-red hover:bg-red-600 text-white font-mono font-bold text-xs flex items-center space-x-1.5 transition-colors shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ESCALATE TO COAST GUARD</span>
        </button>
      </div>
    </div>
  );
};
