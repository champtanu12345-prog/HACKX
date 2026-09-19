import React, { useState } from 'react';
import { Ship, Anchor, AlertTriangle, Radio, Compass, Clock, MapPin, HelpCircle, FileText } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Metric } from '../components/common/Metric';
import { Badge } from '../components/common/Badge';
import { DataTable, Column } from '../components/common/DataTable';
import { MaritimeScenario } from '../data/maritimeDemoData';
import { EvidencePanel } from '../components/vessels/EvidencePanel';

interface AttributionViewProps {
  scenario: MaritimeScenario;
  selectedVesselId?: string;
  onSelectVessel?: (vesselId: string) => void;
}

export const AttributionView: React.FC<AttributionViewProps> = ({
  scenario,
  selectedVesselId,
  onSelectVessel,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedVesselId || scenario.vessels[0]?.id || ''
  );

  const activeVesselId = selectedVesselId || internalSelectedId;
  const selectedVessel =
    scenario.vessels.find((v) => v.id === activeVesselId) || scenario.vessels[0];

  const handleSelect = (vId: string) => {
    setInternalSelectedId(vId);
    if (onSelectVessel) onSelectVessel(vId);
  };

  // Columns strictly matching user specification:
  // Rank, Vessel, MMSI, Distance, Time Difference, Trajectory Match, AIS Gap, Behavior, Correlation Score
  const columns: Column<(typeof scenario.vessels)[0]>[] = [
    {
      key: 'rank',
      header: 'Rank',
      width: '6%',
      align: 'center',
      render: (r) => (
        <span
          className={`inline-block px-1.5 py-0.5 rounded-[2px] font-mono font-bold text-[10px] ${
            r.rank === 1
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-gray-100 text-charcoal-700'
          }`}
        >
          #{r.rank}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Vessel',
      width: '18%',
      render: (r) => (
        <div>
          <div className="font-bold text-charcoal-900 flex items-center space-x-1.5 truncate">
            <Ship className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
            <span className="truncate">{r.name}</span>
          </div>
          <div className="text-[10px] text-charcoal-500 mt-0.5 truncate">
            {r.vesselType} • {r.flag}
          </div>
        </div>
      ),
    },
    {
      key: 'mmsi',
      header: 'MMSI',
      width: '11%',
      render: (r) => <span className="text-charcoal-700 font-mono text-[11px] font-medium">{r.mmsi}</span>,
    },
    {
      key: 'distance',
      header: 'Distance',
      width: '13%',
      render: (r) => {
        const distKm = (r.minDistanceNm * 1.852).toFixed(1);
        return (
          <div className="font-mono">
            <span className="font-bold text-charcoal-900">{distKm} km</span>
            <span className="text-charcoal-500 text-[10px] ml-1">({r.minDistanceNm} NM)</span>
          </div>
        );
      },
    },
    {
      key: 'timeDifference',
      header: 'Time Difference',
      width: '12%',
      render: (r) => {
        const timeDeltaMin = Math.round((r.rank === 1 ? 0.2 : r.rank === 2 ? 1.4 : 3.8) * 60);
        return (
          <span className="text-charcoal-800 font-mono font-medium">
            ±{timeDeltaMin < 60 ? `${timeDeltaMin} min` : `${(timeDeltaMin / 60).toFixed(1)} hrs`}
          </span>
        );
      },
    },
    {
      key: 'trajectoryMatch',
      header: 'Trajectory Match',
      width: '13%',
      render: (r) => {
        const distKm = r.minDistanceNm * 1.852;
        const trajMatch = distKm <= 2.5 ? 92 : Math.max(20, Math.round(100 - r.minDistanceNm * 4));
        return (
          <div className="flex items-center space-x-1.5">
            <div className="w-12 bg-gray-200 h-1.5 rounded-xs overflow-hidden">
              <div
                style={{ width: `${trajMatch}%` }}
                className={`h-full ${trajMatch >= 80 ? 'bg-emerald-600' : 'bg-emerald-400'}`}
              />
            </div>
            <span className="font-mono text-[11px] font-semibold text-charcoal-800">{trajMatch}%</span>
          </div>
        );
      },
    },
    {
      key: 'aisGap',
      header: 'AIS Gap',
      width: '10%',
      render: (r) => {
        const gap = r.anomalies.find((a) => a.type.toUpperCase().includes('AIS_GAP'));
        if (gap) {
          return (
            <span className="text-red-700 font-mono text-[11px] font-bold">
              45+ min
            </span>
          );
        }
        return <span className="text-charcoal-400 font-mono text-[11px]">None</span>;
      },
    },
    {
      key: 'behavior',
      header: 'Behavior',
      width: '11%',
      render: (r) => {
        const hasDecel = r.anomalies.some((a) => a.type.toUpperCase().includes('DECEL'));
        const hasLoiter = r.anomalies.some((a) => a.type.toUpperCase().includes('LOITER'));
        if (hasDecel) {
          return <span className="text-amber-800 font-semibold text-[11px]">Speed drop</span>;
        }
        if (hasLoiter) {
          return <span className="text-amber-800 font-semibold text-[11px]">Loitering</span>;
        }
        return <span className="text-emerald-700 font-medium text-[11px]">Nominal</span>;
      },
    },
    {
      key: 'correlationScore',
      header: 'Correlation Score',
      width: '14%',
      align: 'right',
      render: (r) => (
        <div className="font-mono flex items-center justify-end space-x-1.5">
          <span
            className={`font-bold text-sm ${
              r.suspicionScore >= 75
                ? 'text-red-700'
                : r.suspicionScore >= 50
                ? 'text-amber-700'
                : 'text-emerald-900'
            }`}
          >
            {r.suspicionScore.toFixed(1)}
          </span>
          <span className="text-charcoal-400 text-[10px]">/ 100</span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#F0FDF4] overflow-hidden select-none">
      {/* LEFT / CENTER: Candidate Vessels Main Table */}
      <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r-2 border-emerald-300 overflow-hidden">
        {/* Table Header Strip */}
        <div className="h-12 px-4 bg-white border-b-2 border-emerald-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[2px] bg-[#064E26] text-white flex items-center justify-center">
              <Ship className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-xs text-[#064E26] tracking-tight">
                  पोत सहसंबंध एवं दायित्व निर्धारण
                </h1>
                <span className="text-emerald-300 font-sans">|</span>
                <span className="font-sans font-bold text-xs text-slate-800">
                  VESSEL ATTRIBUTION LEADERBOARD
                </span>
              </div>
              <div className="text-[9.5px] text-emerald-800 font-mono">
                ICG MRCC PRIORITIZED SUSPECT DOSSIERS // MARPOL 73/78
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">खोज परिधि / Radius:</span>
            <span className="font-mono text-xs font-bold text-[#064E26] bg-[#ECFDF5] border border-emerald-300 px-2 py-0.5 rounded-[2px]">
              65.0 km (35.1 NM)
            </span>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <div className="bg-[#FFF7ED] border-b border-amber-200 px-4 py-2 text-[11px] text-[#9A3412] flex items-center justify-between font-medium">
          <span>
            कानूनी साक्ष्य एवं पारदर्शी गणना: किसी भी पोत का चयन करके विस्तृत लेखा-परीक्षण एवं एआईएस ब्लैकआउट विश्लेषण देखें।
          </span>
          <span className="font-mono font-bold text-[#C85A00] text-[10.5px]">
            {scenario.vessels.length} CANDIDATES AUDITED
          </span>
        </div>

        {/* Candidate Vessels Table */}
        <div className="flex-1 overflow-y-auto bg-white">
          <DataTable
            columns={columns}
            data={scenario.vessels}
            keyExtractor={(r) => r.id}
            selectedId={selectedVessel.id}
            onRowClick={(r) => handleSelect(r.id)}
          />
        </div>
      </div>

      {/* RIGHT: Selected Vessel Evidence Detail Panel */}
      <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col bg-white overflow-hidden shadow-xs">
        <EvidencePanel
          vessel={{
            ...selectedVessel,
            overallScore: selectedVessel.suspicionScore,
          }}
          onClose={() => {}}
          onRequestInspection={(name) => {
            alert(`Inspection referral package prepared for Indian Coast Guard for ${name}.`);
          }}
        />
      </div>
    </div>
  );
};
