import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Download,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  MapPin,
  Satellite,
  Waves,
  Wind,
  Compass,
  Radio,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Ship,
  Loader2,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/common/Badge';
import { StateEmblemIndia } from '../components/common/StateEmblemIndia';
import { RECENT_INVESTIGATIONS } from '../data/maritimeDemoData';
import { downloadInvestigationPdf } from '../api/client';

interface InvestigationsViewProps {
  onReopenInvestigation?: (caseNumber: string) => void;
}

interface TimelineMilestone {
  stepNumber: number;
  stage: string;
  name: string;
  timeLabel: string;
  timestamp: string;
  sourceLabel: string;
  modelVersion?: string;
  isDemo: boolean;
  status: 'VERIFIED' | 'COMPLETED' | 'FLAGGED';
  details: string;
  metrics: { label: string; value: string }[];
  icon: React.ReactNode;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({
  onReopenInvestigation,
}) => {
  const [cases, setCases] = useState(RECENT_INVESTIGATIONS);
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string>('INV-2026-MUM-041');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const selectedCase = cases.find((c) => c.caseNumber === selectedCaseNumber) || cases[0];

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await downloadInvestigationPdf(selectedCase.caseNumber, selectedCase.caseNumber);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateStatus = (caseNumber: string, newStatus: string) => {
    setCases((prev) =>
      prev.map((c) => (c.caseNumber === caseNumber ? { ...c, status: newStatus } : c))
    );
  };

  // Timeline-based investigation interface as requested:
  // 14:32 Satellite observation
  // 14:47 Oil spill detected
  // 15:02 Hindcast completed
  // 15:05 Source estimated
  // 15:07 AIS candidates identified
  // 15:09 Correlation completed
  // 15:10 Investigation ready
  const timelineMilestones: TimelineMilestone[] = [
    {
      stepNumber: 1,
      stage: 'SATELLITE_OBSERVATION',
      name: 'Satellite observation',
      timeLabel: '14:32 UTC',
      timestamp: '2026-09-14 14:32:00 UTC',
      sourceLabel: 'Sentinel-1A C-SAR IW (ESA Copernicus Open Access Hub)',
      isDemo: true,
      status: 'VERIFIED',
      details: 'Sentinel-1A Synthetic Aperture Radar pass acquired over maritime sector. Surface roughness backscatter anomaly logged.',
      metrics: [
        { label: 'SENSOR', value: 'C-SAR IW GRDH' },
        { label: 'POLARIZATION', value: 'VV + VH' },
        { label: 'SWATH', value: '250 km' },
      ],
      icon: <Satellite className="w-3.5 h-3.5 text-[#064E26]" />,
    },
    {
      stepNumber: 2,
      stage: 'OIL_SPILL_DETECTED',
      name: 'Oil spill detected',
      timeLabel: '14:47 UTC',
      timestamp: '2026-09-14 14:47:00 UTC',
      sourceLabel: 'HACKX Neural Segmentation Engine',
      modelVersion: 'HACKX-UNet-v1.2.0-sentinel1',
      isDemo: true,
      status: 'VERIFIED',
      details: 'U-Net deep convolutional segmentation extracted hydrocarbon slick boundary with high radiometric confidence.',
      metrics: [
        { label: 'AREA', value: `${selectedCase.spillArea}` },
        { label: 'CONFIDENCE', value: '94.2%' },
        { label: 'DATUM', value: 'WGS84 EPSG:4326' },
      ],
      icon: <Waves className="w-3.5 h-3.5 text-red-600" />,
    },
    {
      stepNumber: 3,
      stage: 'HINDCAST_COMPLETED',
      name: 'Hindcast completed',
      timeLabel: '15:02 UTC',
      timestamp: '2026-09-14 15:02:00 UTC',
      sourceLabel: 'Deterministic Lagrangian Particle Simulator',
      modelVersion: 'Lagrangian-Drift-v2.1',
      isDemo: true,
      status: 'COMPLETED',
      details: 'Reverse-time Lagrangian simulation tracked particle trajectories backward through NOAA GFS wind and CMEMS current vectors.',
      metrics: [
        { label: 'DURATION', value: '12 Hours' },
        { label: 'TIMESTEP', value: '60 Minutes' },
        { label: 'WIND/CURRENT', value: '14 kts / 0.8 kts' },
      ],
      icon: <Compass className="w-3.5 h-3.5 text-sky-600" />,
    },
    {
      stepNumber: 4,
      stage: 'SOURCE_ESTIMATED',
      name: 'Source estimated',
      timeLabel: '15:05 UTC',
      timestamp: '2026-09-14 15:05:00 UTC',
      sourceLabel: 'Hydrodynamic Origin Convergence Estimator',
      isDemo: true,
      status: 'VERIFIED',
      details: 'Particle trajectory convergence established the most probable release origin coordinates and temporal discharge window.',
      metrics: [
        { label: 'ORIGIN COORDS', value: '18.974°N, 72.392°E' },
        { label: 'EST. TIME', value: '2026-09-14 02:40 UTC' },
        { label: 'UNCERTAINTY', value: '±2.4 km' },
      ],
      icon: <MapPin className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      stepNumber: 5,
      stage: 'AIS_CANDIDATES_IDENTIFIED',
      name: 'AIS candidates identified',
      timeLabel: '15:07 UTC',
      timestamp: '2026-09-14 15:07:00 UTC',
      sourceLabel: 'DGLL Coastal Network & Spire Global Telemetry',
      isDemo: true,
      status: 'COMPLETED',
      details: 'Queried historical AIS transponder telemetry within a 65 km radius of the estimated discharge locus.',
      metrics: [
        { label: 'CANDIDATES', value: '3 Vessels' },
        { label: 'ANOMALIES', value: '1 Dark Gap, 1 Speed Drop' },
        { label: 'SEARCH RADIUS', value: '65.0 km (35 NM)' },
      ],
      icon: <Radio className="w-3.5 h-3.5 text-[#064E26]" />,
    },
    {
      stepNumber: 6,
      stage: 'CORRELATION_COMPLETED',
      name: 'Correlation completed',
      timeLabel: '15:09 UTC',
      timestamp: '2026-09-14 15:09:00 UTC',
      sourceLabel: 'Transparent Multi-Criteria Attribution Scoring Engine',
      modelVersion: 'HACKX-Explainable-Score-v1.0 (40/25/20/15)',
      isDemo: true,
      status: 'VERIFIED',
      details: 'Computed explainable correlation scores. Identified MT ARABIAN STAR as primary potential source vessel requiring Coast Guard inspection.',
      metrics: [
        { label: 'TOP CANDIDATE', value: `${selectedCase.primarySuspect}` },
        { label: 'SCORE', value: '98.2 / 100' },
        { label: 'PRIORITY', value: 'Potential source vessel' },
      ],
      icon: <Award className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      stepNumber: 7,
      stage: 'INVESTIGATION_READY',
      name: 'Investigation ready',
      timeLabel: '15:10 UTC',
      timestamp: '2026-09-14 15:10:00 UTC',
      sourceLabel: 'Maritime Incident Dossier Finalizer',
      isDemo: true,
      status: 'COMPLETED',
      details: 'Attribution correlation package compiled and prepared for Coast Guard investigation priority review.',
      metrics: [
        { label: 'DOSSIER STATUS', value: 'Finalized' },
        { label: 'REOPEN', value: 'Active on Map' },
        { label: 'LEAD AGENCY', value: `${selectedCase.leadAgency}` },
      ],
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
    },
  ];

  return (
    <div className="flex-1 bg-[#F0FDF4] p-4 overflow-y-auto space-y-4 font-sans text-xs select-none">
      {/* 1. Header Strip: Official ICG Enforcement Dossier Header */}
      <div className="card-ocean-green p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-[#064E26] rounded-xl border border-emerald-400/40">
            <StateEmblemIndia size="sm" variant="gold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-sm text-[#064E26]">
                कानूनी साक्ष्य एवं प्रवर्तन डोजियर
              </h1>
              <span className="text-emerald-300 font-sans">|</span>
              <span className="font-sans font-bold text-sm text-slate-800">
                ICG ENFORCEMENT & EVIDENCE REGISTER
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
              CHRONOLOGICAL SPILL ATTRIBUTION LEDGER // SECTION 356C MERCHANT SHIPPING ACT, 1958
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="gov-dossier-stamp gov-dossier-stamp-verified text-[10px]">
            सत्यापित साक्ष्य (AUDITED)
          </span>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-[2px] bg-[#064E26] hover:bg-[#0D5204] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors border border-emerald-400/40 cursor-pointer shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD700]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#FFD700]" />
            )}
            <span>{isExporting ? 'EXPORTING PDF...' : 'EXPORT ICG DOSSIER (PDF/A)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Case Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cases.map((c) => {
          const isSelected = c.caseNumber === selectedCaseNumber;
          return (
            <div
              key={c.caseNumber}
              onClick={() => setSelectedCaseNumber(c.caseNumber)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'card-ocean-green border-2 border-[#064E26] ring-2 ring-emerald-400/40 shadow-md bg-white'
                  : 'card-ocean-green hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-100">
                <span className="font-mono font-bold text-xs text-charcoal-900">
                  {c.caseNumber}
                </span>
                <Badge
                  variant={
                    c.status === 'ESCALATED_TO_COAST_GUARD'
                      ? 'critical'
                      : c.status === 'TRIAGED'
                      ? 'warning'
                      : 'normal'
                  }
                  size="xs"
                >
                  {c.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="text-[11px] text-charcoal-600 space-y-0.5">
                <div className="font-medium text-charcoal-800">{c.region}</div>
                <div>Spill Area: <span className="font-mono font-semibold text-red-700">{c.spillArea}</span></div>
                <div className="truncate">Top Priority: <span className="font-semibold text-charcoal-900">{c.primarySuspect}</span></div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-charcoal-500 font-mono">
                <span>{c.updatedAt}</span>
                {onReopenInvestigation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReopenInvestigation(c.caseNumber);
                    }}
                    className="text-[#064E26] font-bold hover:underline"
                  >
                    Reopen on Map →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Timeline-Based Investigation Interface */}
      <div className="card-ocean-green p-4 space-y-3">
        <div className="pb-2 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#064E26]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#064E26]">
              Investigation Sequence Timeline — {selectedCase.caseNumber}
            </h2>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">
            Chronological reconstruction sequence
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {timelineMilestones.map((m) => (
            <div
              key={m.stepNumber}
              className="flex items-start space-x-3 p-3 bg-white/90 border border-emerald-200/80 rounded-xl"
            >
              {/* Time Indicator */}
              <div className="w-20 flex-shrink-0 pt-0.5">
                <span className="font-mono font-bold text-[#064E26] text-xs block">
                  {m.timeLabel}
                </span>
                <span className="text-[10px] text-charcoal-500 font-mono">
                  Step 0{m.stepNumber}
                </span>
              </div>

              {/* Icon Marker */}
              <div className="p-1.5 rounded-[2px] bg-white border border-gray-300 flex-shrink-0 mt-0.5">
                {m.icon}
              </div>

              {/* Details & Metrics */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-900 text-xs">
                    {m.name}
                  </span>
                  <Badge variant="normal" size="xs">
                    {m.status}
                  </Badge>
                </div>

                <p className="text-[11px] text-charcoal-700 leading-relaxed">
                  {m.details}
                </p>

                {/* Metrics Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.metrics.map((met, i) => (
                    <div
                      key={i}
                      className="bg-white px-2 py-0.5 rounded-[2px] border border-gray-200 font-mono text-[10px]"
                    >
                      <span className="text-charcoal-500">{met.label}:</span>{' '}
                      <span className="font-semibold text-charcoal-900">{met.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
