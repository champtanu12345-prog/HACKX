import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Anchor,
  TrendingDown,
  AlertTriangle,
  Send,
  CheckCircle2,
  Download,
  Loader2,
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
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { Badge } from '../common/Badge';
import { StateEmblemIndia } from '../common/StateEmblemIndia';
import { IndianCoastGuardInsignia } from '../common/IndianCoastGuardInsignia';
import { downloadInvestigationPdf } from '../../api/client';

interface ContextPanelProps {
  scenario: MaritimeScenario;
  selectedVesselId?: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onGenerateReport?: (vesselName: string) => void;
  onExportEvidence?: (vesselName: string) => void;
  onOpenDossier?: (vesselId?: string) => void;
  className?: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  scenario,
  selectedVesselId,
  isOpen,
  onToggleOpen,
  onGenerateReport,
  onExportEvidence,
  onOpenDossier,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'vessel' | 'slick' | 'truth'>('vessel');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const selectedVessel = selectedVesselId
    ? scenario.vessels.find((v) => v.id === selectedVesselId)
    : undefined;

  const handleDirectPdfDownload = async () => {
    if (!selectedVessel) return;
    setIsDownloadingPdf(true);
    try {
      const caseNumber = `ICG/MRCC-MUM/2026/MARPOL-ENV-${scenario.id === 'scenario_a' ? '0041' : scenario.id === 'scenario_b' ? '0019' : '0007'}`;
      await downloadInvestigationPdf(scenario.id, caseNumber);
    } catch (err) {
      console.error('ContextPanel PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const speedData = selectedVessel
    ? selectedVessel.positions.map((p) => ({
        time: p.time.split('T')[1].slice(0, 5),
        sog: p.sog,
      }))
    : [];

  if (!isOpen) {
    return (
      <div className="w-8 bg-white border-l border-gray-200 flex flex-col items-center py-3 select-none z-20 shadow-xs">
        <button
          onClick={onToggleOpen}
          title="Expand Context Panel"
          className="p-1 rounded-[2px] hover:bg-gray-100 text-charcoal-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="mt-8 [writing-mode:vertical-lr] text-[10px] font-mono text-charcoal-500 uppercase tracking-widest font-semibold">
          CONTEXT
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`w-96 bg-[#F8FAFC] border-l-2 border-slate-300 flex flex-col select-none text-xs z-20 transition-all font-sans shadow-lg ${className}`}
    >
      {/* Panel Top Header: Official Indian Coast Guard Dossier Header */}
      <div className="bg-[#064E26] text-white px-3 py-2 border-b-2 border-[#032B13] flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <StateEmblemIndia size="xs" variant="gold" />
          <div>
            <div className="font-serif font-bold text-xs text-[#FFD700] tracking-wide flex items-center space-x-1.5">
              <span>भारतीय तटरक्षक</span>
              <span className="text-emerald-400 font-sans">|</span>
              <span className="font-classic text-[11px] text-white font-bold tracking-wider">LEGAL DOSSIER</span>
            </div>
            <div className="text-[9.5px] font-mono text-emerald-200 tracking-tight">
              MARITIME EVIDENCE AUDIT // MARPOL ANNEX-I
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleOpen}
            title="Collapse Panel"
            className="p-1 rounded-[2px] hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selector with Official Government Tabs */}
      <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-300 text-[11px] text-center font-bold">
        <button
          onClick={() => setActiveTab('vessel')}
          className={`py-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'vessel'
              ? 'border-b-[#0D5204] text-[#064E26] bg-white font-extrabold shadow-2xs'
              : 'border-b-transparent text-slate-600 hover:text-[#064E26] hover:bg-emerald-50/50'
          }`}
        >
          संदेही पोत / Target
        </button>
        <button
          onClick={() => setActiveTab('slick')}
          className={`py-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'slick'
              ? 'border-b-[#0D5204] text-[#064E26] bg-white font-extrabold shadow-2xs'
              : 'border-b-transparent text-slate-600 hover:text-[#064E26] hover:bg-emerald-50/50'
          }`}
        >
          रिसाव डेटा / Slick
        </button>
        <button
          onClick={() => setActiveTab('truth')}
          className={`py-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'truth'
              ? 'border-b-[#0D5204] text-[#064E26] bg-white font-extrabold shadow-2xs'
              : 'border-b-transparent text-slate-600 hover:text-[#064E26] hover:bg-emerald-50/50'
          }`}
          title="Simulation benchmark reference dataset"
        >
          वैधानिक / Reference
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F4F6F9]">
        {activeTab === 'vessel' && (
          <>
            {!selectedVessel ? (
              /* When no vessel is selected: Empty State */
              <div className="card-ocean-green p-6 text-center space-y-2.5 my-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#064E26] mx-auto flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <Anchor className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs uppercase tracking-wider text-[#064E26]">
                  INVESTIGATION
                </div>
                <p className="text-xs text-charcoal-600 max-w-[220px] mx-auto leading-relaxed">
                  Select a vessel or map feature to inspect evidence.
                </p>
              </div>
            ) : (
              /* When a vessel is selected: Full Contextual Investigation */
              <>
                {/* 1. Header & Technical ID */}
                <div className="card-ocean-green p-3.5 space-y-2.5">
                  {/* Case Ref and Legal Header */}
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <div>
                      <div className="text-[9.5px] font-mono font-bold text-[#064E26] uppercase tracking-wider">
                        केस संदर्भ / CASE REF: ICG/MRCC-MUM/2026/SP-0041
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                        मर्चेंट शिपिंग अधिनियम 1958 (धारा 356C) के अंतर्गत तैयार
                      </div>
                    </div>
                    <span className="gov-dossier-stamp gov-dossier-stamp-critical text-[9px]">
                      प्रथम संदेही (P-1)
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif font-bold text-sm text-[#064E26] flex items-center space-x-1.5">
                        <Anchor className="w-4 h-4 text-[#064E26]" />
                        <span>{selectedVessel.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        MMSI: <span className="font-bold text-slate-900">{selectedVessel.mmsi}</span> · {selectedVessel.vesselType} ({selectedVessel.flag})
                      </div>
                    </div>
                  </div>

                  {/* Correlation Score & Priority */}
                  <div className="bg-[#ECFDF5] p-2.5 rounded-xl border border-emerald-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#064E26] uppercase tracking-wide">
                        सहसंबंध स्कोर / CORRELATION INDEX
                      </span>
                      <span className="font-mono font-extrabold text-lg text-red-700">
                        {selectedVessel.suspicionScore.toFixed(1)} / 100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-emerald-200">
                      <span className="text-slate-700 font-medium">तटरक्षक जांच प्राथमिकता:</span>
                      <span className="font-mono font-bold text-red-700 uppercase tracking-wide text-[11px] bg-red-100/80 px-1.5 py-0.5 rounded border border-red-300">
                        {selectedVessel.suspicionScore >= 80 ? 'CRITICAL (अति-उच्च)' : 'HIGH (उच्च)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Correlation Breakdown (Compact Horizontal Bars) */}
                <div className="card-ocean-green p-3 space-y-2.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064E26] pb-1 border-b border-emerald-100">
                    Correlation breakdown
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Spatial proximity */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-charcoal-700 font-medium">Spatial proximity</span>
                        <span className="font-mono font-bold text-charcoal-900">98</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#064E26] h-full rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>

                    {/* Temporal alignment */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-charcoal-700 font-medium">Temporal alignment</span>
                        <span className="font-mono font-bold text-charcoal-900">96</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#064E26] h-full rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>

                    {/* Trajectory alignment */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-charcoal-700 font-medium">Trajectory alignment</span>
                        <span className="font-mono font-bold text-charcoal-900">92</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#064E26] h-full rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>

                    {/* Behavioral anomaly */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-charcoal-700 font-medium">Behavioral anomaly</span>
                        <span className="font-mono font-bold text-charcoal-900">90</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Key Evidence List */}
                <div className="card-ocean-green p-3 space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064E26] pb-1 border-b border-emerald-100">
                    KEY EVIDENCE
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-charcoal-700">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#064E26] font-bold">•</span>
                      <span>1.5 km from reconstructed source</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#064E26] font-bold">•</span>
                      <span>±12 min from estimated release time</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#064E26] font-bold">•</span>
                      <span>Heading aligned with reconstructed trajectory</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>AIS transmission gap detected</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-red-700 font-bold">•</span>
                      <span>Sudden speed reduction observed</span>
                    </li>
                  </ul>
                </div>

                {/* 4. SOG Transit Speed Profile Chart */}
                <div className="card-ocean-green p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#064E26] uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3 text-[#064E26]" />
                      <span>Transit Speed Profile (SOG)</span>
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">knots vs UTC</span>
                  </div>

                  <div className="h-24 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={speedData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={9} />
                        <YAxis stroke="#9ca3af" fontSize={9} domain={[0, 20]} unit="kn" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: 10, color: '#111827' }}
                        />
                        <ReferenceLine y={5} stroke="#dc2626" strokeDasharray="2 2" />
                        <Line
                          type="monotone"
                          dataKey="sog"
                          name="Speed (kn)"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={{ r: 2, fill: '#059669' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Official Indian Coast Guard Dossier Actions & Sign-Off */}
                <div className="space-y-2 pt-1">
                  {/* 1-Click PDF Export */}
                  <button
                    onClick={handleDirectPdfDownload}
                    disabled={isDownloadingPdf}
                    className="w-full py-2.5 px-3 rounded-[2px] bg-[#FFD700] hover:bg-[#F2C200] text-[#064E26] font-sans font-extrabold text-xs flex items-center justify-center space-x-2 transition-all border border-amber-400 shadow-xs cursor-pointer"
                    title="Instant 1-Click PDF Court Dossier Export for Evaluators & Magistrates"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-[#064E26]" />
                    )}
                    <span>
                      {isDownloadingPdf
                        ? 'डाउनलोडिंग... / EXPORTING PDF...'
                        : '1-क्लिक कानूनी डॉजियर (PDF) / 1-CLICK PDF DOSSIER'}
                    </span>
                  </button>

                  {/* Open Interactive Dossier Modal */}
                  <button
                    onClick={() => {
                      if (onOpenDossier) {
                        onOpenDossier(selectedVessel.id);
                      } else if (onGenerateReport) {
                        onGenerateReport(selectedVessel.name);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-[2px] bg-[#0D5204] hover:bg-[#064E26] text-white font-sans font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-emerald-600 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
                    <span>डोजियर निरीक्षण / INSPECT DOSSIER</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onExportEvidence) {
                        onExportEvidence(selectedVessel.name);
                      } else {
                        alert(`Geospatial evidence package compiled for ${selectedVessel.name}.`);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-[2px] bg-white hover:bg-emerald-50 text-[#064E26] font-sans font-bold text-xs flex items-center justify-center space-x-1.5 border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>भू-स्थानिक साक्ष्य निर्यात / EXPORT GEOJSON ARCHIVE</span>
                  </button>

                  {/* Official Sign-Off Block */}
                  <div className="mt-3 p-2.5 bg-emerald-50/60 border border-emerald-300 rounded-[2px] text-center space-y-1">
                    <div className="text-[9.5px] font-serif font-bold text-[#064E26]">
                      कमांडिंग ऑफिसर, समुद्री पर्यावरण प्रभाग
                    </div>
                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-tight">
                      COMMANDING OFFICER, MARINE ENVIRONMENTAL DIVISION // INDIAN COAST GUARD
                    </div>
                    <div className="pt-1 text-[8.5px] font-mono text-emerald-800 font-bold">
                      ✓ DIGITAL SIGNATURE VERIFIED (GIGW 3.0 // CCA INDIA)
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'slick' && (
          <div className="space-y-2 text-[11px]">
            <div className="bg-white border border-gray-200 p-2.5 rounded-[2px] space-y-1.5 shadow-xs">
              <div className="text-[10px] font-bold text-charcoal-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                SAR Slick Geometry
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Detection ID:</span>
                <span className="text-charcoal-900 font-mono font-semibold">{scenario.spill.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Sensor Type:</span>
                <span className="text-emerald-700 font-medium">{scenario.spill.satellite}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Surface Area:</span>
                <span className="text-red-700 font-bold font-mono">{scenario.spill.areaSqKm} km²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Perimeter:</span>
                <span className="text-charcoal-800 font-mono">{scenario.spill.perimeterKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Est. Volume:</span>
                <span className="text-amber-800 font-semibold font-mono">{scenario.spill.estimatedVolumeM3} m³</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Confidence:</span>
                <span className="text-emerald-700 font-bold font-mono">{(scenario.spill.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-500">Weathering Age:</span>
                <span className="text-charcoal-800 font-mono">{scenario.spill.estimatedAgeHours} hrs</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-2.5 rounded-[2px] space-y-1 shadow-xs">
              <div className="text-[10px] font-bold text-charcoal-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                Environmental Forcing Vectors
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Surface Wind (10m):</span>
                <span className="text-charcoal-800 font-mono font-medium">
                  {scenario.environment.windSpeedKnots} kn @ {scenario.environment.windDirectionDeg}°
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-charcoal-500">Ocean Current:</span>
                <span className="text-charcoal-800 font-mono font-medium">
                  {scenario.environment.currentSpeedKnots} kn @ {scenario.environment.currentDirectionDeg}°
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-500">Sea State:</span>
                <span className="text-charcoal-800 font-mono">{scenario.environment.seaState}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'truth' && (
          <div className="bg-white border border-gray-200 p-2.5 rounded-[2px] space-y-2 text-[11px] shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <span className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider">
                Simulation Reference Benchmark
              </span>
              <Badge variant="demo" size="xs">
                SIMULATED DATA
              </Badge>
            </div>

            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              This scenario evaluates the attribution engine against a known simulated incident
              benchmark dataset.
            </p>

            <div className="space-y-1 bg-gray-50 p-2 rounded-[2px] border border-gray-200 text-[11px]">
              <div>
                <span className="text-charcoal-500">Reference Source Vessel:</span>{' '}
                <span className="text-charcoal-900 font-bold">{scenario.groundTruth.sourceVessel}</span>
              </div>
              <div>
                <span className="text-charcoal-500">MMSI:</span>{' '}
                <span className="text-charcoal-800 font-mono">{scenario.groundTruth.sourceMmsi}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Discharge Locus:</span>{' '}
                <span className="text-charcoal-800 font-mono">
                  {scenario.groundTruth.sourceCoords[0]}°N, {scenario.groundTruth.sourceCoords[1]}°E
                </span>
              </div>
              <div>
                <span className="text-charcoal-500">Discharge Time:</span>{' '}
                <span className="text-charcoal-800 font-mono">{scenario.groundTruth.sourceTimestamp}</span>
              </div>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-[2px] text-[11px]">
              <div className="text-emerald-800 font-bold flex items-center space-x-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Attribution Benchmark Status</span>
              </div>
              <p className="text-charcoal-700 text-[11px] leading-tight">
                {scenario.groundTruth.evidenceConfidence}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
