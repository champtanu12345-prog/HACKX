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
        <span className="font-mono font-bold text-emerald-900 hover:underline cursor-pointer">
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
      render: (row) => <span className="text-emerald-700 font-mono font-semibold">{row.confidence}</span>,
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
            className="px-2 py-0.5 rounded-[2px] bg-emerald-50/50 hover:bg-emerald-100 text-[#064E26] font-sans font-semibold text-[11px] border border-emerald-300 hover:border-emerald-500 transition-colors cursor-pointer"
            title={`Reopen and load case ${row.id}`}
          >
            Reopen
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await downloadInvestigationPdf(row.id, row.id);
            }}
            className="px-2 py-0.5 rounded-[2px] bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#064E26] font-sans font-bold text-[10.5px] border border-amber-400 hover:border-amber-600 transition-colors cursor-pointer flex items-center space-x-1"
            title={`1-Click Court PDF Export for ${row.id}`}
          >
            <Download className="w-3 h-3 text-[#064E26]" />
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

  return (
    <div className={`flex-1 flex flex-col h-full bg-[#F0FDF4] overflow-hidden ${className}`}>
      {/* 1. Top Metrics Strip: Floating Green Ocean Wave Portal Cards */}
      <div className="bg-gradient-to-r from-[#ECFDF5] via-[#D1FAE5] to-[#ECFDF5] border-b-2 border-emerald-300/80 px-4 py-3 z-10 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card-ocean-green p-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0 text-[#064E26] shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#064E26] uppercase tracking-wider font-mono truncate">
                सक्रिय मामले / ACTIVE CASES
              </div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {SYSTEM_DATA_STATUS.activeCases}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium truncate">
                2 escalated · 1 triaged (MRCC)
              </div>
            </div>
          </div>

          <div className="card-ocean-green p-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600 shadow-2xs">
              <Waves className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider font-mono truncate">
                पहचाना गया रिसाव / DETECTED
              </div>
              <div className="text-lg font-black text-red-700 leading-tight">
                {spillArea} km²
              </div>
              <div className="text-[10px] text-slate-600 font-medium truncate">
                {scenario.region} · {confidencePct}% Conf
              </div>
            </div>
          </div>

          <div className="card-ocean-green p-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-[#E67300] shadow-2xs">
              <Ship className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono truncate">
                संदेही पोत / CANDIDATES
              </div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {candidateCount} Vessels
              </div>
              <div className="text-[10px] text-amber-800 font-medium truncate">
                AIS spatiotemporal corridor match
              </div>
            </div>
          </div>

          <div className="card-ocean-green p-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-[#064E26] shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#064E26] uppercase tracking-wider font-mono truncate">
                उपग्रह कवरेज / SAR PASS
              </div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {SYSTEM_DATA_STATUS.lastUpdateUtc.split(' ')[1]} UTC
              </div>
              <div className="text-[10px] text-emerald-800 font-medium truncate">
                Sentinel-1A SAR (ESA / INCOIS)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Center Workspace: Dominant Leaflet Map with Compact Docked Overlay */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-[70] relative min-h-[340px] border-b-2 border-emerald-300">
          <LeafletMapWorkspace
            scenario={scenario}
            investigation={investigation}
            selectedVesselId={selectedVesselId}
            onSelectVessel={onSelectVessel}
            replayStep={replayStep}
          />

          {/* Official Indian Coast Guard Active Incident Overlay (Ocean Green Theme) */}
          <div className="absolute top-3 left-3 z-[1000] w-64 bg-white/95 border-2 border-[#064E26] rounded-xl shadow-lg p-3 select-none text-xs font-sans text-slate-800 backdrop-blur-xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-100">
              <span className="font-bold text-[#064E26] uppercase text-[10.5px] tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>सक्रिय घटना / INCIDENT</span>
              </span>
              <span className="font-mono font-bold text-xs text-[#064E26] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">{spillId}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">स्थान / Sector:</span>
                <span className="font-bold text-slate-900 truncate max-w-[120px]">{scenario.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">निर्देशांक / DMS:</span>
                <span className="font-mono font-bold text-slate-800 text-[10px]">{dmsCoords}</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-50/60 p-1 rounded border border-emerald-100">
                <span className="font-mono font-bold text-red-700 text-xs">{spillArea} km²</span>
                <span className="text-emerald-800 font-mono font-bold text-[10.5px]">विश्वसनीयता {confidencePct}%</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-600 font-medium">प्राथमिक संदेही:</span>
                <span className="font-bold text-[#064E26] truncate max-w-[110px]">
                  {investigation?.ais_candidates?.[0]?.vessel_name || scenario.vessels[0]?.name}
                </span>
              </div>
            </div>
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
        <div className="flex-[30] flex flex-col bg-white min-h-[160px] overflow-hidden select-none border-t-2 border-emerald-300">
          <div className="bg-[#E6F4EA] px-3.5 py-2 border-b border-emerald-300 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-[#064E26]" />
              <span className="font-mono font-bold text-[11px] text-[#064E26] uppercase tracking-wider">
                राष्ट्रीय तटरक्षक मामला रजिस्टर / RECENT INVESTIGATION REGISTER ({recentTableData.length})
              </span>
            </div>
            {onNavigateToInvestigations && (
              <button
                onClick={onNavigateToInvestigations}
                className="text-xs font-sans text-[#064E26] hover:text-[#0D5204] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>सभी देखें / View all →</span>
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
        <div className="bg-emerald-50/70 border-t border-emerald-300 px-3.5 py-1.5 text-[11px] font-sans text-slate-700 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-[10px] uppercase tracking-wider text-[#064E26]">
            <Activity className="w-3 h-3 text-[#10B981]" />
            <span>एजेंसी डेटा स्ट्रीम / SENSOR ARCHITECTURE:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <div><span className="text-slate-500 font-medium">Ocean Model:</span> <span className="font-bold text-slate-900">INCOIS Hydrodynamics</span></div>
            <div><span className="text-slate-500 font-medium">Satellite SAR:</span> <span className="font-bold text-slate-900">Copernicus Sentinel-1 / ISRO</span></div>
            <div><span className="text-slate-500 font-medium">Coastal AIS:</span> <span className="font-bold text-slate-900">DGLL India Telemetry</span></div>
            <div><span className="text-slate-500 font-medium">Attribution Engine:</span> <span className="font-bold text-slate-900">Lagrangian Hindcast v2.0</span></div>
            <div><span className="text-slate-500 font-medium">Status:</span> <span className="font-mono font-bold text-emerald-800">सत्यापित / VERIFIED</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
