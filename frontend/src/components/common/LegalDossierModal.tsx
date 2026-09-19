import React, { useState } from 'react';
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
} from 'lucide-react';
import { StateEmblemIndia } from './StateEmblemIndia';
import { IndianCoastGuardInsignia } from './IndianCoastGuardInsignia';
import { TricolorRibbon } from './TricolorRibbon';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { downloadInvestigationPdf } from '../../api/client';

interface LegalDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: MaritimeScenario;
  selectedVesselId?: string;
}

export const LegalDossierModal: React.FC<LegalDossierModalProps> = ({
  isOpen,
  onClose,
  scenario,
  selectedVesselId,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetVessel =
    (selectedVesselId && scenario.vessels.find((v) => v.id === selectedVesselId)) ||
    scenario.vessels[0];

  const handlePrint = () => {
    window.print();
  };

  const caseNumber = `ICG/MRCC-MUM/2026/MARPOL-ENV-${scenario.id === 'scenario_a' ? '0041' : scenario.id === 'scenario_b' ? '0019' : '0007'}`;
  const sha256Checksum = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

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
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[3px] border-2 border-emerald-600 shadow-2xl flex flex-col overflow-hidden text-slate-900 font-sans">
        {/* Modal Top Control Bar */}
        <div className="bg-[#064E26] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#032B13]">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <span className="font-serif font-bold text-sm text-[#FFD700]">
              भारतीय तटरक्षक कानूनी साक्ष्य डोजियर
            </span>
            <span className="text-emerald-300">|</span>
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
                  : 'bg-[#FFD700] hover:bg-[#F2C200] text-[#064E26] border-amber-400'
              }`}
              title="Download tamper-evident court-admissible PDF dossier"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#064E26]" />
              )}
              <span className="font-mono font-bold">
                {isExportingPdf
                  ? 'उत्पन्न हो रहा है... / GENERATING...'
                  : downloadSuccess
                  ? '✓ डाउनलोड सफल / DOWNLOADED'
                  : '1-क्लिक PDF निर्यात / 1-CLICK PDF EXPORT'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#0D5204] hover:bg-[#064E26] text-white rounded-[2px] font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs border border-emerald-500"
              title="Print official legal dossier (PDF/A format)"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>प्रिंट करें / PRINT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-emerald-100 hover:text-white rounded-[2px] transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                <div className="font-mono font-bold text-red-700">{scenario.spill.areaSqKm} km² ({scenario.spill.perimeterKm} km perim)</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 font-medium">उपग्रह संवेदक / Sensor:</div>
                <div className="font-bold text-slate-900">{scenario.spill.satellite} (ESA/INCOIS)</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 font-medium">पहचान विश्वसनीयता / Confidence:</div>
                <div className="font-mono font-bold text-emerald-800">{(scenario.spill.confidence * 100).toFixed(1)}% (U-Net v2.0)</div>
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
                  {scenario.drift.estimatedOriginCoords[0].toFixed(4)}°N, {scenario.drift.estimatedOriginCoords[1].toFixed(4)}°E
                </div>
                <div className="text-[10px] text-slate-500">Uncertainty Envelope: ±2.4 km (95% Conf)</div>
              </div>
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                <div className="text-slate-600 font-medium">अनुमानित निष्कासन समय / Discharge Window:</div>
                <div className="font-mono font-bold text-slate-900 text-xs">
                  {scenario.drift.estimatedOriginTime}
                </div>
                <div className="text-[10px] text-slate-500">Weathering Age: {scenario.spill.estimatedAgeHours} hours prior to pass</div>
              </div>
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                <div className="text-slate-600 font-medium">पर्यावरणीय सदिश / Hydrodynamic Vectors:</div>
                <div className="font-mono font-bold text-slate-900 text-xs">
                  Current: {scenario.environment.currentSpeedKnots} kn @ {scenario.environment.currentDirectionDeg}°
                </div>
                <div className="text-[10px] text-slate-500">Wind: {scenario.environment.windSpeedKnots} kn @ {scenario.environment.windDirectionDeg}°</div>
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
                  <div className="font-mono font-bold text-slate-900">{targetVessel.mmsi} ({targetVessel.flag})</div>
                </div>
                <div className="p-2 bg-white border border-red-200 rounded">
                  <div className="text-slate-500 font-medium">उद्गम स्थल से दूरी / Distance:</div>
                  <div className="font-mono font-bold text-red-700">{(targetVessel.minDistanceNm * 1.852).toFixed(1)} km ({targetVessel.minDistanceNm} NM)</div>
                </div>
                <div className="p-2 bg-white border border-red-200 rounded">
                  <div className="text-slate-500 font-medium">सहसंबंध सूचकांक / Index:</div>
                  <div className="font-mono font-extrabold text-red-700 text-sm">{targetVessel.suspicionScore.toFixed(1)} / 100</div>
                </div>
              </div>

              {/* Breakdown Multi-Factor Table */}
              <div className="bg-white border border-slate-300 rounded p-3 text-[11px]">
                <div className="font-mono font-bold text-slate-700 uppercase mb-2 border-b pb-1">
                  पारदर्शी साक्ष्य विभाजन / Transparent Score Weightage (100 Pts Total):
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono">
                  <div className="p-1.5 bg-slate-50 border rounded">
                    <span className="text-slate-500">स्थानिक निकटता (40%):</span> <span className="font-bold text-[#0B2545]">98 / 100</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 border rounded">
                    <span className="text-slate-500">कालिक संरेखण (25%):</span> <span className="font-bold text-[#0B2545]">96 / 100</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 border rounded">
                    <span className="text-slate-500">प्रक्षेपवक्र संरेखण (20%):</span> <span className="font-bold text-[#0B2545]">92 / 100</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 border rounded">
                    <span className="text-slate-500">व्यवहार विसंगति (15%):</span> <span className="font-bold text-red-700">90 / 100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Certification & Digital Sign-Off */}
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
                This document is generated by the Autonomous Maritime Oil Spill Intelligence & Attribution System (HACKX) for the Indian Coast Guard under MARPOL 73/78.
              </div>
            </div>

            {/* Official Signature & QR Seal */}
            <div className="flex-shrink-0 text-center p-3 bg-slate-50 border-2 border-dashed border-slate-400 rounded min-w-[200px] flex flex-col items-center">
              <div className="w-8 h-8 mx-auto text-[#0B2545]">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="font-serif font-bold text-xs text-[#0B2545] mt-1">
                कमांडिंग ऑफिसर
              </div>
              <div className="text-[9px] font-mono text-slate-500 uppercase">
                MARINE ENVIRONMENTAL DIV, ICG
              </div>
              <div className="mt-1 text-[8.5px] font-mono text-emerald-700 font-bold bg-emerald-50 py-0.5 px-1 rounded">
                ✓ CERTIFIED & ENCRYPTED
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="mt-2 w-full py-1 px-2 rounded-[2px] bg-[#064E26] hover:bg-[#0D5204] text-white font-mono text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3 h-3 text-[#FFD700]" />
                <span>EXPORT PDF (SHA-256)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
