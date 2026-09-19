import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Circle,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  RotateCcw,
  Ruler,
  Eye,
  EyeOff,
  Navigation,
  Crosshair,
  Ship,
  MapPin,
  Check,
  ZoomIn,
  ZoomOut,
  Radio,
  Sparkles,
  Clock,
} from 'lucide-react';
import { MaritimeScenario, DEMO_SCENARIOS } from '../../data/maritimeDemoData';
import { InvestigationDetail, SuspectAttribution } from '../../types';
import { useMapProvider } from './MapProvider';
import { MapLayerControls, MapLayerState } from './MapLayerControls';
import { RadarSweepOverlay } from './RadarSweepOverlay';
import { LagrangianParticleFlow } from './LagrangianParticleFlow';
import { TimeScrubberBar } from './TimeScrubberBar';

// Haversine Great Circle Distance
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Custom DivIcons for Clean Professional Rendering with Animated Telemetry Rings
const createVesselIcon = (
  headingDeg: number,
  score: number,
  isSelected: boolean,
  isTopCandidate: boolean
): L.DivIcon => {
  const color = isTopCandidate
    ? '#DC2626'
    : score >= 70
    ? '#D97706'
    : score >= 40
    ? '#0F52BA'
    : '#4B5563';

  const strokeColor = isSelected ? '#111827' : '#FFFFFF';
  const size = isSelected ? 32 : 24;

  const svgHtml = `
    <div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; position: relative;">
      ${
        isTopCandidate
          ? `<div class="pulse-ring" style="position: absolute; inset: -8px; border-radius: 50%; border: 2px solid #DC2626; background: rgba(220, 38, 38, 0.2);"></div>`
          : ''
      }
      ${
        isSelected
          ? `<div style="position: absolute; inset: -6px; border-radius: 50%; border: 2px solid #0F52BA; background: rgba(15, 82, 186, 0.2); animation: pulse-ring 1.8s infinite;"></div>`
          : ''
      }
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="transform: rotate(${headingDeg}deg); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
        <path d="M12 2 L19 21 L12 17 L5 21 Z" fill="${color}" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'vessel-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createCentroidIcon = (): L.DivIcon => {
  const svgHtml = `
    <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; position: relative;">
      <div class="pulse-ring" style="position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid #DC2626; background: rgba(220, 38, 38, 0.2);"></div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5">
        <circle cx="12" cy="12" r="7" stroke="#DC2626" stroke-width="2" fill="none"/>
        <line x1="12" y1="1" x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="1" y1="12" x2="5" y2="12"/>
        <line x1="19" y1="12" x2="23" y2="12"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'centroid-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createSourceOriginIcon = (): L.DivIcon => {
  const svgHtml = `
    <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; position: relative;">
      <div class="pulse-ring" style="position: absolute; inset: 0; border-radius: 50%; border: 2px dashed #D97706; background: rgba(217, 119, 6, 0.2);"></div>
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #D97706; border: 1.5px solid #FFFFFF;"></div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'origin-div-icon',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

// Map Recenter & Controller Helper
interface MapControllerProps {
  center: [number, number];
  zoom: number;
  triggerReset: number;
  onCursorMove?: (lat: number, lon: number) => void;
  isMeasuring: boolean;
  onMeasureClick?: (lat: number, lon: number) => void;
}

const MapEventsController: React.FC<MapControllerProps> = ({
  center,
  zoom,
  triggerReset,
  onCursorMove,
  isMeasuring,
  onMeasureClick,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [triggerReset, center, zoom, map]);

  useMapEvents({
    mousemove: (e) => {
      if (onCursorMove) onCursorMove(e.latlng.lat, e.latlng.lng);
    },
    click: (e) => {
      if (isMeasuring && onMeasureClick) {
        onMeasureClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

export interface LeafletMapWorkspaceProps {
  scenario: MaritimeScenario;
  investigation?: InvestigationDetail | null;
  selectedVesselId?: string;
  onSelectVessel?: (vesselId: string) => void;
  replayStep?: number | null;
  className?: string;
}

export const LeafletMapWorkspace: React.FC<LeafletMapWorkspaceProps> = ({
  scenario,
  investigation,
  selectedVesselId,
  onSelectVessel,
  replayStep = null,
  className = '',
}) => {
  const { config, isSatellite, toggleSatellite } = useMapProvider();

  // Advanced GIS Layer Visibility State
  const [layersState, setLayersState] = useState<MapLayerState>({
    sarFootprint: true,
    spillPlume: true,
    driftParticles: true,
    originEllipse: true,
    vesselTracks: true,
    darkAnomalies: true,
  });

  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayersState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Layer Visibility Controls (as requested: Satellite, Oil Spill, Hindcast, Forecast, Vessel Tracks, Candidates)
  const [showOilSpill, setShowOilSpill] = useState(true);
  const [showHindcast, setShowHindcast] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showVesselTracks, setShowVesselTracks] = useState(true);
  const [showCandidates, setShowCandidates] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Measurement Tool State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Interactive Animated Tactical Radar Sweep State
  const [isRadarActive, setIsRadarActive] = useState<boolean>(true);

  // Coordinate Display
  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);

  // View reset trigger
  const [resetTrigger, setResetTrigger] = useState(0);

  // Interactive 24-Hour Time Scrubber State
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [isTimeSliderActive, setIsTimeSliderActive] = useState<boolean>(true);

  // Dynamic vessel position calculation based on time scrubber
  const getVesselCurrentPos = (vessel: (typeof scenario.vessels)[0]): [number, number] => {
    if (!vessel.positions || vessel.positions.length === 0) {
      return [scenario.spill.centroid[0], scenario.spill.centroid[1]];
    }
    if (timeOffsetHours === 0) {
      const last = vessel.positions[vessel.positions.length - 1];
      return [last.lat, last.lon];
    }
    const pct = Math.max(0, Math.min(1, (timeOffsetHours + 24) / 24));
    const idx = Math.min(vessel.positions.length - 1, Math.floor(pct * (vessel.positions.length - 1)));
    return [vessel.positions[idx].lat, vessel.positions[idx].lon];
  };

  const spillCentroid: [number, number] = useMemo(() => {
    if (investigation?.spill?.centroid) {
      return [investigation.spill.centroid[0], investigation.spill.centroid[1]];
    }
    return [scenario.spill.centroid[0], scenario.spill.centroid[1]];
  }, [investigation, scenario]);

  const originCoords: [number, number] = useMemo(() => {
    if (investigation?.source?.coords) {
      return [investigation.source.coords[0], investigation.source.coords[1]];
    }
    return [scenario.drift.estimatedOriginCoords[0], scenario.drift.estimatedOriginCoords[1]];
  }, [investigation, scenario]);

  // Parse Spill Polygon Coordinates from GeoJSON
  const spillPolygonCoords: [number, number][] = useMemo(() => {
    try {
      const geom = investigation?.spill?.geometry || scenario.spill.geometry;

      if (geom && geom.coordinates && geom.coordinates[0]) {
        return geom.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
      }
    } catch (e) {
      console.warn('Failed parsing spill geometry:', e);
    }
    // Fallback polygon around centroid
    const [cLat, cLon] = spillCentroid;
    return [
      [cLat + 0.02, cLon - 0.02],
      [cLat + 0.03, cLon + 0.01],
      [cLat + 0.01, cLon + 0.03],
      [cLat - 0.02, cLon + 0.02],
      [cLat - 0.01, cLon - 0.02],
    ];
  }, [investigation, scenario, spillCentroid]);

  // Hindcast Trajectory Points
  const hindcastLineCoords: [number, number][] = useMemo(() => {
    if (investigation?.drift?.hindcast_points && investigation.drift.hindcast_points.length > 0) {
      return investigation.drift.hindcast_points.map(
        (p) => [p.lat, p.lon] as [number, number]
      );
    }
    return scenario.drift.trajectory.map((p) => [p.lat, p.lon] as [number, number]);
  }, [investigation, scenario]);

  // Forecast Trajectory Points (Projecting dispersion ahead)
  const forecastLineCoords: [number, number][] = useMemo(() => {
    if (investigation?.drift?.forecast_points && investigation.drift.forecast_points.length > 0) {
      return investigation.drift.forecast_points.map(
        (p) => [p.lat, p.lon] as [number, number]
      );
    }
    // Simulated forward projection using environment wind/current
    const [cLat, cLon] = spillCentroid;
    const pts: [number, number][] = [[cLat, cLon]];
    const dLat = (Math.cos((scenario.environment.currentDirectionDeg * Math.PI) / 180) * 0.015);
    const dLon = (Math.sin((scenario.environment.currentDirectionDeg * Math.PI) / 180) * 0.015);
    for (let i = 1; i <= 6; i++) {
      pts.push([cLat + dLat * i, cLon + dLon * i]);
    }
    return pts;
  }, [investigation, scenario, spillCentroid]);

  // SAR Acquisition Footprint Swath Bounding Box (Sentinel-1 SAR IW Swath ~250km)
  const sarFootprintCoords: [number, number][] = useMemo(() => {
    const [cLat, cLon] = spillCentroid;
    return [
      [cLat - 0.18, cLon - 0.22],
      [cLat - 0.18, cLon + 0.22],
      [cLat + 0.18, cLon + 0.22],
      [cLat + 0.18, cLon - 0.22],
    ];
  }, [spillCentroid]);

  // Candidate Vessels List
  const candidateVessels = useMemo(() => {
    return scenario.vessels;
  }, [scenario]);

  // Distance Measurement Handler
  const handleMeasureClick = (lat: number, lon: number) => {
    if (measurePoints.length >= 2) {
      setMeasurePoints([[lat, lon]]);
    } else {
      setMeasurePoints((prev) => [...prev, [lat, lon]]);
    }
  };

  const measureDistance = useMemo(() => {
    if (measurePoints.length === 2) {
      const km = haversineDistanceKm(
        measurePoints[0][0],
        measurePoints[0][1],
        measurePoints[1][0],
        measurePoints[1][1]
      );
      const nm = km * 0.539957;
      return { km: km.toFixed(2), nm: nm.toFixed(2) };
    }
    return null;
  }, [measurePoints]);

  // Replay Step Visibility Logic
  // When replayStep is set:
  // Step 1: Satellite observation
  // Step 2: Spill detection polygon appears
  // Step 3: Spill centroid is identified
  // Step 4: Hindcast trajectory draws backward
  // Step 5: Source region appears
  // Step 6: AIS vessels appear
  // Step 7: Candidate tracks appear
  // Step 8: Vessel correlation is calculated
  // Step 9: Ranked candidates appear
  const isReplay = replayStep !== null && replayStep !== undefined;
  const visibleSpill = !isReplay || (replayStep && replayStep >= 1);
  const visiblePolygonFill = !isReplay || (replayStep && replayStep >= 2);
  const visibleCentroid = !isReplay || (replayStep && replayStep >= 3);
  const visibleHindcast = !isReplay || (replayStep && replayStep >= 4);
  const visibleSource = !isReplay || (replayStep && replayStep >= 5);
  const visibleVesselsList = !isReplay || (replayStep && replayStep >= 6);
  const visibleVesselTracks = !isReplay || (replayStep && replayStep >= 7);
  const visibleCorrelation = !isReplay || (replayStep && replayStep >= 8);

  const topSuspect = candidateVessels[0];

  return (
    <div className={`relative w-full h-full bg-surface-100 overflow-hidden select-none ${className}`}>
      {/* 1. Primary Leaflet Map Container */}
      <MapContainer
        center={spillCentroid}
        zoom={9}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full z-0"
      >
        <MapEventsController
          center={spillCentroid}
          zoom={9}
          triggerReset={resetTrigger}
          onCursorMove={(lat, lon) => setCursorPos({ lat, lon })}
          isMeasuring={isMeasuring}
          onMeasureClick={handleMeasureClick}
        />

        {/* Dynamic Tile Layer with OSM default */}
        <TileLayer
          key={config.url}
          url={config.url}
          attribution={config.attribution}
          maxZoom={config.maxZoom}
          subdomains={config.subdomains || []}
        />

        {/* 0. Sector MH-4 Tactical Incident Bounding Box (Green dashed box from screenshot) */}
        <Polygon
          positions={[
            [19.26, 72.18],
            [19.26, 72.48],
            [18.96, 72.48],
            [18.96, 72.18],
          ]}
          pathOptions={{
            color: '#059669',
            weight: 2,
            dashArray: '8, 6',
            fillColor: '#10B981',
            fillOpacity: 0.03,
          }}
        >
          <Tooltip sticky direction="top">
            <div className="text-xs font-sans p-0.5">
              <div className="font-bold text-emerald-800 uppercase tracking-wide">
                SECTOR MH-4 TACTICAL INCIDENT ZONE
              </div>
              <div className="text-slate-600 font-medium">Offshore Mumbai High Corridor</div>
            </div>
          </Tooltip>
        </Polygon>

        {/* Tactical Range Circles around incident locus */}
        {[5000, 10000, 15000].map((radius) => (
          <Circle
            key={`range-${radius}`}
            center={spillCentroid}
            radius={radius}
            pathOptions={{
              color: '#10B981',
              weight: 1,
              dashArray: '4, 8',
              opacity: 0.35,
              fill: false,
            }}
          />
        ))}

        {/* SAR Swath Acquisition Footprint */}
        {layersState.sarFootprint && (
          <Polygon
            positions={sarFootprintCoords}
            pathOptions={{
              color: '#059669',
              weight: 1.5,
              dashArray: '6, 6',
              fillColor: '#10B981',
              fillOpacity: 0.04,
            }}
          >
            <Tooltip sticky direction="top">
              <div className="text-xs font-sans p-0.5">
                <div className="font-bold text-emerald-700 uppercase tracking-wide">
                  SAR SATELLITE SWATH FOOTPRINT
                </div>
                <div className="text-slate-600 font-medium">
                  Sentinel-1 C-SAR IW Acquisition Zone (~250km Swath)
                </div>
              </div>
            </Tooltip>
          </Polygon>
        )}

        {/* A. Oil Spill Polygon & Centroid */}
        {layersState.spillPlume && showOilSpill && visibleSpill && (
          <>
            <Polygon
              positions={spillPolygonCoords}
              pathOptions={{
                color: '#DC2626',
                weight: 2,
                fillColor: visiblePolygonFill ? '#DC2626' : 'transparent',
                fillOpacity: visiblePolygonFill ? 0.25 : 0.05,
              }}
            >
              <Tooltip sticky direction="top">
                <div className="text-xs font-sans p-0.5">
                  <div className="font-bold text-red-700 uppercase tracking-wide">DETECTED OIL SLICK</div>
                  <div className="text-charcoal-800 font-medium">Area: {investigation?.spill?.area_sqkm ?? scenario.spill.areaSqKm} km²</div>
                  <div className="text-charcoal-500 font-mono text-[10px]">Confidence: {investigation?.spill?.confidence ? (investigation.spill.confidence * 100).toFixed(0) : scenario.spill.confidence}%</div>
                </div>
              </Tooltip>
            </Polygon>

            {visibleCentroid && (
              <Marker position={spillCentroid} icon={createCentroidIcon()}>
                <Tooltip direction="top" offset={[0, -10]}>
                  <div className="text-xs font-sans p-0.5">
                    <div className="font-bold text-red-700 uppercase tracking-wide">DETECTED OIL SLICK</div>
                    <div className="text-charcoal-800 font-medium">
                      Area: {investigation?.spill?.area_sqkm ?? scenario.spill.areaSqKm} km²
                    </div>
                    <div className="font-mono text-[10px] text-charcoal-500">
                      Centroid: {spillCentroid[0].toFixed(4)}°N, {spillCentroid[1].toFixed(4)}°E
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            )}
          </>
        )}

        {/* B. Hindcast Trajectory (Lagrangian Reverse Simulation) */}
        {layersState.driftParticles && showHindcast && visibleHindcast && (
          <>
            <Polyline
              positions={hindcastLineCoords}
              pathOptions={{
                color: '#0284C7',
                weight: 2.5,
                dashArray: '4, 4',
                opacity: 0.9,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <div className="font-bold text-sky-700">HINDCAST TRAJECTORY</div>
                  <div>Lagrangian drift advection backwards in time</div>
                </div>
              </Tooltip>
            </Polyline>

            {/* Trajectory Hourly Waypoints */}
            {hindcastLineCoords.map((pt, idx) => (
              <CircleMarker
                key={`hc-pt-${idx}`}
                center={pt}
                radius={idx === 0 || idx === hindcastLineCoords.length - 1 ? 5 : 3}
                pathOptions={{
                  color: '#0284C7',
                  fillColor: '#FFFFFF',
                  fillOpacity: 1,
                  weight: 1.5,
                }}
              />
            ))}
          </>
        )}

        {/* C. Reconstructed Source Origin & Uncertainty Radius */}
        {layersState.originEllipse && showHindcast && visibleSource && (
          <>
            <Circle
              center={originCoords}
              radius={2500} // 2.5 km spatial uncertainty buffer
              pathOptions={{
                color: '#D97706',
                weight: 1.5,
                dashArray: '3, 4',
                fillColor: '#D97706',
                fillOpacity: 0.15,
              }}
            />
            <Marker position={originCoords} icon={createSourceOriginIcon()}>
              <Tooltip direction="top" offset={[0, -12]} permanent={isReplay && replayStep === 5}>
                <div className="text-xs font-sans">
                  <div className="font-bold text-amber-700">RECONSTRUCTED SOURCE LOCUS</div>
                  <div className="font-mono text-[10px]">
                    {originCoords[0].toFixed(4)}°N, {originCoords[1].toFixed(4)}°E
                  </div>
                  <div className="text-[10px] text-gray-500">Uncertainty Buffer: ±2.5 km</div>
                </div>
              </Tooltip>
            </Marker>
          </>
        )}

        {/* D. Forward Forecast Trajectory */}
        {showForecast && (
          <Polyline
            positions={forecastLineCoords}
            pathOptions={{
              color: '#F59E0B',
              weight: 2,
              dashArray: '2, 5',
              opacity: 0.8,
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-sans">
                <div className="font-bold text-amber-700">FORWARD FORECAST (48H)</div>
                <div>Coastal vulnerability projection</div>
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* E. AIS Vessel Tracks & Directional Markers */}
        {visibleVesselsList && (
          <>
            {candidateVessels.map((vessel, idx) => {
              const isSelected = selectedVesselId === vessel.id;
              const isTop = idx === 0;
              const pos: [number, number] = getVesselCurrentPos(vessel);

              const trackPts: [number, number][] =
                vessel.positions && vessel.positions.length > 0
                  ? vessel.positions.map((p) => [p.lat, p.lon] as [number, number])
                  : [pos];

              return (
                <React.Fragment key={vessel.id}>
                  {/* Vessel Track */}
                  {layersState.vesselTracks && showVesselTracks && visibleVesselTracks && (
                    <Polyline
                      positions={trackPts}
                      pathOptions={{
                        color: isTop ? '#DC2626' : '#9CA3AF',
                        weight: isSelected ? 2.5 : 1.5,
                        dashArray: isTop ? undefined : '3, 3',
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    />
                  )}

                  {/* Vessel Directional Marker (Candidate) */}
                  {layersState.darkAnomalies && showCandidates && (
                    <Marker
                      position={pos}
                      icon={createVesselIcon(vessel.headingDeg, vessel.suspicionScore, isSelected, isTop)}
                      eventHandlers={{
                        click: () => {
                          if (onSelectVessel) onSelectVessel(vessel.id);
                        },
                      }}
                    >
                      <Tooltip direction="right" offset={[10, 0]}>
                        <div className="text-xs font-sans p-0.5">
                          <div className="font-bold flex items-center space-x-1">
                            <span className={isTop ? 'text-red-700 font-bold' : 'text-gray-900'}>
                              {vessel.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">#{idx + 1}</span>
                          </div>
                          <div className="text-[10px] text-gray-600">
                            MMSI: {vessel.mmsi} • SOG: {vessel.speedKnots} kts • COG: {vessel.courseDeg}°
                          </div>
                          <div className="mt-1 font-semibold text-[11px] text-blue-700">
                            Correlation Score: {vessel.suspicionScore.toFixed(1)} / 100
                          </div>
                        </div>
                      </Tooltip>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })}

            {/* CPA Vector to Reconstructed Source (Visible in Step 8+) */}
            {visibleCorrelation && topSuspect && (
              <Polyline
                positions={[
                  originCoords,
                  topSuspect.positions && topSuspect.positions.length > 0
                    ? [topSuspect.positions[topSuspect.positions.length - 1].lat, topSuspect.positions[topSuspect.positions.length - 1].lon]
                    : spillCentroid,
                ]}
                pathOptions={{
                  color: '#059669',
                  weight: 2,
                  dashArray: '3, 4',
                  opacity: 0.9,
                }}
              >
                <Tooltip permanent direction="center">
                  <div className="bg-white/95 border border-slate-400 px-2 py-0.5 rounded-[2px] shadow-md text-center leading-tight">
                    <div className="font-mono font-extrabold text-xs text-slate-900">{(topSuspect.minDistanceNm * 1.852).toFixed(1)} km</div>
                    <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">CPA</div>
                    <div className="text-[10px] font-bold text-[#064E26] truncate max-w-[120px]">{topSuspect.name}</div>
                  </div>
                </Tooltip>
              </Polyline>
            )}
          </>
        )}

        {/* F. Interactive Measurement Line */}
        {isMeasuring && measurePoints.length > 0 && (
          <>
            {measurePoints.map((pt, i) => (
              <CircleMarker
                key={`m-pt-${i}`}
                center={pt}
                radius={4}
                pathOptions={{ color: '#0F52BA', fillColor: '#FFFFFF', fillOpacity: 1 }}
              />
            ))}
            {measurePoints.length === 2 && (
              <Polyline
                positions={measurePoints}
                pathOptions={{ color: '#0F52BA', weight: 2.5, dashArray: '5, 5' }}
              >
                <Tooltip permanent direction="center">
                  <div className="bg-white text-blue-900 font-mono text-[11px] font-bold px-1.5 py-0.5 border border-blue-400 rounded-sm shadow-md">
                    {measureDistance?.km} km / {measureDistance?.nm} NM
                  </div>
                </Tooltip>
              </Polyline>
            )}
          </>
        )}

        {/* G. Real-time 60fps Lagrangian Ocean Drift Particle Advection */}
        <LagrangianParticleFlow
          isVisible={layersState.driftParticles && showHindcast}
          hindcastCoords={hindcastLineCoords}
          forecastCoords={forecastLineCoords}
          particleCount={75}
        />
      </MapContainer>

      {/* Interactive Tactical S-Band Radar HUD Overlay */}
      <RadarSweepOverlay
        isVisible={isRadarActive}
        onToggle={() => setIsRadarActive(!isRadarActive)}
        sectorName={scenario.region}
        targetCount={candidateVessels.length}
      />

      {/* 2. Top-Right Professional GIS Map Controls Toolbar */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-1.5">
        {/* Radar Sweep HUD Toggle */}
        <button
          onClick={() => setIsRadarActive(!isRadarActive)}
          className={`w-8 h-8 border rounded-sm shadow-sm flex items-center justify-center transition-all cursor-pointer ${
            isRadarActive
              ? 'bg-[#001737] text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-white hover:bg-gray-50 text-charcoal-700 border-gray-300'
          }`}
          title={isRadarActive ? 'Disable Tactical Radar HUD Overlay' : 'Enable Tactical Radar HUD Overlay'}
        >
          <Radio className={`w-4 h-4 ${isRadarActive ? 'animate-pulse text-emerald-400' : ''}`} />
        </button>
        {/* Layer Visibility Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-300 text-charcoal-700 rounded-sm shadow-sm flex items-center justify-center transition-colors cursor-pointer"
            title="Map Layer Controls"
          >
            <Layers className="w-4 h-4 text-charcoal-700" />
          </button>

          {/* Layer Menu Popover */}
          {showLayerMenu && (
            <div className="absolute right-0 top-9 w-48 bg-white border border-gray-300 rounded-sm shadow-lg p-2 z-50 text-xs font-sans text-charcoal-800">
              <div className="font-bold text-[10px] text-charcoal-500 uppercase tracking-wider pb-1 mb-1 border-b border-gray-200">
                Map Layers
              </div>

              {/* Satellite Toggle */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Satellite</span>
                </span>
                <input
                  type="checkbox"
                  checked={isSatellite}
                  onChange={toggleSatellite}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              {/* Oil Spill */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Oil Spill</span>
                </span>
                <input
                  type="checkbox"
                  checked={showOilSpill}
                  onChange={() => setShowOilSpill(!showOilSpill)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              {/* Hindcast */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  <span>Hindcast</span>
                </span>
                <input
                  type="checkbox"
                  checked={showHindcast}
                  onChange={() => setShowHindcast(!showHindcast)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              {/* Forecast */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Forecast</span>
                </span>
                <input
                  type="checkbox"
                  checked={showForecast}
                  onChange={() => setShowForecast(!showForecast)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              {/* Vessel Tracks */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  <span>Vessel Tracks</span>
                </span>
                <input
                  type="checkbox"
                  checked={showVesselTracks}
                  onChange={() => setShowVesselTracks(!showVesselTracks)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              {/* Candidates */}
              <label className="flex items-center justify-between py-1 hover:bg-gray-50 px-1.5 rounded cursor-pointer">
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-charcoal-800" />
                  <span>Candidates</span>
                </span>
                <input
                  type="checkbox"
                  checked={showCandidates}
                  onChange={() => setShowCandidates(!showCandidates)}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Measure Tool Toggle */}
        <button
          onClick={() => {
            setIsMeasuring(!isMeasuring);
            setMeasurePoints([]);
          }}
          className={`w-8 h-8 border rounded-sm shadow-sm flex items-center justify-center transition-colors cursor-pointer ${
            isMeasuring
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white hover:bg-gray-50 text-charcoal-700 border-gray-300'
          }`}
          title={isMeasuring ? 'Exit Distance Measurement' : 'Nautical Distance Measure Tool'}
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* 24-Hour Historical Time Scrubber Toggle */}
        <button
          onClick={() => setIsTimeSliderActive(!isTimeSliderActive)}
          className={`w-8 h-8 border rounded-sm shadow-sm flex items-center justify-center transition-colors cursor-pointer ${
            isTimeSliderActive
              ? 'bg-[#064E26] text-[#FFD700] border-[#032B13]'
              : 'bg-white hover:bg-gray-50 text-charcoal-700 border-gray-300'
          }`}
          title={isTimeSliderActive ? 'Hide 24-Hour Historical Time Scrubber' : 'Show 24-Hour Historical Time Scrubber (T-24h to T+0h)'}
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Reset View Button */}
        <button
          onClick={() => setResetTrigger((prev) => prev + 1)}
          className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-300 text-charcoal-700 rounded-sm shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          title="Reset View to Spill Centroid"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Measurement Guide Floating Banner */}
      {isMeasuring && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-blue-300 text-blue-900 px-3 py-1.5 rounded-sm shadow-md text-xs font-mono flex items-center space-x-2">
          <Ruler className="w-3.5 h-3.5 text-blue-600" />
          <span>Click two points on the map to measure geodesic distance (km & NM).</span>
          {measurePoints.length > 0 && (
            <button
              onClick={() => setMeasurePoints([])}
              className="text-red-600 hover:text-red-800 ml-2 font-bold underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* 4. Docked Tactical GIS Legend (Bottom Left) */}
      <div className="absolute bottom-5 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 rounded-[2px] shadow-md px-3 py-2 text-[11px] font-sans text-slate-800 select-none">
        <div className="font-mono font-bold text-[10px] text-slate-600 uppercase tracking-wider mb-1.5 pb-0.5 border-b border-slate-200">
          MAP LEGEND
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0" />
            <span className="font-medium text-slate-700">Observed Spill</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-cyan-500 flex-shrink-0" />
            <span className="font-medium text-slate-700">Hindcast Drift</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-600 bg-amber-100 flex-shrink-0 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-amber-600" />
            </span>
            <span className="font-medium text-slate-700">Estimated Source</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-blue-500 flex-shrink-0" />
            <span className="font-medium text-slate-700">Forecast Drift</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-red-600 rotate-45 flex-shrink-0" />
            <span className="font-medium text-slate-700">Top Priority Vessel</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rotate-45 flex-shrink-0" />
            <span className="font-medium text-slate-700">Candidate Vessel</span>
          </div>
        </div>
      </div>

      {/* 5. Real-Time Geodetic Cursor HUD (Bottom Right) */}
      <div className="absolute bottom-2 right-3 z-[1000] bg-white/95 border border-slate-300 rounded-[2px] px-2 py-0.5 text-[10.5px] font-mono text-slate-700 shadow-xs font-bold">
        LAT: {cursorPos?.lat ? cursorPos.lat.toFixed(4) : '19.6021'}° | LON: {cursorPos?.lon ? cursorPos.lon.toFixed(4) : '71.1475'}° WGS84
      </div>

      {/* 6. Advanced Tactical Map Layer Controls Drawer */}
      <MapLayerControls
        layers={layersState}
        onToggleLayer={handleToggleLayer}
        className="bottom-8 right-3"
      />

      {/* 7. Interactive 24-Hour Historical Time Scrubber Bar */}
      {isTimeSliderActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-2 pointer-events-none">
          <div className="pointer-events-auto">
            <TimeScrubberBar
              currentOffsetHours={timeOffsetHours}
              onOffsetChange={setTimeOffsetHours}
              observationTimeUtc={scenario.spill.acquisitionTime || '2026-09-15T01:28:00Z'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
