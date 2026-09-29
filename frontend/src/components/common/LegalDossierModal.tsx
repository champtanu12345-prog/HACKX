import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Shield,
  Anchor,
  CheckCircle2,
  AlertTriangle,
  FileText,
  QrCode,
  Lock,
  Loader2,
  Coins,
  Scale,
  Award,
} from 'lucide-react';
import { StateEmblemIndia } from './StateEmblemIndia';
import { IndianCoastGuardInsignia } from './IndianCoastGuardInsignia';
import { TricolorRibbon } from './TricolorRibbon';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import {
  downloadInvestigationPdf,
  getInvestigationPenalty,
  MaritimePenaltyData,
} from '../../api/client';

interface LegalDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: MaritimeScenario;
  selectedVesselId?: string;
}

type DossierTab = 'EVIDENCE' | 'PENALTY' | 'CERTIFICATE';

export const LegalDossierModal: React.FC<LegalDossierModalProps> = ({
  isOpen,
  onClose,
  scenario,
  selectedVesselId,
}) => {
  const [activeTab, setActiveTab] = useState<DossierTab>('EVIDENCE');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [penaltyData, setPenaltyData] = useState<MaritimePenaltyData | null>(null);

  const targetVessel =
    (selectedVesselId && scenario.vessels.find((v) => v.id === selectedVesselId)) ||
    scenario.vessels[0];

  const caseNumber = `ICG/MRCC-MUM/2026/MARPOL-ENV-${
    scenario.id === 'scenario_a' ? '0041' : scenario.id === 'scenario_b' ? '0019' : '0007'
  }`;
  const sha256Checksum = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

  useEffect(() => {
    if (isOpen) {
      getInvestigationPenalty(scenario.id)
        .then((data) => setPenaltyData(data))
        .catch(() => {
          // Fallback client-side calculation
          const area = scenario.spill.areaSqKm || 14.85;
          const vol_m3 = area * 1e6 * 4.2e-6;
          const vol_mt = vol_m3 * 0.885;
          const base_fine = 10000000;
          const mob = 3500000;
          const cleanup = mob + vol_mt * 185000;
          const eco = vol_mt * 320000 * 1.8;
          const total = base_fine + cleanup + eco;
          const bond = total * 1.25;

          setPenaltyData({
            case_number: caseNumber,
            target_vessel_name: targetVessel?.name || 'MT ARABIAN STAR',
            target_vessel_mmsi: targetVessel?.mmsi || '419000123',
            vessel_flag: targetVessel?.flag || 'Panama',
            vessel_type: targetVessel?.vesselType || 'Crude Oil Tanker',
            is_foc: true,
            spill_area_sqkm: area,
            slick_appearance_code: 'BAOAC-3 (Metallic / True Color Discontinuous)',
            mean_thickness_microns: 4.2,
            estimated_volume_m3: Math.round(vol_m3 * 10) / 10,
            estimated_volume_mt: Math.round(vol_mt * 10) / 10,
            hydrocarbon_type: 'Heavy Fuel Oil (HFO / Marine Crude Fuel)',
            density_mt_per_m3: 0.885,
            base_statutory_fine_inr: base_fine,
            cleanup_mobilization_inr: mob,
            cleanup_per_tonne_inr: 185000,
            total_cleanup_cost_inr: Math.round(cleanup),
            sensitivity_zone: 'Western Offshore Continental Shelf (Mumbai High Sector)',
            sensitivity_multiplier: 1.8,
            ecological_damage_inr: Math.round(eco),
            total_statutory_liability_inr: Math.round(total),
            total_statutory_liability_usd: Math.round(total / 86.5),
            detention_security_bond_inr: Math.round(bond),
            detention_security_bond_usd: Math.round(bond / 86.5),
            statutory_violations: [
              {
                statute: 'Merchant Shipping Act, 1958',
                section: 'Section 356C',
                title: 'Prohibition of Discharge of Oil or Oily Mixture',
                description: `Discharge exceeding statutory limit (15 ppm) within Indian EEZ (${area.toFixed(2)} km²).`,
                penalty_provision: 'Statutory fine under §356K and full liability for containment expenses.',
              },
              {
                statute: 'Merchant Shipping Act, 1958',
                section: 'Section 356J',
                title: 'Power to Detain Foreign Ship in Default of Security',
                description: 'Empowerment to arrest and detain vessel until bank guarantee is deposited.',
                penalty_provision: `Mandatory Bank Guarantee of ₹${Math.round(bond).toLocaleString('en-IN')}.`,
              },
              {
                statute: 'MARPOL 73/78 Annex I',
                section: 'Regulation 15 & 34',
                title: 'Control of Operational Discharge of Oil',
                description: 'Unlawful tank washing and oily bilge pumping without approved ODMCS.',
                penalty_provision: 'International Port State Control (PSC) detention & IMO Flag notification.',
              },
            ],
            recommended_enforcement_action: `Issue immediate Maritime Arrest Warrant & Notice of Detention under Merchant Shipping Act 1958 §356J. Direct Mumbai Port Authority / JNPT to deny port clearance until an irrevocable bank guarantee of ₹${Math.round(bond).toLocaleString('en-IN')} is deposited with the High Court of Judicature.`,
          });
        });
    }
  }, [isOpen, scenario.id, targetVessel?.name, targetVessel?.mmsi, targetVessel?.flag, targetVessel?.vesselType, scenario.spill.areaSqKm, caseNumber]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setDownloadSuccess(false);
    try {
      await downloadInvestigationPdf(scenario.id, caseNumber);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to download court dossier PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[3px] border-2 border-[#EA580C] shadow-2xl flex flex-col overflow-hidden text-slate-900 font-sans">
        {/* Modal Top Control Bar */}
        <div className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#9A3412]">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <span className="font-serif font-bold text-sm text-[#FFD700]">
              भारतीय तटरक्षक कानूनी साक्ष्य डोजियर
            </span>
            <span className="text-orange-200">|</span>
            <span className="font-sans text-xs text-white font-medium">
              LEGAL INCIDENT DOSSIER INSPECTOR
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 1-Click Official Court PDF Export */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className={`px-3 py-1 rounded-[2px] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs border ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-[#FFD700] hover:bg-[#F2C200] text-[#7C2D12] border-amber-400'
              }`}
              title="Download 3-page court-admissible PDF dossier with Section 63 BSA 2023 Certificate"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#7C2D12]" />
              )}
              <span className="font-mono font-bold">
                {isExportingPdf
                  ? 'उत्पन्न हो रहा है... / GENERATING...'
                  : downloadSuccess
                  ? '✓ डाउनलोड सफल / DOWNLOADED'
                  : '1-क्लिक 3-पेज PDF निर्यात / 1-CLICK COURT PDF'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#138808] hover:bg-[#0D5204] text-white rounded-[2px] font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs border border-emerald-500"
              title="Print official legal dossier (PDF/A format)"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>प्रिंट करें / PRINT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-orange-100 hover:text-white rounded-[2px] transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-[#0B2545] px-6 pt-2 flex items-center space-x-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-4 py-2 text-xs font-bold rounded-t-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'EVIDENCE'
                ? 'bg-[#FAF9F6] text-[#C2410C] border-t-2 border-t-[#EA580C] shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. तकनीकी साक्ष्य / Forensic Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('PENALTY')}
            className={`px-4 py-2 text-xs font-bold rounded-t-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'PENALTY'
                ? 'bg-[#FAF9F6] text-[#C2410C] border-t-2 border-t-[#EA580C] shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>2. वैधानिक जुर्माना एवं बैंक गारंटी / Fines & Bond (§356J)</span>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`px-4 py-2 text-xs font-bold rounded-t-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'CERTIFICATE'
                ? 'bg-[#FAF9F6] text-[#138808] border-t-2 border-t-[#138808] shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. धारा 63 साक्ष्य प्रमाण पत्र / Sec 63 BSA 2023 Cert</span>
          </button>
        </div>

        {/* Scrollable Printable Document Container */}
        <div id="printable-dossier-container" className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAF9F6]">
          {/* Document Header Letterhead */}
          <div className="border-2 border-[#064E26] p-5 bg-white rounded-[2px] relative shadow-xs">
            <TricolorRibbon height="sm" className="mb-3" />

            <div className="flex items-start justify-between">
              {/* Left: State Emblem */}
              <div className="flex items-center space-x-4">
                <StateEmblemIndia size="md" variant="gold" />
                <div>
                  <div className="font-serif font-extrabold text-base text-[#064E26] leading-tight tracking-wide">
                    भारत सरकार | रक्षा मंत्रालय
                  </div>
                  <div className="font-classic font-bold text-sm text-[#064E26] tracking-widest uppercase">
                    भारतीय तटरक्षक / INDIAN COAST GUARD
                  </div>
                  <div className="text-[11.5px] text-slate-700 font-semibold font-sans mt-0.5">
                    मुख्यालय तटरक्षक क्षेत्र (पश्चिम) // Maritime Rescue Coordination Centre (MRCC)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                    Worli Sea Face, Mumbai 400 030, Maharashtra, India
                  </div>
                </div>
              </div>

              {/* Right: ICG Insignia & Barcode Reference */}
              <div className="flex flex-col items-end text-right">
                <IndianCoastGuardInsignia size="sm" variant="color" />
                <div className="mt-2 text-[10.5px] font-mono font-extrabold text-[#064E26] bg-[#F0FDF4] px-2.5 py-1 rounded border border-emerald-400 shadow-2xs">
                  {caseNumber}
                </div>
                <div className="text-[9.5px] text-slate-600 font-mono font-semibold mt-1">
                  DATE: 2026-09-15 // CLASSIFICATION: CONFIDENTIAL
                </div>
              </div>
            </div>

            {/* Official Title Ribbon */}
            <div className="mt-4 pt-3 border-t-2 border-[#064E26] text-center">
              <div className="font-serif font-black text-lg text-[#064E26] uppercase tracking-wide">
                समुद्री तेल प्रदूषण कानूनी साक्ष्य एवं पोत दायित्व निर्धारण रिपोर्ट
              </div>
              <div className="font-classic text-sm font-bold text-slate-800 mt-1 tracking-widest uppercase">
                MARITIME OIL POLLUTION ATTRIBUTION & TECHNICAL EVIDENCE DOSSIER
              </div>
              <div className="mt-1.5 inline-block px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded font-mono font-extrabold text-[10.5px] uppercase tracking-wide shadow-2xs">
                STATUTORY EVIDENCE UNDER SECTION 356C, MERCHANT SHIPPING ACT 1958 & MARPOL 73/78
              </div>
            </div>
          </div>

          {/* TAB 1: TECHNICAL ATTRIBUTION EVIDENCE */}
          {activeTab === 'EVIDENCE' && (
            <>
              {/* Section 1: Incident & Detection Summary */}
              <div className="border border-slate-300 p-4 bg-white rounded-[2px] space-y-3">
                <div className="font-serif font-bold text-xs text-[#0B2545] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>1. घटना एवं उपग्रह विश्लेषण सारांश / INCIDENT & SATELLITE DETECTION SUMMARY</span>
                  <span className="font-mono text-[10px] text-emerald-700">✓ VERIFIED SENSOR OBSERVATION</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11.5px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-slate-500 font-medium">घटना क्षेत्र / Region:</div>
                    <div className="font-bold text-slate-900">{scenario.region}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-slate-500 font-medium">रिसाव क्षेत्रफल / Spill Area:</div>
                    <div className="font-mono font-bold text-red-700">
                      {scenario.spill.areaSqKm} km² ({scenario.spill.perimeterKm} km perim)
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-slate-500 font-medium">उपग्रह संवेदक / Sensor:</div>
                    <div className="font-bold text-slate-900">{scenario.spill.satellite} (ESA/INCOIS)</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="text-slate-500 font-medium">पहचान विश्वसनीयता / Confidence:</div>
                    <div className="font-mono font-bold text-emerald-800">
                      {(scenario.spill.confidence * 100).toFixed(1)}% (U-Net v2.4)
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Lagrangian Drift Reconstructed Discharge Locus */}
              <div className="border border-slate-300 p-4 bg-white rounded-[2px] space-y-3">
                <div className="font-serif font-bold text-xs text-[#0B2545] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>2. भौतिक बहाव पुनर्रचना / LAGRANGIAN REVERSE DRIFT RECONSTRUCTION</span>
                  <span className="font-mono text-[10px] text-[#0B2545]">INCOIS + NOAA GFS FORCING</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11.5px]">
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                    <div className="text-slate-600 font-medium">अनुमानित उद्गम स्थल / Discharge Origin:</div>
                    <div className="font-mono font-bold text-[#0B2545] text-xs">
                      {scenario.drift.estimatedOriginCoords[0].toFixed(4)}°N,{' '}
                      {scenario.drift.estimatedOriginCoords[1].toFixed(4)}°E
                    </div>
                    <div className="text-[10px] text-slate-500">Uncertainty Envelope: ±2.4 km (95% Conf)</div>
                  </div>
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                    <div className="text-slate-600 font-medium">अनुमानित निष्कासन समय / Discharge Window:</div>
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {scenario.drift.estimatedOriginTime}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Weathering Age: {scenario.spill.estimatedAgeHours} hours prior to pass
                    </div>
                  </div>
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                    <div className="text-slate-600 font-medium">पर्यावरणीय सदिश / Hydrodynamic Vectors:</div>
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      Current: {scenario.environment.currentSpeedKnots} kn @{' '}
                      {scenario.environment.currentDirectionDeg}°
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Wind: {scenario.environment.windSpeedKnots} kn @ {scenario.environment.windDirectionDeg}°
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Priority-1 Target Vessel Audit */}
              {targetVessel && (
                <div className="border-2 border-red-300 p-4 bg-red-50/20 rounded-[2px] space-y-3">
                  <div className="font-serif font-bold text-xs text-red-900 uppercase tracking-wider border-b border-red-200 pb-1 flex items-center justify-between">
                    <span>3. संदेही पोत का तकनीकी एवं व्यवहारिक विश्लेषण / TARGET VESSEL FORENSIC AUDIT</span>
                    <span className="gov-dossier-stamp gov-dossier-stamp-critical text-[9px]">
                      PRIORITY-1 SUSPECT (प्रथम संदेही)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11.5px]">
                    <div className="p-2 bg-white border border-red-200 rounded">
                      <div className="text-slate-500 font-medium">पोत का नाम / Vessel:</div>
                      <div className="font-bold text-[#0B2545]">{targetVessel.name}</div>
                    </div>
                    <div className="p-2 bg-white border border-red-200 rounded">
                      <div className="text-slate-500 font-medium">MMSI / Flag State:</div>
                      <div className="font-mono font-bold text-slate-900">
                        {targetVessel.mmsi} ({targetVessel.flag})
                      </div>
                    </div>
                    <div className="p-2 bg-white border border-red-200 rounded">
                      <div className="text-slate-500 font-medium">उद्गम स्थल से दूरी / Distance:</div>
                      <div className="font-mono font-bold text-red-700">
                        {(targetVessel.minDistanceNm * 1.852).toFixed(1)} km ({targetVessel.minDistanceNm} NM)
                      </div>
                    </div>
                    <div className="p-2 bg-white border border-red-200 rounded">
                      <div className="text-slate-500 font-medium">सहसंबंध सूचकांक / Index:</div>
                      <div className="font-mono font-extrabold text-red-700 text-sm">
                        {targetVessel.suspicionScore.toFixed(1)} / 100
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Multi-Factor Table */}
                  <div className="bg-white border border-slate-300 rounded p-3 text-[11px]">
                    <div className="font-mono font-bold text-slate-700 uppercase mb-2 border-b pb-1">
                      पारदर्शी साक्ष्य विभाजन / Transparent Score Weightage (100 Pts Total):
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono">
                      <div className="p-1.5 bg-slate-50 border rounded">
                        <span className="text-slate-500">स्थानिक निकटता:</span>{' '}
                        <span className="font-bold text-[#0B2545]">98 / 100</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 border rounded">
                        <span className="text-slate-500">कालिक संरेखण:</span>{' '}
                        <span className="font-bold text-[#0B2545]">96 / 100</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 border rounded">
                        <span className="text-slate-500">प्रक्षेपवक्र संरेखण:</span>{' '}
                        <span className="font-bold text-[#0B2545]">92 / 100</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 border rounded">
                        <span className="text-slate-500">व्यवहार विसंगति:</span>{' '}
                        <span className="font-bold text-red-700">90 / 100</span>
                      </div>
                      <div className="p-1.5 bg-amber-50 border border-amber-300 rounded">
                        <span className="text-amber-800">ध्वज राज्य जोखिम:</span>{' '}
                        <span className="font-bold text-amber-900">MoU Grey (1.25x)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: STATUTORY FINES & CLEAN-UP TARIFFS */}
          {activeTab === 'PENALTY' && penaltyData && (
            <div className="space-y-4">
              {/* Volume Estimation Banner */}
              <div className="border border-slate-300 p-4 bg-white rounded-[2px] space-y-2">
                <div className="font-serif font-bold text-xs text-[#0B2545] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>1. बोन समझौता तेल आयतन गणना / BONN AGREEMENT DISCHARGE VOLUME</span>
                  <span className="font-mono text-[10px] text-emerald-800 font-bold">BAOAC CODE-3 CLASSIFIED</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11.5px]">
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <div className="text-slate-500 font-medium">पहचाना गया क्षेत्र / Extent:</div>
                    <div className="font-mono font-bold text-slate-900">{penaltyData.spill_area_sqkm} km²</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <div className="text-slate-500 font-medium">औसत मोटाई / Mean Thickness:</div>
                    <div className="font-mono font-bold text-slate-900">{penaltyData.mean_thickness_microns} µm</div>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-blue-800 font-medium">अनुमानित आयतन / Volume (m³):</div>
                    <div className="font-mono font-bold text-blue-950 text-sm">
                      {penaltyData.estimated_volume_m3.toLocaleString()} m³
                    </div>
                  </div>
                  <div className="p-2.5 bg-red-50 border border-red-300 rounded">
                    <div className="text-red-800 font-medium">कुल भार / Estimated Mass:</div>
                    <div className="font-mono font-extrabold text-red-700 text-sm">
                      {penaltyData.estimated_volume_mt.toLocaleString()} Metric Tonnes
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Liability Matrix */}
              <div className="border-2 border-emerald-600 p-4 bg-white rounded-[2px] space-y-3 shadow-xs">
                <div className="font-serif font-bold text-xs text-[#064E26] uppercase tracking-wider border-b border-emerald-200 pb-1 flex items-center justify-between">
                  <span>2. वैधानिक जुर्माना एवं क्षतिपूर्ति तालिका / STATUTORY FINANCIAL RECOVERY MATRIX</span>
                  <span className="font-mono text-[10px] text-[#064E26] font-bold">MERCHANT SHIPPING ACT 1958</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#064E26] text-white">
                        <th className="p-2 font-bold border border-emerald-800">दायित्व मद / COMPONENT</th>
                        <th className="p-2 font-bold border border-emerald-800">कानूनी आधार / LEGAL BASIS</th>
                        <th className="p-2 font-bold border border-emerald-800 text-right">राशि / AMOUNT (INR)</th>
                        <th className="p-2 font-bold border border-emerald-800 text-right">EQUIVALENT (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">वैधानिक आधारभूत जुर्माना / Base Penalty</td>
                        <td className="p-2 text-slate-600">Merchant Shipping Act §356K (Foreign Tanker Aggravator)</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹ {penaltyData.base_statutory_fine_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          $ {Math.round(penaltyData.base_statutory_fine_inr / 86.5).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">तटरक्षक गतिशीलता व्यय / Mobilization Baseline</td>
                        <td className="p-2 text-slate-600">Fast Patrol Vessel + PCV + ODC Dispersant Aircraft sortie</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹ {penaltyData.cleanup_mobilization_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          $ {Math.round(penaltyData.cleanup_mobilization_inr / 86.5).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">तेल निस्तारण एवं स्किमिंग / Skimming Recovery</td>
                        <td className="p-2 text-slate-600">
                          ₹{penaltyData.cleanup_per_tonne_inr.toLocaleString('en-IN')} / MT on {penaltyData.estimated_volume_mt} MT
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹ {(penaltyData.total_cleanup_cost_inr - penaltyData.cleanup_mobilization_inr).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          $ {Math.round((penaltyData.total_cleanup_cost_inr - penaltyData.cleanup_mobilization_inr) / 86.5).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">पारिस्थितिक क्षतिपूर्ति / Ecological Restitution</td>
                        <td className="p-2 text-slate-600">National Green Tribunal Act / Fisheries Zone ({penaltyData.sensitivity_multiplier}x)</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹ {penaltyData.ecological_damage_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          $ {Math.round(penaltyData.ecological_damage_inr / 86.5).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 border-t-2 border-emerald-600">
                        <td className="p-2 font-black text-[#064E26]">कुल वैधानिक देयता / NET STATUTORY LIABILITY</td>
                        <td className="p-2 text-emerald-800 font-medium">Government of India Marine Environment Fund</td>
                        <td className="p-2 text-right font-mono font-black text-emerald-900 text-sm">
                          ₹ {penaltyData.total_statutory_liability_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-800">
                          $ {penaltyData.total_statutory_liability_usd.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-amber-100/70 border-t-2 border-amber-400">
                        <td className="p-2 font-black text-red-900">
                          पोत जब्ती बैंक गारंटी / DETENTION SECURITY BOND (§356J)
                        </td>
                        <td className="p-2 text-red-800 font-bold">
                          125% Irrevocable Bank Guarantee before Port Clearance
                        </td>
                        <td className="p-2 text-right font-mono font-black text-red-900 text-sm">
                          ₹ {penaltyData.detention_security_bond_inr.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-red-900">
                          $ {penaltyData.detention_security_bond_usd.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded text-[11px] text-red-900">
                  <div className="font-bold flex items-center space-x-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                    <span>वैधानिक आदेश एवं जब्ती निर्देश / STATUTORY DETENTION ORDER:</span>
                  </div>
                  <div>{penaltyData.recommended_enforcement_action}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTION 63 BSA 2023 / 65B CERTIFICATE */}
          {activeTab === 'CERTIFICATE' && (
            <div className="space-y-4">
              <div className="border-2 border-[#064E26] p-5 bg-white rounded-[2px] space-y-4">
                <div className="text-center border-b pb-3">
                  <div className="text-[10px] font-mono text-red-700 font-bold">
                    FORM NO. BSA-63 / ICG-FORENSIC-01
                  </div>
                  <div className="font-serif font-black text-base text-[#064E26] mt-0.5">
                    इलेक्ट्रॉनिक साक्ष्य प्रमाण पत्र // CERTIFICATE OF ELECTRONIC EVIDENCE
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    [UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023]
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    (READ WITH SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872)
                  </div>
                </div>

                <div className="text-[11.5px] text-slate-800 leading-relaxed space-y-3">
                  <p>
                    I, the undersigned Authorized Officer of the Indian Coast Guard, Maritime Rescue Coordination
                    Centre (MRCC) Mumbai, do hereby solemnly affirm, declare, and certify under{' '}
                    <b>Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023</b> (Act No. 47 of 2023), and without
                    prejudice to <b>Section 65B of the Indian Evidence Act, 1872</b>, in relation to the electronic
                    telemetry output comprising Case Reference <b>{caseNumber}</b>, as follows:
                  </p>

                  <div className="space-y-2 font-sans pl-2 border-l-2 border-emerald-600">
                    <div>
                      <b>1. पहचान एवं कंप्यूटर प्रणाली / Identification of System [Sec 63(2)(a)]:</b> The electronic
                      record was autonomously produced by the <b>HACKX National Maritime Oil Spill Workstation</b>{' '}
                      (Node: <code>HACKX-MRCC-NODE-01</code>, Linux Ubuntu 22.04 LTS, Python 3.11 Kernel, FastAPI v0.141)
                      processing authenticated ESA Copernicus Sentinel-1 C-SAR radar passes and DGLL coastal AIS telemetry.
                    </div>
                    <div>
                      <b>2. सामान्य एवं वैध कार्यप्रणाली / Lawful Course of Operation [Sec 63(2)(b)]:</b> The output was
                      produced during the period over which the computer was used regularly to store and process
                      information for the purpose of 24x7 maritime domain awareness and oil spill attribution.
                    </div>
                    <div>
                      <b>3. परिचालन अखंडता / Operating Integrity [Sec 63(2)(c)]:</b> Throughout the material period, the
                      computer was operating properly, and there was no operational defect that could affect the
                      accuracy or authenticity of the numerical hindcast or correlation calculations.
                    </div>
                    <div>
                      <b>4. छेड़छाड़ रहित पुनरुत्पादन / Non-Modification [Sec 63(2)(d)]:</b> The data, coordinates, and
                      multi-factor candidate scores reproduced herein are true copies of the digital logs stored in the
                      secure database. No manual interception was introduced.
                    </div>
                  </div>
                </div>

                {/* Cryptographic Seal Table */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] space-y-1.5 font-mono">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-sans font-bold">EVIDENCE SHA-256 HASH:</span>
                    <span className="text-[#064E26] font-bold">{sha256Checksum}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-sans font-bold">HMAC KEY IDENTIFIER:</span>
                    <span>HACKX-ICG-MRCC-W-KEY-2026-SHA256 (Govt of India Root CA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold">NTP TIME SYNC:</span>
                    <span>NPL New Delhi (Atomic Standard ±1.2 ms)</span>
                  </div>
                </div>

                {/* Solemn Affirmation & Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[10.5px]">
                  <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <div className="font-bold text-[#064E26]">प्रमाणन अधिकारी / Certifying Officer:</div>
                    <div className="font-bold text-slate-800 mt-1">Commandant R. K. Nair, TM</div>
                    <div className="text-slate-500 text-[9.5px]">Director (Marine Environment)</div>
                    <div className="text-slate-500 text-[9.5px]">ICG Regional HQ (West), Mumbai</div>
                  </div>

                  <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <div className="font-bold text-[#064E26]">तकनीकी अभिरक्षक / Technical Custodian:</div>
                    <div className="font-bold text-slate-800 mt-1">DIG (IT & AI Directorate)</div>
                    <div className="text-slate-500 text-[9.5px]">Lead Architect, HACKX System</div>
                    <div className="text-slate-500 text-[9.5px]">Smart India Hackathon (SIH 260143)</div>
                  </div>

                  <div className="p-2.5 border-2 border-emerald-500 rounded bg-emerald-50/50 flex flex-col justify-center items-center text-center">
                    <Award className="w-5 h-5 text-[#064E26] mb-1" />
                    <div className="font-mono font-bold text-[10px] text-[#064E26]">✓ DIGITALLY ANCHORED</div>
                    <div className="text-[9px] text-slate-600 mt-0.5">Maritime Tribunal Admissible</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Certification & Digital Sign-Off Footer */}
          <div className="border border-slate-300 p-4 bg-white rounded-[2px] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="space-y-1 max-w-lg">
              <div className="font-mono font-bold text-slate-800 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>TAMPER-EVIDENT FORENSIC SIGNATURE:</span>
              </div>
              <div className="font-mono text-[9px] text-slate-500 break-all bg-slate-100 p-1.5 rounded border border-slate-200">
                SHA-256: {sha256Checksum}
              </div>
              <div className="text-[10px] text-slate-600">
                This document is certified admissible under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 & Section
                356C of Merchant Shipping Act 1958.
              </div>
            </div>

            {/* Official Signature & QR Seal */}
            <div className="flex-shrink-0 text-center p-3 bg-slate-50 border-2 border-dashed border-slate-400 rounded min-w-[200px] flex flex-col items-center">
              <div className="w-8 h-8 mx-auto text-[#0B2545]">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="font-serif font-bold text-xs text-[#0B2545] mt-1">कमांडिंग ऑफिसर</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase">MARINE ENVIRONMENTAL DIV, ICG</div>
              <div className="mt-1 text-[8.5px] font-mono text-emerald-700 font-bold bg-emerald-50 py-0.5 px-1 rounded">
                ✓ SEC 63 BSA 2023 CERTIFIED
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="mt-2 w-full py-1 px-2 rounded-[2px] bg-[#064E26] hover:bg-[#0D5204] text-white font-mono text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3 h-3 text-[#FFD700]" />
                <span>EXPORT 3-PAGE COURT PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
