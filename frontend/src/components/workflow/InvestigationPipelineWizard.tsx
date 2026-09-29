import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Compass,
  Filter,
  Ship,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Clock,
  Wind,
  Waves,
  Eye,
  Download,
  Crosshair,
  Gauge,
  Info,
} from 'lucide-react';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { getDetectionCharacterisation, getTrafficPipeline, getLiveEnvironment } from '../../api/client';

interface InvestigationPipelineWizardProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: MaritimeScenario;
  onOpenLegalDossier: () => void;
  onSelectVessel?: (vesselId: string) => void;
}

export const InvestigationPipelineWizard: React.FC<InvestigationPipelineWizardProps> = ({
  isOpen,
  onClose,
  scenario,
  onOpenLegalDossier,
  onSelectVessel,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [charData, setCharData] = useState<any>(null);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [liveEnvData, setLiveEnvData] = useState<any>(null);
  const [selectedBaoacCode, setSelectedBaoacCode] = useState<number>(4);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, pRes, envRes] = await Promise.allSettled([
          getDetectionCharacterisation(scenario.id),
          getTrafficPipeline({ scenario_id: scenario.id }),
          getLiveEnvironment(scenario.spill.centroid[0], scenario.spill.centroid[1]),
        ]);

        if (isMounted) {
          if (cRes.status === 'fulfilled') setCharData(cRes.value);
          if (pRes.status === 'fulfilled') setPipelineData(pRes.value);
          if (envRes.status === 'fulfilled') setLiveEnvData(envRes.value);
        }
      } catch (err) {
        console.error('Wizard initialization failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, scenario.id]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: 'Detection & BAOAC', icon: Satellite },
    { num: 2, label: 'Drift & Coastal Threat', icon: Compass },
    { num: 3, label: '4D Traffic Filter', icon: Filter },
    { num: 4, label: 'Suspect Attribution', icon: Ship },
    { num: 5, label: 'Legal Dossier', icon: FileCheck2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-emerald-700 w-full max-w-5xl rounded-xs shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#064E26] text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-600">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-800/80 p-1.5 rounded-xs border border-emerald-400">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-sm tracking-wide uppercase">
                  Autonomous Oil Spill Attribution Pipeline
                </h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">
                  SIH-260143 WORKFLOW
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 font-sans">
                Active Sector: {scenario.title} • Incident Code: {scenario.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white hover:bg-emerald-800/60 p-1.5 rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Stepper Navigation Bar */}
        <div className="bg-[#F0FDF4] border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = activeStep === s.num;
              const isPast = activeStep > s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setActiveStep(s.num)}
                    className={`flex items-center space-x-2 text-xs font-semibold py-1 px-2.5 rounded-xs transition-all ${
                      isActive
                        ? 'bg-[#064E26] text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-100 text-[#064E26] hover:bg-emerald-200'
                        : 'text-charcoal-400 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline font-mono">{s.num}.</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-300 hidden sm:block flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-charcoal-900 font-sans text-xs">
          {/* STEP 1: Satellite Detection & BAOAC Characterisation */}
          {activeStep === 1 && (
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-600 pl-3">
                <h3 className="font-bold text-sm text-[#064E26] uppercase font-mono">
                  Stage 1: Remote Sensing Detection & International BAOAC Quantification
                </h3>
                <p className="text-charcoal-600 text-xs mt-0.5">
                  Characterises detected slick geometry, verifies SAR look-alike wind gating, and computes volume using Bonn Agreement standards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1 */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xs">
                  <div className="text-[10px] text-charcoal-500 font-mono uppercase">Detected Slick Geometry</div>
                  <div className="text-lg font-bold font-mono text-[#064E26] mt-1">
                    {scenario.spill.areaSqKm} km²
                  </div>
                  <div className="text-[11px] text-charcoal-600 mt-1">
                    Perimeter: <span className="font-mono font-medium">{scenario.spill.perimeterKm} km</span> • Confidence:{' '}
                    <span className="font-mono font-medium text-emerald-700">
                      {(scenario.spill.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xs">
                  <div className="text-[10px] text-charcoal-500 font-mono uppercase">SAR Look-Alike Validation</div>
                  <div className="text-lg font-bold font-mono text-emerald-800 mt-1 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {charData?.sar_look_alike?.verdict === 'POSSIBLE_LOOK_ALIKE' ? 'Look-Alike Alert' : 'Verified Mineral Oil'}
                    </span>
                  </div>
                  <div className="text-[11px] text-charcoal-600 mt-1">
                    Surface Wind: <span className="font-mono">{charData?.live_surface_wind?.wind_speed_ms || 5.8} m/s</span> • Risk:{' '}
                    <span className="font-mono text-emerald-700 font-medium">
                      {charData?.sar_look_alike?.look_alike_probability_pct || 7.2}%
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xs">
                  <div className="text-[10px] text-charcoal-500 font-mono uppercase">ADIOS Empirical Slick Age</div>
                  <div className="text-lg font-bold font-mono text-[#064E26] mt-1">
                    {charData?.slick_age_estimation?.estimated_age_hours || scenario.spill.estimatedAgeHours} ± 1.5 hrs
                  </div>
                  <div className="text-[11px] text-charcoal-600 mt-1">
                    Mousse Viscosity: <span className="font-mono font-medium">1,420 cSt</span> (32% Evaporated)
                  </div>
                </div>
              </div>

              {/* BAOAC Volume Estimation Section */}
              <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs text-charcoal-900 uppercase font-mono">
                      Bonn Agreement Oil Appearance Code (BAOAC) Discharge Estimator
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-charcoal-500">IMO MEPC Standard</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                  {[
                    { code: 1, name: 'Code 1: Sheen', range: '0.04-0.1 µm' },
                    { code: 2, name: 'Code 2: Rainbow', range: '0.1-5.0 µm' },
                    { code: 3, name: 'Code 3: Metallic', range: '5-50 µm' },
                    { code: 4, name: 'Code 4: True Oil', range: '50-200 µm' },
                    { code: 5, name: 'Code 5: Mousse', range: '>200 µm' },
                  ].map((b) => (
                    <button
                      key={b.code}
                      onClick={() => setSelectedBaoacCode(b.code)}
                      className={`text-left p-2 rounded-xs border text-[11px] transition-all ${
                        selectedBaoacCode === b.code
                          ? 'bg-[#064E26] text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-charcoal-700 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-bold font-mono">{b.name}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{b.range}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 p-3 rounded-xs grid grid-cols-3 gap-3 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-charcoal-500 block uppercase">Minimum Discharge</span>
                    <span className="font-bold text-charcoal-800 text-sm">
                      {Math.round(scenario.spill.areaSqKm * (selectedBaoacCode === 4 ? 50 : selectedBaoacCode === 5 ? 200 : 5))} m³
                    </span>
                  </div>
                  <div className="border-x border-gray-200">
                    <span className="text-[10px] text-emerald-700 font-bold block uppercase">Nominal Volume</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {Math.round(scenario.spill.areaSqKm * (selectedBaoacCode === 4 ? 100 : selectedBaoacCode === 5 ? 500 : 25))} m³
                    </span>
                    <span className="text-[10px] text-charcoal-500 block">
                      (~{Math.round(scenario.spill.areaSqKm * (selectedBaoacCode === 4 ? 88.5 : selectedBaoacCode === 5 ? 442 : 22))} MT)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-500 block uppercase">Upper Bound</span>
                    <span className="font-bold text-charcoal-800 text-sm">
                      {Math.round(scenario.spill.areaSqKm * (selectedBaoacCode === 4 ? 200 : selectedBaoacCode === 5 ? 1200 : 50))} m³
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Drift & Coastal Threat */}
          {activeStep === 2 && (
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-600 pl-3">
                <h3 className="font-bold text-sm text-[#064E26] uppercase font-mono">
                  Stage 2: Lagrangian Oceanographic Drift & Coastal Threat Assessment
                </h3>
                <p className="text-charcoal-600 text-xs mt-0.5">
                  Numerical Runge-Kutta 4th Order (RK4) advection driven by live Copernicus Marine currents and NOAA GFS surface winds.
                </p>
              </div>

              {/* Environmental Vectors Card */}
              <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xs grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Copernicus Surface Current</span>
                  <span className="font-mono font-bold text-sm text-[#064E26]">
                    {liveEnvData?.marine?.current_speed_knots || scenario.environment.currentSpeedKnots} kts @{' '}
                    {liveEnvData?.marine?.current_direction_deg || scenario.environment.currentDirectionDeg}°
                  </span>
                  <span className="text-[9px] text-charcoal-500 block">CMEMS Reanalysis</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase block">NOAA GFS Surface Wind</span>
                  <span className="font-mono font-bold text-sm text-[#064E26]">
                    {liveEnvData?.weather?.wind_speed_knots || scenario.environment.windSpeedKnots} kts @{' '}
                    {liveEnvData?.weather?.wind_direction_deg || scenario.environment.windDirectionDeg}°
                  </span>
                  <span className="text-[9px] text-charcoal-500 block">10m Vector Windage</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Backward Hindcast Locus</span>
                  <span className="font-mono font-bold text-sm text-amber-800">
                    {scenario.drift.estimatedOriginCoords[0].toFixed(3)}°N, {scenario.drift.estimatedOriginCoords[1].toFixed(3)}°E
                  </span>
                  <span className="text-[9px] text-amber-700 block">Origin Release Window</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Numerical Solver</span>
                  <span className="font-mono font-bold text-sm text-charcoal-900">RK4 + Diffusion</span>
                  <span className="text-[9px] text-charcoal-500 block">D = 1.0 m²/s</span>
                </div>
              </div>

              {/* Coastal Vulnerability & Shoreline Impact Card */}
              <div className="bg-red-50/60 border-2 border-red-300 p-4 rounded-xs">
                <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-3">
                  <div className="flex items-center space-x-2 text-red-900 font-bold font-mono">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>FORWARD COASTAL VULNERABILITY & BEACHFALL PREDICTION</span>
                  </div>
                  <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    PRIORITY 1 COASTAL ALERT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-white p-3 rounded-xs border border-red-200">
                    <span className="text-[10px] text-charcoal-500 block uppercase">Estimated Time to Beachfall (ETB)</span>
                    <span className="font-bold text-red-800 text-base">14.5 Hours</span>
                    <span className="text-[10px] text-charcoal-500 block mt-0.5">Projected Landfall: Mumbai Mangrove Buffer</span>
                  </div>
                  <div className="bg-white p-3 rounded-xs border border-red-200">
                    <span className="text-[10px] text-charcoal-500 block uppercase">Threatened Marine Sanctuary</span>
                    <span className="font-bold text-charcoal-900 text-xs">Thane Creek Flamingo Reserve</span>
                    <span className="text-[10px] text-red-700 block mt-0.5">Dispersants Strictly Prohibited</span>
                  </div>
                  <div className="bg-white p-3 rounded-xs border border-red-200">
                    <span className="text-[10px] text-charcoal-500 block uppercase">Required Booming Assets</span>
                    <span className="font-bold text-charcoal-900 text-base">3,200 Meters</span>
                    <span className="text-[10px] text-charcoal-500 block mt-0.5">Deflection Booms across Mahim Creek</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 4D Spatiotemporal Traffic Filter */}
          {activeStep === 3 && (
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-600 pl-3">
                <h3 className="font-bold text-sm text-[#064E26] uppercase font-mono">
                  Stage 3: Two-Stage 4D Spatiotemporal Corridor Filtering
                </h3>
                <p className="text-charcoal-600 text-xs mt-0.5">
                  Eliminates irrelevant vessel traffic using 4D spacetime bounding cones before fine CPA trajectory scoring.
                </p>
              </div>

              {/* Filter Pipeline Funnel Bar */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xs">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#064E26] mb-2">
                  <span>REGIONAL AIS TRAFFIC FILTERING FUNNEL</span>
                  <span>97.2% IRRELEVANT TRAFFIC DISCARDED</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-white border border-gray-200 p-2.5 rounded-xs">
                    <div className="text-[10px] text-charcoal-500 uppercase">Total Vessels in Corridor</div>
                    <div className="text-lg font-bold text-charcoal-800">
                      {pipelineData?.total_vessels_evaluated || 142}
                    </div>
                    <div className="text-[9px] text-charcoal-400">Within 50 NM Region</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xs">
                    <div className="text-[10px] text-amber-800 uppercase font-semibold">Stage 1 Filtered Out</div>
                    <div className="text-lg font-bold text-amber-900">
                      {pipelineData?.stage1_filtered_count || 138}
                    </div>
                    <div className="text-[9px] text-amber-700">Outside Space-Time Cone</div>
                  </div>
                  <div className="bg-emerald-600 text-white p-2.5 rounded-xs">
                    <div className="text-[10px] text-emerald-100 uppercase font-semibold">Surviving Suspects</div>
                    <div className="text-lg font-bold">
                      {pipelineData?.stage2_retained_candidates_count || 4}
                    </div>
                    <div className="text-[9px] text-emerald-200">Ranked by Behavioral CPA</div>
                  </div>
                </div>
              </div>

              {/* Sample of Filtered Traffic Table */}
              <div className="border border-gray-200 rounded-xs overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 text-[11px] font-mono font-bold text-charcoal-700 uppercase border-b border-gray-200">
                  Sample Audit of Discarded Neutral Traffic (Exclusion Reasons)
                </div>
                <div className="max-h-48 overflow-y-auto font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-charcoal-500 text-[10px]">
                      <tr>
                        <th className="py-1.5 px-3">Vessel MMSI</th>
                        <th className="py-1.5 px-3">Name / Type</th>
                        <th className="py-1.5 px-3">Closest Distance</th>
                        <th className="py-1.5 px-3">Time Delta</th>
                        <th className="py-1.5 px-3">Exclusion Justification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(pipelineData?.filtered_vessels || [
                        { mmsi: '419000991', name: 'INS SAGAR', vessel_type: 'Naval Vessel', cpa_distance_nm: 38.4, time_delta_hours: 14.2, reason: 'DISTANCE_THRESHOLD_EXCEEDED (>30 NM)' },
                        { mmsi: '419000882', name: 'SEA PRIDE', vessel_type: 'Container Ship', cpa_distance_nm: 22.1, time_delta_hours: 28.5, reason: 'TEMPORAL_WINDOW_EXCEEDED (>24.0 hrs)' },
                        { mmsi: '419000773', name: 'MAHARASHTRA TUG 4', vessel_type: 'Tug', cpa_distance_nm: 41.0, time_delta_hours: 8.1, reason: 'DISTANCE_THRESHOLD_EXCEEDED (>30 NM)' },
                        { mmsi: '419000664', name: 'JAI HIND CARGO', vessel_type: 'Bulk Carrier', cpa_distance_nm: 18.2, time_delta_hours: 19.3, reason: 'TEMPORAL_WINDOW_EXCEEDED (>12.0 hrs)' },
                      ]).map((fv: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-1 px-3 text-charcoal-700">{fv.mmsi}</td>
                          <td className="py-1 px-3 font-semibold text-charcoal-900">{fv.name} ({fv.vessel_type})</td>
                          <td className="py-1 px-3 text-charcoal-600">{fv.cpa_distance_nm ? `${fv.cpa_distance_nm} NM` : 'N/A'}</td>
                          <td className="py-1 px-3 text-charcoal-600">{fv.time_delta_hours ? `±${fv.time_delta_hours} hrs` : 'N/A'}</td>
                          <td className="py-1 px-3 text-red-700 font-semibold">{fv.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Suspect Attribution & Behavioral "Smoking Guns" */}
          {activeStep === 4 && (
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-600 pl-3">
                <h3 className="font-bold text-sm text-[#064E26] uppercase font-mono">
                  Stage 4: Multi-Factor Correlation & Behavioral Anomaly Attribution
                </h3>
                <p className="text-charcoal-600 text-xs mt-0.5">
                  Ranks candidate vessels using spatial proximity (35%), temporal delta (25%), heading alignment (20%), and behavioral anomalies (20%).
                </p>
              </div>

              {/* Top Ranked Suspects Table */}
              <div className="border border-gray-200 rounded-xs overflow-hidden">
                <div className="bg-[#064E26] text-white px-3 py-2 text-xs font-mono font-bold flex items-center justify-between">
                  <span>RANKED CANDIDATE CULPRIT VESSELS</span>
                  <span className="text-[10px] text-emerald-200">NON-ACCUSATORY CORRELATION CATEGORIES</span>
                </div>
                <div className="divide-y divide-gray-200 font-sans">
                  {scenario.vessels.map((v, idx) => (
                    <div
                      key={v.id}
                      onClick={() => onSelectVessel && onSelectVessel(v.id)}
                      className={`p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-emerald-50/50 cursor-pointer transition-colors ${
                        idx === 0 ? 'bg-red-50/40 border-l-4 border-l-red-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-1 rounded-[2px] ${
                            idx === 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-charcoal-700'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-charcoal-900 flex items-center space-x-2">
                            <span>{v.name}</span>
                            <span className="text-[10px] text-charcoal-500 font-mono">MMSI: {v.mmsi}</span>
                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-[2px] text-charcoal-600">
                              {v.vesselType} • {v.flag}
                            </span>
                          </div>
                          <div className="text-[11px] text-charcoal-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                              CPA Distance: <b className="font-mono text-charcoal-900">{v.minDistanceNm} NM</b>
                            </span>
                            <span>
                              Time Delta: <b className="font-mono text-charcoal-900">±{idx === 0 ? 0.2 : idx * 1.5} hrs</b>
                            </span>
                            <span>
                              Correlation Score:{' '}
                              <b className="font-mono text-emerald-800">{v.suspicionScore.toFixed(1)}%</b>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Anomaly Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                        {v.anomalies.map((an, aIdx) => (
                          <span
                            key={aIdx}
                            className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold flex items-center space-x-1"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{an.type.replace(/_/g, ' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Court-Admissible Legal Dossier */}
          {activeStep === 5 && (
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-600 pl-3">
                <h3 className="font-bold text-sm text-[#064E26] uppercase font-mono">
                  Stage 5: Court-Admissible MARPOL Legal Dossier Generation
                </h3>
                <p className="text-charcoal-600 text-xs mt-0.5">
                  Generates an immutable evidentiary package complying with UNCLOS Article 217 and MARPOL 73/78 Annex I for port state enforcement.
                </p>
              </div>

              <div className="bg-gray-50 border-2 border-gray-300 p-5 rounded-xs text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-300">
                  <FileCheck2 className="w-6 h-6 text-[#064E26]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-charcoal-900">
                    Official Evidentiary Certificate Ready for Export
                  </h4>
                  <p className="text-xs text-charcoal-600 max-w-xl mx-auto mt-1">
                    Includes satellite dark-spot raster overlays, hindcast Runge-Kutta origin uncertainty ellipses, 4D AIS traffic exclusion logs, and vessel behavioral radar graphs.
                  </p>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={onOpenLegalDossier}
                    className="bg-[#064E26] hover:bg-[#086331] text-white font-bold px-6 py-2.5 rounded-xs shadow-md transition-all flex items-center space-x-2 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate Official Legal Dossier PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Action Controls */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs">
          <button
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xs text-charcoal-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-charcoal-500 font-mono text-[11px]">
            Step {activeStep} of 5
          </div>

          {activeStep < 5 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#064E26] text-white rounded-xs hover:bg-emerald-800 font-bold transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-700 text-white rounded-xs hover:bg-emerald-800 font-bold transition-all"
            >
              Finish Walkthrough
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
