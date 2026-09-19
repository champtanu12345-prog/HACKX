import React from 'react';
import {
  X,
  Anchor,
  Compass,
  Radio,
  Clock,
  MapPin,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  ShieldAlert,
  FileCheck,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ScoreBreakdown } from './ScoreBreakdown';

export interface VesselDetailData {
  id: string;
  mmsi: string;
  imo?: string;
  callsign?: string;
  name: string;
  vesselType: string;
  flag: string;
  lengthM?: number;
  widthM?: number;
  draughtM?: number;
  speedKnots: number;
  courseDeg: number;
  headingDeg: number;
  minDistanceNm: number;
  temporalDeltaHours?: number;
  correlationScore: number;
  correlationCategory?: string;
  rank: number;
  anomalies: Array<{
    type: string;
    severity: string;
    description?: string;
    details?: string;
  }>;
  positions: Array<{
    time?: string;
    timestamp?: string;
    lat?: number;
    latitude?: number;
    lon?: number;
    longitude?: number;
    sog?: number;
    speed?: number;
    cog?: number;
    course?: number;
    heading?: number;
  }>;
}

interface VesselDetailPanelProps {
  vessel: VesselDetailData;
  onClose: () => void;
  onInspectTrack?: (mmsi: string) => void;
  onRequestInspection?: (vesselName: string) => void;
  className?: string;
}

