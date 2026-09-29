import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Waves,
  Clock,
  Radio,
  FileText,
  Activity,
  Ship,
  MapPin,
  ExternalLink,
  ChevronRight,
  Crosshair,
  Download,
} from 'lucide-react';
import { LeafletMapWorkspace } from '../components/map/LeafletMapWorkspace';
import { Metric } from '../components/common/Metric';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import {
  MaritimeScenario,
  RECENT_INVESTIGATIONS,
  SYSTEM_DATA_STATUS,
} from '../data/maritimeDemoData';
import { InvestigationDetail } from '../types';
import { InvestigationReplayBar } from '../components/workflow/InvestigationReplayBar';
import { downloadInvestigationPdf } from '../api/client';

interface OverviewViewProps {
  scenario: MaritimeScenario;
  investigation?: InvestigationDetail | null;
  selectedVesselId?: string;
  onSelectVessel?: (vesselId: string) => void;
  onNavigateToInvestigations?: () => void;
  onReopenInvestigation?: (caseId: string) => void;
  className?: string;
  isReplaying?: boolean;
  replayStep?: number | null;
  onReplayStepChange?: (step: number) => void;
  onStopReplay?: () => void;
  onStartReplay?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  scenario,
  investigation,
  selectedVesselId,
  onSelectVessel,
  onNavigateToInvestigations,
  onReopenInvestigation,
  className = '',
  isReplaying = false,
  replayStep = null,
  onReplayStepChange,
  onStopReplay,
  onStartReplay,
}) => {
  // Recent investigations compact table format (Investigation, Location, Area, Confidence, Candidates, Status, Action)
  const recentTableData = RECENT_INVESTIGATIONS.map((row, idx) => ({
    id: row.caseNumber,
    date: row.updatedAt.split(' ')[0],
    location: row.region,
    area: row.spillArea,
    confidence: idx === 0 ? '94.2%' : idx === 1 ? '88.5%' : '82.0%',
    candidates: `${scenario.vessels.length} vessels`,
    status: row.status,
    raw: row,
  }));

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ESCALATED_TO_COAST_GUARD':
        return { label: 'UNDER REVIEW', variant: 'warning' as const };
      case 'TRIAGED':
        return { label: 'TRIAGED', variant: 'info' as const };
      case 'OPEN':
        return { label: 'OPEN', variant: 'critical' as const };
      default:
        return { label: 'CLOSED', variant: 'normal' as const };
    }
  };

  const caseColumns: Column<(typeof recentTableData)[0]>[] = [
    {
      key: 'id',
      header: 'Investigation',
      width: '20%',
      render: (row) => (
        <span className="font-mono font-bold text-[#0B2545] hover:text-[#EA580C] hover:underline cursor-pointer">
          {row.id}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      width: '26%',
      render: (row) => <span className="text-charcoal-800 font-medium">{row.location}</span>,
    },
    {
      key: 'area',
      header: 'Area',
      width: '12%',
      render: (row) => <span className="text-red-700 font-mono font-semibold">{row.area}</span>,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: '12%',
      render: (row) => <span className="text-[#138808] font-mono font-semibold">{row.confidence}</span>,
    },
    {
      key: 'candidates',
      header: 'Candidates',
      width: '12%',
      render: (row) => <span className="text-charcoal-700 font-mono">{row.candidates}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (row) => {
        const info = getStatusInfo(row.status);
        return <Badge variant={info.variant} size="xs">{info.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      width: '14%',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onReopenInvestigation) onReopenInvestigation(row.id);
            }}
            className="px-2 py-0.5 rounded-[2px] bg-orange-50/80 hover:bg-orange-100 text-[#C2410C] font-sans font-semibold text-[11px] border border-orange-300 hover:border-orange-500 transition-colors cursor-pointer"
            title={`Reopen and load case ${row.id}`}
          >
            Reopen
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await downloadInvestigationPdf(row.id, row.id);
            }}
            className="px-2 py-0.5 rounded-[2px] bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#C2410C] font-sans font-bold text-[10.5px] border border-amber-400 hover:border-amber-600 transition-colors cursor-pointer flex items-center space-x-1"
            title={`1-Click Court PDF Export for ${row.id}`}
          >
            <Download className="w-3 h-3 text-[#C2410C]" />
            <span>PDF</span>
          </button>
        </div>
      ),
    },
  ];

  const spillId = investigation?.spill?.id ?? scenario.spill.id;
  const confidencePct = investigation?.spill?.confidence
    ? (investigation.spill.confidence * 100).toFixed(0)
    : (scenario.spill.confidence * 100).toFixed(0);
  const spillArea = investigation?.spill?.area_sqkm ?? scenario.spill.areaSqKm;
  const centroidLat = investigation?.spill?.centroid?.[0] ?? scenario.spill.centroid[0];
  const centroidLon = investigation?.spill?.centroid?.[1] ?? scenario.spill.centroid[1];

  const formatDms = (deg: number, isLat: boolean): string => {
    const d = Math.floor(Math.abs(deg));
    const minFloat = (Math.abs(deg) - d) * 60;
    const m = Math.floor(minFloat);
    const s = Math.round((minFloat - m) * 60);
    const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${d}°${m}'${s}"${dir}`;
  };

  const dmsCoords = `${formatDms(centroidLat, true)}, ${formatDms(centroidLon, false)}`;
  const candidateCount = investigation?.ais_candidates?.length ?? scenario.vessels.length;

  const [isIncidentMinimized, setIsIncidentMinimized] = useState<boolean>(false);

  return (
    <div className={`flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden ${className}`}>
      {/* 1. Top Metrics Strip: Clean Modern White Cards with Matching Functional Colors */}
      <div className="bg-slate-100/70 border-b border-slate-200/80 px-4 py-2 z-10 shadow-2xs backdrop-blur-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Card 1: Active Cases (Royal Navy / Indigo) */}
          <div className="card-white-navy p-2.5 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider font-mono truncate">
                ACTIVE CASES
              </div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {SYSTEM_DATA_STATUS.activeCases}
              </div>
              <div className="text-[10px] text-blue-700 font-medium truncate">
                2 escalated · 1 triaged (MRCC)
              </div>
            </div>
          </div>

          {/* Card 2: Detected Spill (Crimson / Coral Alert) */}
          <div className="card-white-crimson p-2.5 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center flex-shrink-0 text-red-600 shadow-2xs">
              <Waves className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-red-900 uppercase tracking-wider font-mono truncate">
                DETECTED SLICK
              </div>
              <div className="text-base font-black text-red-600 leading-tight">
                {spillArea} km²
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {scenario.region} · {confidencePct}% Conf
              </div>
            </div>
          </div>

          {/* Card 3: Candidate Vessels (Nautical Amber / Gold) */}
          <div className="card-white-amber p-2.5 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-2xs">
              <Ship className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono truncate">
                CANDIDATE VESSELS
              </div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {candidateCount} Vessels
              </div>
              <div className="text-[10px] text-amber-800 font-medium truncate">
                AIS spatiotemporal match
              </div>
            </div>
          </div>

          {/* Card 4: Satellite Coverage (Oceanic Teal) */}
          <div className="card-white-teal p-2.5 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center flex-shrink-0 text-teal-600 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider font-mono truncate">
                SAR SATELLITE PASS
              </div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {SYSTEM_DATA_STATUS.lastUpdateUtc.split(' ')[1]} UTC
              </div>
              <div className="text-[10px] text-teal-800 font-medium truncate">
                Sentinel-1A SAR (ESA / INCOIS)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Center Workspace: Dominant Expanded Leaflet Map with Full Breathability */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative min-h-[460px] border-b border-slate-200">
          <LeafletMapWorkspace
            scenario={scenario}
            investigation={investigation}
            selectedVesselId={selectedVesselId}
            onSelectVessel={onSelectVessel}
            replayStep={replayStep}
          />

          {/* Active Incident Overlay: Collapsible to maximize map viewport */}
          <div className="absolute top-3 left-3 z-[1000] select-none text-xs font-sans text-slate-800">
            {isIncidentMinimized ? (
              <button
                onClick={() => setIsIncidentMinimized(false)}
                className="bg-white/95 backdrop-blur-md border border-slate-200 border-l-4 border-l-rose-600 rounded-lg px-3 py-1.5 shadow-lg flex items-center space-x-2 text-slate-800 hover:bg-white cursor-pointer transition-all"
                title="Expand Incident Details"
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span className="font-bold text-[11px] text-rose-700">INCIDENT: {spillId}</span>
                <span className="font-mono text-slate-500 text-[10px]">({spillArea} km²)</span>
                <span className="text-slate-400 text-xs font-bold ml-1">▾</span>
              </button>
            ) : (
              <div className="w-64 bg-white/95 border border-slate-200 border-t-4 border-t-rose-600 rounded-xl shadow-xl p-3 backdrop-blur-md transition-all">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <span className="font-bold text-rose-700 uppercase text-[10.5px] tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    <span>ACTIVE INCIDENT</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{spillId}</span>
                    <button
                      onClick={() => setIsIncidentMinimized(true)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      title="Minimize overlay"
                    >
                      −
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Sector:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[120px]">{scenario.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Coordinates:</span>
                    <span className="font-mono font-bold text-blue-900 text-[10px] bg-blue-50/60 px-1 rounded border border-blue-200/60">{dmsCoords}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50/80 p-1.5 rounded-lg border border-slate-200/80">
                    <span className="font-mono font-bold text-red-600 text-xs">{spillArea} km²</span>
                    <span className="text-teal-800 font-mono font-bold text-[10.5px]">Confidence {confidencePct}%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Primary Suspect:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[110px]">
                      {investigation?.ais_candidates?.[0]?.vessel_name || scenario.vessels[0]?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Replay Controller Bar docked at bottom center of map canvas when replay is active */}
          {isReplaying && (
            <div className="absolute bottom-6 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
              <div className="pointer-events-auto w-full max-w-3xl shadow-xl">
                <InvestigationReplayBar
                  currentStep={replayStep ?? 1}
                  onStepChange={onReplayStepChange ?? (() => {})}
                  onClose={onStopReplay ?? (() => {})}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Lower Operational Panel: RECENT INVESTIGATIONS Compact Table */}
        <div className="h-44 flex flex-col bg-white overflow-hidden select-none border-t border-slate-200 shadow-xs flex-shrink-0">
          <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-mono font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                RECENT INVESTIGATION REGISTER ({recentTableData.length})
              </span>
            </div>
            {onNavigateToInvestigations && (
              <button
                onClick={onNavigateToInvestigations}
                className="text-xs font-sans text-sky-700 hover:text-sky-900 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>View all →</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <DataTable
              columns={caseColumns}
              data={recentTableData}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => {
                if (onReopenInvestigation) onReopenInvestigation(row.id);
              }}
            />
          </div>
        </div>

        {/* 4. Technical Data & Models Provenance Strip: Indian Geospatial Infrastructure */}
        <div className="bg-slate-50 border-t border-slate-200 px-3.5 py-1 text-[10.5px] font-sans text-slate-700 flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5">
          <div className="flex items-center space-x-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-800">
            <Activity className="w-3 h-3 text-sky-600" />
            <span>SENSOR ARCHITECTURE:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[10.5px]">
            <div><span className="text-slate-500 font-medium">Ocean Model:</span> <span className="font-bold text-slate-900">INCOIS Hydrodynamics</span></div>
            <div><span className="text-slate-500 font-medium">Satellite SAR:</span> <span className="font-bold text-slate-900">Sentinel-1 / ISRO</span></div>
            <div><span className="text-slate-500 font-medium">Coastal AIS:</span> <span className="font-bold text-slate-900">DGLL India Telemetry</span></div>
            <div><span className="text-slate-500 font-medium">Attribution:</span> <span className="font-bold text-slate-900">Lagrangian Hindcast v2.0</span></div>
            <div><span className="text-slate-500 font-medium">Status:</span> <span className="font-mono font-bold text-emerald-600">VERIFIED</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
