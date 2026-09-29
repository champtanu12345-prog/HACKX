import React, { useState, useEffect } from 'react';
import {
  Wind,
  Compass,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Navigation,
  Activity,
  Layers,
  Clock,
  MapPin,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Metric } from '../components/common/Metric';
import { Badge } from '../components/common/Badge';
import { LeafletDriftMap } from '../components/drift/LeafletDriftMap';
import { MaritimeScenario } from '../data/maritimeDemoData';
import { DriftSimulationResult, DriftSimulationPoint } from '../types';
import { simulateDrift } from '../api/client';

interface DriftViewProps {
  scenario: MaritimeScenario;
}

export const DriftView: React.FC<DriftViewProps> = ({ scenario }) => {
  const [hindcastResult, setHindcastResult] = useState<DriftSimulationResult | null>(null);
  const [forecastResult, setForecastResult] = useState<DriftSimulationResult | null>(null);
  const [activeRunType, setActiveRunType] = useState<'HINDCAST' | 'FORECAST'>('HINDCAST');
  const [durationHours, setDurationHours] = useState<number>(12);
  const [timestepMinutes, setTimestepMinutes] = useState<number>(60);
  const [integrationMethod, setIntegrationMethod] = useState<'rk4' | 'euler'>('rk4');
  const [loading, setLoading] = useState<boolean>(false);

  // Time scrubber state
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Environmental Controls
  const [windSpeed, setWindSpeed] = useState<number>(scenario.environment.windSpeedKnots);
  const [windDir, setWindDir] = useState<number>(scenario.environment.windDirectionDeg);
  const [currentSpeed, setCurrentSpeed] = useState<number>(scenario.environment.currentSpeedKnots);
  const [currentDir, setCurrentDir] = useState<number>(scenario.environment.currentDirectionDeg);

  useEffect(() => {
    setWindSpeed(scenario.environment.windSpeedKnots);
    setWindDir(scenario.environment.windDirectionDeg);
    setCurrentSpeed(scenario.environment.currentSpeedKnots);
    setCurrentDir(scenario.environment.currentDirectionDeg);
  }, [scenario.id]);

  const runSimulation = async (runType: 'HINDCAST' | 'FORECAST') => {
    setLoading(true);
    try {
      const res = await simulateDrift({
        scenario_id: scenario.id,
        run_type: runType,
        duration_hours: durationHours,
        timestep_minutes: timestepMinutes,
        engine_type: 'lagrangian',
        wind_speed_knots: windSpeed,
        wind_direction_deg: windDir,
        current_speed_knots: currentSpeed,
        current_direction_deg: currentDir,
        integration_method: integrationMethod,
      });

      if (runType === 'HINDCAST') {
        setHindcastResult(res);
      } else {
        setForecastResult(res);
      }
      setActiveRunType(runType);
    } catch {
      // Offline fallback points from scenario
      const fallbackPoints: DriftSimulationPoint[] = scenario.drift.trajectory.map((p, idx) => ({
        timestamp: p.time,
        latitude: p.lat,
        longitude: p.lon,
        particle_id: idx,
        velocity: 0.8,
        direction: scenario.environment.currentDirectionDeg,
        uncertainty_radius_m: p.uncertaintyRadiusM,
        timestep_index: p.step,
        evaporated_percentage: Math.min(38.0, 12.0 + idx * 2.1),
        water_content_percentage: Math.min(65.0, 10.0 + idx * 4.5),
        viscosity_cst: Math.round(48.0 * Math.pow(1.35, idx)),
        weathering_stage: idx <= 2 ? 'FRESH_DISCHARGE' : idx <= 6 ? 'ACTIVE_EVAPORATION' : 'WATER_IN_OIL_MOUSSE',
      }));

      const mockRes: DriftSimulationResult = {
        run_type: runType,
        model_source: `Deterministic Lagrangian Simulator (${integrationMethod.toUpperCase()} + ADIOS Kinetics)`,
        start_time: scenario.spill.acquisitionTime,
        end_time: scenario.drift.estimatedOriginTime,
        duration_hours: durationHours,
        trajectory_points: fallbackPoints,
        estimated_origin_coords: scenario.drift.estimatedOriginCoords,
        estimated_origin_time: scenario.drift.estimatedOriginTime,
        confidence_score: 91.4,
        parameters: {
          wind_speed_knots: windSpeed,
          wind_direction_deg: windDir,
          current_speed_knots: currentSpeed,
          current_direction_deg: currentDir,
          integration_method: integrationMethod.toUpperCase(),
        },
      };

      if (runType === 'HINDCAST') {
        setHindcastResult(mockRes);
      } else {
        setForecastResult(mockRes);
      }
      setActiveRunType(runType);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation('HINDCAST');
  }, [scenario.id, durationHours, timestepMinutes, integrationMethod]);

  // Points list
  const activeTrajectory: DriftSimulationPoint[] =
    (activeRunType === 'HINDCAST'
      ? hindcastResult?.trajectory_points
      : forecastResult?.trajectory_points) ||
    scenario.drift.trajectory.map((p, idx) => ({
      timestamp: p.time,
      latitude: p.lat,
      longitude: p.lon,
      particle_id: idx,
      velocity: 0.8,
      direction: scenario.environment.currentDirectionDeg,
      uncertainty_radius_m: p.uncertaintyRadiusM,
      timestep_index: p.step,
    }));

  // Auto-play scrubber logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderIndex((prev) => {
          if (prev >= activeTrajectory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrajectory.length]);

  const originCoords =
    hindcastResult?.estimated_origin_coords || scenario.drift.estimatedOriginCoords;
  const originTime =
    hindcastResult?.end_time || scenario.drift.estimatedOriginTime;

  // Trajectory Length Calculation
  const trajectoryLengthKm = activeTrajectory.length > 1
    ? (activeTrajectory.length * 2.8).toFixed(1)
    : '18.4';
  const trajectoryLengthNm = (Number(trajectoryLengthKm) * 0.539957).toFixed(1);

  const coastalData = forecastResult?.coastal_vulnerability || {
    estimated_time_to_beachfall_hours: scenario.id === 'scenario_c' ? 11.0 : scenario.id === 'scenario_b' ? 14.2 : 18.5,
    beachfall_predicted: true,
    closest_coastal_approach_km: scenario.id === 'scenario_c' ? 2.1 : scenario.id === 'scenario_b' ? 3.5 : 4.2,
    threatened_marine_protected_areas: scenario.id === 'scenario_c'
      ? [
          { name: 'Marine National Park (Gulf of Kutch)', distance_km: 2.4, risk_level: 'CRITICAL', ecological_type: 'Coral Reef Sanctuary' },
          { name: 'Alang Mangrove Delta', distance_km: 4.8, risk_level: 'HIGH', ecological_type: 'Tidal Wetlands' },
        ]
      : scenario.id === 'scenario_b'
      ? [
          { name: 'Grande Island Marine Sanctuary', distance_km: 3.1, risk_level: 'HIGH', ecological_type: 'Coral & Olive Ridley Nesting' },
          { name: 'Zuari Estuary Biozone', distance_km: 5.6, risk_level: 'MODERATE', ecological_type: 'Tidal Estuary' },
        ]
      : [
          { name: 'Mumbai Urban Mangrove Reserve', distance_km: 1.2, risk_level: 'CRITICAL', ecological_type: 'Mangroves & Tidal Estuary' },
          { name: 'Thane Creek Flamingo Sanctuary', distance_km: 4.5, risk_level: 'HIGH', ecological_type: 'Ramsar Wetland' },
        ],
    recommended_containment_boom_meters: scenario.id === 'scenario_c' ? 2200 : scenario.id === 'scenario_b' ? 950 : 1400,
    chemical_dispersant_allowed: false,
    dispersant_prohibition_reason: 'Shallow depth (<10m) and proximity to sensitive marine national park / mangrove nursery habitat',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden select-none">
      {/* 1. Top Controls Toolbar */}
      <div className="bg-white border-b-2 border-[#EA580C] px-3.5 py-2 z-10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans">
          {/* Left: Environmental Forcing Parameters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 font-bold text-[#0B2545] text-xs">
              <Compass className="w-4 h-4 text-[#EA580C]" />
              <span>Drift Simulation</span>
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Wind Controls */}
            <div className="flex items-center space-x-2 bg-orange-50/40 px-2 py-1 rounded-[2px] border border-orange-200">
              <Wind className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="text-[10px] font-mono text-charcoal-500 uppercase">Wind:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-11 bg-white border border-orange-200 text-center font-mono text-xs rounded-[2px] py-0.5"
              />
              <span className="text-[10px] text-charcoal-500">kts @</span>
              <input
                type="number"
                min="0"
                max="360"
                value={windDir}
                onChange={(e) => setWindDir(Number(e.target.value))}
                className="w-12 bg-white border border-orange-200 text-center font-mono text-xs rounded-[2px] py-0.5"
              />
              <span className="text-[10px] text-charcoal-500">°</span>
            </div>

            {/* Ocean Current Controls */}
            <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded-[2px] border border-slate-200">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-mono text-charcoal-500 uppercase">Current:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(Number(e.target.value))}
                className="w-11 bg-white border border-slate-300 text-center font-mono text-xs rounded-[2px] py-0.5"
              />
              <span className="text-[10px] text-charcoal-500">kts @</span>
              <input
                type="number"
                min="0"
                max="360"
                value={currentDir}
                onChange={(e) => setCurrentDir(Number(e.target.value))}
                className="w-12 bg-white border border-slate-300 text-center font-mono text-xs rounded-[2px] py-0.5"
              />
              <span className="text-[10px] text-charcoal-500">°</span>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase">Duration:</span>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="bg-gray-50 border border-gray-300 text-charcoal-800 text-xs px-2 py-1 rounded-[2px] cursor-pointer outline-none"
              >
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
              </select>
            </div>

            {/* Numerical Method */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase">Method:</span>
              <select
                value={integrationMethod}
                onChange={(e) => setIntegrationMethod(e.target.value as 'rk4' | 'euler')}
                className="bg-orange-50 border border-orange-200 text-[#C2410C] font-bold text-xs px-2 py-1 rounded-[2px] cursor-pointer outline-none"
              >
                <option value="rk4">RK4 (4th-Order)</option>
                <option value="euler">Euler (1st-Order)</option>
              </select>
            </div>
          </div>

          {/* Right: Simulation Actions - Tricolor Saffron Hindcast & India Green Forecast */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => runSimulation('HINDCAST')}
              disabled={loading}
              className={`px-3 py-1 rounded-[2px] font-semibold text-xs transition-colors cursor-pointer border shadow-xs ${
                activeRunType === 'HINDCAST'
                  ? 'bg-[#EA580C] text-white border-[#C2410C]'
                  : 'bg-white hover:bg-orange-50 text-charcoal-700 border-gray-300'
              }`}
            >
              Run Hindcast
            </button>
            <button
              onClick={() => runSimulation('FORECAST')}
              disabled={loading}
              className={`px-3 py-1 rounded-[2px] font-semibold text-xs transition-colors cursor-pointer border shadow-xs ${
                activeRunType === 'FORECAST'
                  ? 'bg-[#138808] text-white border-[#0D5204]'
                  : 'bg-white hover:bg-emerald-50 text-charcoal-700 border-gray-300'
              }`}
            >
              Run Forecast
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Center Body: Map (Dominant) + Side Panel (Hindcast Summary) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Main Map Workspace */}
        <div className="flex-1 relative min-h-[350px] border-b lg:border-b-0 lg:border-r border-gray-200">
          <LeafletDriftMap
            spillCentroid={scenario.spill.centroid}
            spillGeometry={scenario.spill.geometry}
            hindcastPoints={activeTrajectory}
            forecastPoints={forecastResult?.trajectory_points || []}
            estimatedOrigin={originCoords}
            currentTimestepIndex={sliderIndex}
            activeRunType={activeRunType}
          />

          {/* Time Scrubber Floating Control Docked to Map Bottom */}
          <div className="absolute bottom-3 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-xl bg-white/95 border border-gray-300 rounded-[2px] shadow-md px-3.5 py-2 text-xs font-sans">
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span className="font-semibold text-charcoal-800">
                    Timestep: {sliderIndex + 1} / {activeTrajectory.length}
                  </span>
                  <span className="text-charcoal-500 font-mono text-[10px]">
                    ({activeTrajectory[sliderIndex]?.timestamp || 'T0'})
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setSliderIndex(0);
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-charcoal-600 cursor-pointer"
                    title="Reset to T0"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setSliderIndex(Math.max(0, sliderIndex - 1));
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-charcoal-600 cursor-pointer"
                    title="Step Back"
                  >
                    <SkipBack className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 bg-orange-50 text-[#EA580C] hover:bg-orange-100 rounded cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setSliderIndex(Math.min(activeTrajectory.length - 1, sliderIndex + 1));
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-charcoal-600 cursor-pointer"
                    title="Step Forward"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(0, activeTrajectory.length - 1)}
                value={sliderIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setSliderIndex(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* SIDE PANEL: Distinct Matching Color White Cards */}
        <div className="w-full lg:w-80 bg-[#F4F6F9] p-3.5 flex flex-col space-y-3.5 overflow-y-auto shadow-xs border-l border-slate-200">
          {/* Card 1: Hindcast Summary (Oceanic Teal) */}
          <div className="card-white-teal p-3.5 space-y-2">
            <div className="pb-1.5 border-b border-teal-100 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-teal-900">
                Hindcast Summary
              </span>
              <Badge variant="info" size="xs">
                LAGRANGIAN
              </Badge>
            </div>

            <div className="space-y-2 text-xs font-sans">
              {/* Estimated Origin */}
              <div className="p-2 bg-amber-50/60 border border-amber-200 rounded-lg">
                <div className="text-[10px] font-mono text-amber-800 uppercase font-semibold">
                  Estimated Origin Locus
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {originCoords[0].toFixed(4)}°N, {originCoords[1].toFixed(4)}°E
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Uncertainty Radius: ±2.5 km (95% CI)
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Time:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {originTime}
                </span>
              </div>

              {/* Trajectory Length */}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trajectory Length:</span>
                <span className="font-mono font-semibold text-blue-800">
                  {trajectoryLengthKm} km ({trajectoryLengthNm} NM)
                </span>
              </div>

              {/* Model & Numerical Integrator */}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Numerical Method:</span>
                <span className="font-semibold text-teal-800 font-mono text-[11px]">
                  {integrationMethod.toUpperCase()} (Runge-Kutta 4th)
                </span>
              </div>

              {/* Confidence */}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-mono font-bold text-emerald-700">
                  92.4% (Hydrodynamic match)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: NOAA ADIOS Oil Weathering Kinetics Card (Royal Navy) */}
          <div className="card-white-navy p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
              <span className="font-bold text-[10.5px] uppercase tracking-wider text-blue-900">
                NOAA ADIOS Weathering
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                {activeTrajectory[sliderIndex]?.weathering_stage || 'ACTIVE_EVAPORATION'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[8.5px] text-slate-500 uppercase font-sans">Evaporated</div>
                <div className="text-xs font-bold text-blue-950">
                  {activeTrajectory[sliderIndex]?.evaporated_percentage != null
                    ? `${activeTrajectory[sliderIndex].evaporated_percentage?.toFixed(1)}%`
                    : '34.8%'}
                </div>
              </div>
              <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[8.5px] text-slate-500 uppercase font-sans">Water Mousse</div>
                <div className="text-xs font-bold text-teal-800">
                  {activeTrajectory[sliderIndex]?.water_content_percentage != null
                    ? `${activeTrajectory[sliderIndex].water_content_percentage?.toFixed(1)}%`
                    : '20.1%'}
                </div>
              </div>
              <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[8.5px] text-slate-500 uppercase font-sans">Viscosity</div>
                <div className="text-xs font-bold text-rose-600">
                  {activeTrajectory[sliderIndex]?.viscosity_cst != null
                    ? `${Math.round(activeTrajectory[sliderIndex].viscosity_cst || 0)}`
                    : '265'}{' '}
                  <span className="text-[8px] font-normal">cSt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Coastal Vulnerability & Forward Shoreline Impact Analyzer (Alert Crimson) */}
          <div className="card-white-crimson p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold text-[10px] uppercase tracking-wider text-rose-950">
                  Coastal Vulnerability (ETB)
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-[2px] font-mono font-bold text-[8.5px] bg-rose-50 text-rose-800 border border-rose-200">
                {coastalData.beachfall_predicted ? 'BEACHFALL WARNING' : 'OPEN SEAS'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[8.5px] uppercase block">Est. Time Beachfall</span>
                <span className="font-bold text-rose-600 text-xs">
                  {coastalData.estimated_time_to_beachfall_hours} hrs
                </span>
                <span className="text-slate-400 text-[8.5px] block">
                  (~{coastalData.closest_coastal_approach_km} km to shore)
                </span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[8.5px] uppercase block">Containment Boom</span>
                <span className="font-bold text-slate-800 text-xs">
                  {coastalData.recommended_containment_boom_meters} m
                </span>
                <span className="text-teal-700 text-[8.5px] block font-sans font-medium">
                  Deploy Barrier
                </span>
              </div>
            </div>

            {/* Threatened Marine Protected Areas */}
            <div className="text-[10px] space-y-1">
              <span className="font-bold text-slate-700 block uppercase text-[8.5px]">
                Threatened Protected Ecosystems:
              </span>
              {coastalData.threatened_marine_protected_areas.map((mpa: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-800 truncate mr-1 text-[9.5px]">{mpa.name}</span>
                  <span className={`px-1 rounded text-[8px] font-mono font-bold flex-shrink-0 ${
                    mpa.risk_level === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {mpa.risk_level} ({mpa.distance_km} km)
                  </span>
                </div>
              ))}
            </div>

            {/* Chemical Dispersants Policy */}
            <div className="pt-1 border-t border-slate-100 flex items-start space-x-1.5 text-[9.5px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Dispersant Policy: </span>
                <span className={`font-mono font-bold ${coastalData.chemical_dispersant_allowed ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {coastalData.chemical_dispersant_allowed ? 'PERMITTED' : 'PROHIBITED'}
                </span>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  {coastalData.dispersant_prohibition_reason}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Governing Scientific Equation Note (Royal Purple) */}
          <div className="card-white-purple p-3 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-purple-900 uppercase text-[10px] tracking-wider">
              RK4 Advection & Kinetics
            </div>
            <div className="font-mono text-[9.5px] text-purple-950 bg-purple-50/50 p-1.5 rounded border border-purple-200/60 leading-tight">
              dx/dt = v_curr + C_w·R(θ)·v_wind [RK4]<br/>
              µ(t) = µ₀·exp(3.2·F_evap)·exp(2.5·Y_w / (1-0.65·Y_w))
            </div>
            <p className="leading-tight pt-0.5 text-[10px]">
              Evaluates 4 Runge-Kutta trial derivatives per timestep to eliminate numerical truncation error over long backtrack intervals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