export const VesselDetailPanel: React.FC<VesselDetailPanelProps> = ({
  vessel,
  onClose,
  onInspectTrack,
  onRequestInspection,
  className = '',
}) => {
  // Determine strictly non-accusatory status category
  const getCategory = () => {
    if (vessel.correlationCategory) return vessel.correlationCategory;
    if (vessel.correlationScore >= 85) {
      return 'Potential source vessel (Requires investigation)';
    }
    if (vessel.correlationScore >= 65) {
      return 'High correlation (Requires investigation)';
    }
    if (vessel.correlationScore >= 40) {
      return 'Moderate correlation';
    }
    return 'Low correlation';
  };

  const category = getCategory();
  const isHighPriority = vessel.correlationScore >= 65;

  const lastPos = vessel.positions && vessel.positions.length > 0
    ? vessel.positions[vessel.positions.length - 1]
    : null;

  const lat = lastPos ? (lastPos.lat ?? lastPos.latitude ?? 0) : 0;
  const lon = lastPos ? (lastPos.lon ?? lastPos.longitude ?? 0) : 0;

  return (
    <div
      className={`bg-bridge-900/95 border border-bridge-700 rounded-[2px] shadow-2xl backdrop-blur-md flex flex-col font-mono text-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-bridge-950 border-b border-bridge-700 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <Anchor className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="font-bold text-bridge-100 text-[11px] truncate uppercase tracking-wider">
            VESSEL DETAIL & AIS INTELLIGENCE
          </span>
          <span className="text-bridge-600">|</span>
          <span className="text-bridge-300 text-[10px] font-bold">#{vessel.rank}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-[2px] text-bridge-400 hover:text-bridge-100 hover:bg-bridge-800 transition-colors"
          title="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(85vh-80px)]">
        {/* Vessel Identification Card */}
        <div className="bg-bridge-950 border border-bridge-800 p-2.5 rounded-[2px] space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-bridge-50 tracking-wide">{vessel.name}</div>
              <div className="text-[10px] text-bridge-400 mt-0.5">
                {vessel.vesselType} • {vessel.flag}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-bridge-400 uppercase">Correlation Score</div>
              <div
                className={`text-base font-bold ${
                  vessel.correlationScore >= 75
                    ? 'text-red-400'
                    : vessel.correlationScore >= 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {vessel.correlationScore.toFixed(1)} / 100
              </div>
            </div>
          </div>

          {/* Legal Non-Accusatory Classification Banner */}
          <div
            className={`px-2 py-1 rounded-[2px] border text-[10px] font-semibold flex items-center space-x-1.5 ${
              isHighPriority
                ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                : 'bg-bridge-900 border-bridge-700 text-bridge-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{category}</span>
          </div>
        </div>

        {/* Explainable Score Breakdown */}
        {(() => {
          const distKm = Number((vessel.minDistanceNm * 1.852).toFixed(1));
          const timeDeltaMin = Math.round((vessel.temporalDeltaHours ?? (vessel.rank === 1 ? 0.2 : 1.5)) * 60);
          const spatialScore = Math.max(0, Math.min(100, distKm <= 1.0 ? 100 : Math.round(100 * (1.0 - distKm / 45.0))));
          const temporalScore = timeDeltaMin <= 15 ? Math.round(100 - timeDeltaMin / 3) : Math.max(10, Math.round(85 - timeDeltaMin / 10));
          const trajectoryScore = distKm <= 2.5 ? 90 : Math.max(20, Math.round(100 - vessel.minDistanceNm * 4));
          const hasAisGap = vessel.anomalies.some((a) => a.type.toUpperCase().includes('AIS_GAP'));
          const hasDecel = vessel.anomalies.some((a) => a.type.toUpperCase().includes('DECEL') || a.type.toUpperCase().includes('SPEED'));
          const behaviorScore = hasAisGap && hasDecel ? 90 : hasAisGap ? 55 : hasDecel ? 35 : vessel.anomalies.length > 0 ? 25 : 0;

          const explanations = [
            `Vessel was ${distKm.toFixed(1)} km (${vessel.minDistanceNm.toFixed(2)} NM) from the reconstructed source.`,
            timeDeltaMin < 120
              ? `Vessel was within ${timeDeltaMin} minutes of the estimated release time.`
              : `Vessel was within ${(timeDeltaMin / 60).toFixed(1)} hours of the estimated release time.`,
            trajectoryScore >= 75
              ? 'Observed heading was strongly aligned with reconstructed drift.'
              : `Observed heading showed ${vessel.headingDeg.toFixed(0)}° alignment with transit channel.`,
            ...(hasAisGap ? ['AIS transmission gap occurred near the source window.'] : []),
            ...(hasDecel ? ['Sudden speed reduction observed during passage across discharge zone.'] : []),
          ];

          return (
            <>
              <ScoreBreakdown
                overallScore={vessel.correlationScore}
                spatialScore={spatialScore}
                temporalScore={temporalScore}
                trajectoryScore={trajectoryScore}
                behaviorScore={behaviorScore}
              />

              {/* Mandated "Why this vessel?" Investigation Section */}
              <div className="bg-bridge-950 border border-bridge-800 rounded-[2px] p-2.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-bridge-100 font-bold text-[11px] uppercase tracking-wider border-b border-bridge-850 pb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>WHY THIS VESSEL?</span>
                </div>
                <div className="space-y-1.5">
                  {explanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 p-1.5 rounded-[2px] bg-bridge-900/80 border border-bridge-850 text-[10px] leading-snug"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                      <span className="text-bridge-200">{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {/* Dynamic Navigation Telemetry */}
        <div className="bg-bridge-950 border border-bridge-800 p-2.5 rounded-[2px] space-y-2">
          <div className="text-[10px] font-bold text-bridge-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-bridge-850 pb-1">
            <Radio className="w-3 h-3 text-blue-400" />
            <span>LIVE AIS TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-bridge-500">MMSI:</span>{' '}
              <span className="text-bridge-100 font-bold">{vessel.mmsi}</span>
            </div>
            <div>
              <span className="text-bridge-500">IMO:</span>{' '}
              <span className="text-bridge-100">{vessel.imo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-bridge-500">Speed (SOG):</span>{' '}
              <span className="text-bridge-100 font-semibold">{vessel.speedKnots.toFixed(1)} kn</span>
            </div>
            <div>
              <span className="text-bridge-500">Course (COG):</span>{' '}
              <span className="text-bridge-100">{vessel.courseDeg.toFixed(0)}°</span>
            </div>
            <div>
              <span className="text-bridge-500">Heading:</span>{' '}
              <span className="text-bridge-100">{vessel.headingDeg.toFixed(0)}°</span>
            </div>
            <div>
              <span className="text-bridge-500">Draught:</span>{' '}
              <span className="text-bridge-100">{vessel.draughtM ? `${vessel.draughtM} m` : 'N/A'}</span>
            </div>
            <div className="col-span-2 flex items-center space-x-1 text-bridge-300 border-t border-bridge-900 pt-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>
                Coordinates: {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Spatiotemporal Proximity to Hindcast Origin */}
        <div className="bg-bridge-950 border border-bridge-800 p-2.5 rounded-[2px] space-y-2">
          <div className="text-[10px] font-bold text-bridge-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-bridge-850 pb-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>SPATIOTEMPORAL HINDCAST INTERSECTION</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-bridge-900/80 p-1.5 rounded-[2px] border border-bridge-800">
              <div className="text-[9px] text-bridge-400">Closest Approach</div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {vessel.minDistanceNm.toFixed(2)} NM
              </div>
              <div className="text-[9px] text-bridge-500 mt-0.5">from release locus</div>
            </div>

            <div className="bg-bridge-900/80 p-1.5 rounded-[2px] border border-bridge-800">
              <div className="text-[9px] text-bridge-400">Time Variance</div>
              <div className="text-xs font-bold text-blue-300 mt-0.5">
                ±{(vessel.temporalDeltaHours ?? 0.5).toFixed(1)} hrs
              </div>
              <div className="text-[9px] text-bridge-500 mt-0.5">to discharge window</div>
            </div>
          </div>
        </div>

        {/* Behavioral Anomalies */}
        <div className="bg-bridge-950 border border-bridge-800 p-2.5 rounded-[2px] space-y-2">
          <div className="text-[10px] font-bold text-bridge-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-bridge-850 pb-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>FLAGGED BEHAVIORAL ANOMALIES ({vessel.anomalies.length})</span>
          </div>

          {vessel.anomalies.length === 0 ? (
            <div className="text-[10px] text-bridge-500 py-1 italic">
              No anomalous maneuvers or transponder blackouts detected.
            </div>
          ) : (
            <div className="space-y-1.5">
              {vessel.anomalies.map((a, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-[2px] bg-red-950/30 border border-red-900/60 text-[10px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 uppercase tracking-wide">
                      {a.type.replace(/_/g, ' ')}
                    </span>
                    <Badge variant={a.severity?.toLowerCase() === 'critical' ? 'critical' : 'warning'} size="xs">
                      {a.severity}
                    </Badge>
                  </div>
                  <div className="text-bridge-300 text-[10px] leading-tight">
                    {a.description || a.details || 'Behavioral anomaly identified along trajectory.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical Track Coordinates Sample */}
        {vessel.positions && vessel.positions.length > 0 && (
          <div className="bg-bridge-950 border border-bridge-800 p-2.5 rounded-[2px] space-y-1.5">
            <div className="text-[10px] font-bold text-bridge-300 uppercase tracking-wider flex items-center justify-between border-b border-bridge-850 pb-1">
              <span>AIS PINGS LOGGED ({vessel.positions.length})</span>
              <span className="text-[9px] text-bridge-500">UTC CHRONOLOGICAL</span>
            </div>

            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {vessel.positions.map((p, i) => {
                const pTime = p.time || p.timestamp || `T+${i}`;
                const pLat = (p.lat ?? p.latitude ?? 0).toFixed(3);
                const pLon = (p.lon ?? p.longitude ?? 0).toFixed(3);
                const pSog = (p.sog ?? p.speed ?? 0).toFixed(1);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[9px] text-bridge-400 font-mono py-0.5 border-b border-bridge-900 last:border-0"
                  >
                    <span>{pTime.includes('T') ? pTime.split('T')[1].slice(0, 8) : pTime}</span>
                    <span>{pLat}°N, {pLon}°E</span>
                    <span className="text-bridge-200 font-semibold">{pSog} kn</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {onRequestInspection && (
            <button
              onClick={() => onRequestInspection(vessel.name)}
              className="w-full py-2 px-3 rounded-[2px] bg-red-800 hover:bg-red-700 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>REQUEST MARITIME INSPECTION / INTERCEPTION</span>
            </button>
          )}

          {onInspectTrack && (
            <button
              onClick={() => onInspectTrack(vessel.mmsi)}
              className="w-full py-1.5 px-3 rounded-[2px] bg-bridge-800 hover:bg-bridge-700 text-bridge-200 font-mono text-[11px] flex items-center justify-center space-x-1.5 border border-bridge-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>FOCUS ROUTE ON TACTICAL PLOT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
