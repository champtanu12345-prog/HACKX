import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crosshair, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MapControls, BasemapType } from './MapControls';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { VesselDetailPanel } from '../vessels/VesselDetailPanel';
import { InvestigationDetail } from '../../types';

interface MapWorkspaceProps {
  scenario: MaritimeScenario;
  investigation?: InvestigationDetail | null;
  selectedVesselId?: string;
  onSelectVessel?: (vesselId: string) => void;
  className?: string;
  replayStep?: number | null;
}

// Convert decimal degrees to degrees and decimal minutes (Nautical format)
function toDegreesMinutes(coord: number, isLat: boolean): string {
  const absolute = Math.abs(coord);
  const degrees = Math.floor(absolute);
  const minutes = (absolute - degrees) * 60;
  const direction = isLat ? (coord >= 0 ? 'N' : 'S') : coord >= 0 ? 'E' : 'W';
  return `${degrees}°${minutes.toFixed(2)}' ${direction}`;
}

// Great circle distance in nautical miles
function calculateDistanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R_KM = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_KM * c * 0.539957;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  scenario,
  investigation,
  selectedVesselId,
  onSelectVessel,
  className = '',
  replayStep = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // HUD and state
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(9.0);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('dark');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [layerVisibility, setLayerVisibility] = useState({
    spillPolygon: true,
    driftTrajectory: true,
    vesselTracks: true,
    groundTruth: true,
  });

  // Measurement tool state
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>([]);
  const [measuredDistanceNm, setMeasuredDistanceNm] = useState<number | null>(null);

  // Markers ref
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Basemap tile style definitions
  const getStyleForBasemap = (type: BasemapType): maplibregl.StyleSpecification => {
    let tileUrl = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    let attribution = '© CARTO, © OpenStreetMap';

    if (type === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '© Esri World Imagery';
    } else if (type === 'bathymetry') {
      tileUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png';
      attribution = '© CARTO Bathymetry';
    } else if (type === 'enc') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '© OpenStreetMap Nautical ENC';
    }

    return {
      version: 8,
      sources: {
        'base-tiles': {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution,
        },
      },
      layers: [
        {
          id: 'base-background',
          type: 'background',
          paint: {
            'background-color': '#080e1a',
          },
        },
        {
          id: 'base-tiles-layer',
          type: 'raster',
          source: 'base-tiles',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = [scenario.spill.centroid[1], scenario.spill.centroid[0]];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleForBasemap(currentBasemap),
      center: initialCenter,
      zoom: 9.0,
      attributionControl: false,
    });

    // Suppress external raster tile loading errors when operating offline or in isolated demo mode
    map.on('error', (e) => {
      if (
        e &&
        e.error &&
        (e.error.message?.includes('tile') ||
          e.error.message?.includes('fetch') ||
          e.error.message?.includes('Failed to fetch') ||
          e.error.message?.includes('NetworkError'))
      ) {
        return;
      }
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      setCursorCoords({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    });

    map.on('zoom', () => {
      setZoomLevel(Number(map.getZoom().toFixed(1)));
    });

    map.on('click', (e) => {
      if (isMeasuring) {
        const newPt: [number, number] = [e.lngLat.lat, e.lngLat.lng];
        if (measurePoints.length === 0) {
          setMeasurePoints([newPt]);
          setMeasuredDistanceNm(null);
        } else if (measurePoints.length === 1) {
          const p1 = measurePoints[0];
          const dist = calculateDistanceNm(p1[0], p1[1], newPt[0], newPt[1]);
          setMeasurePoints([p1, newPt]);
          setMeasuredDistanceNm(dist);
        } else {
          setMeasurePoints([newPt]);
          setMeasuredDistanceNm(null);
        }
      }
    });

    map.on('load', () => {
      // 1. Spill Source & Layers
      map.addSource('spill-poly-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                area: scenario.spill.areaSqKm,
                confidence: scenario.spill.confidence,
              },
              geometry: scenario.spill.geometry,
            },
          ],
        },
      });

      map.addLayer({
        id: 'spill-fill',
        type: 'fill',
        source: 'spill-poly-source',
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.38,
        },
      });

      map.addLayer({
        id: 'spill-line',
        type: 'line',
        source: 'spill-poly-source',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5,
        },
      });

      // 2. Drift Trajectory Source & Layers
      const driftLineCoords = scenario.drift.trajectory.map((p) => [p.lon, p.lat]);
      const driftPointFeatures = scenario.drift.trajectory.map((p) => ({
        type: 'Feature' as const,
        properties: { step: p.step, time: p.time },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lon, p.lat],
        },
      }));

      map.addSource('drift-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'HINDCAST' },
              geometry: {
                type: 'LineString',
                coordinates: driftLineCoords,
              },
            },
            ...driftPointFeatures,
          ],
        },
      });

      map.addLayer({
        id: 'drift-trail',
        type: 'line',
        source: 'drift-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      });

      map.addLayer({
        id: 'drift-nodes',
        type: 'circle',
        source: 'drift-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4,
          'circle-color': '#38bdf8',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#080d14',
        },
      });

      // 2b. Drift Forecast Trajectory Source & Layer
      map.addSource('drift-forecast-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'drift-forecast-trail',
        type: 'line',
        source: 'drift-forecast-source',
        paint: {
          'line-color': '#f97316',
          'line-width': 2.2,
          'line-dasharray': [2, 2],
        },
      });

      map.addLayer({
        id: 'drift-forecast-nodes',
        type: 'circle',
        source: 'drift-forecast-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 3.5,
          'circle-color': '#f97316',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#080d14',
        },
      });

      // 2c. Correlation Vector Source & Layer (Connecting Origin Locus to Selected Vessel CPA)
      map.addSource('correlation-vector-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'correlation-vector-trail',
        type: 'line',
        source: 'correlation-vector-source',
        paint: {
          'line-color': '#fbbf24',
          'line-width': 2.5,
          'line-dasharray': [4, 3],
        },
      });

      // 3. Vessel Tracks Source & Layers
      map.addSource('vessel-tracks-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'vessel-tracks-unselected',
        type: 'line',
        source: 'vessel-tracks-source',
        filter: ['all', ['==', '$type', 'LineString'], ['!=', 'isSelected', true]],
        paint: {
          'line-color': ['case', ['>=', ['get', 'score'], 75], '#f87171', '#38bdf8'],
          'line-width': 1.8,
          'line-opacity': 0.65,
          'line-dasharray': [3, 2],
        },
      });

      map.addLayer({
        id: 'vessel-tracks-selected',
        type: 'line',
        source: 'vessel-tracks-source',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'isSelected', true]],
        paint: {
          'line-color': '#fbbf24',
          'line-width': 3.8,
          'line-opacity': 0.95,
        },
      });

      map.addLayer({
        id: 'vessel-track-pings',
        type: 'circle',
        source: 'vessel-tracks-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isSelected'], true], 4.5, 2.5],
          'circle-color': ['case', ['==', ['get', 'isSelected'], true], '#fbbf24', '#38bdf8'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#080d14',
        },
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
    };
  }, []);

  // Update map features when scenario, investigation, or replayStep changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const centerLat = investigation?.spill?.centroid ? investigation.spill.centroid[0] : scenario.spill.centroid[0];
    const centerLon = investigation?.spill?.centroid ? investigation.spill.centroid[1] : scenario.spill.centroid[1];

    const originLat = investigation?.source?.coords
      ? investigation.source.coords[0]
      : scenario.drift?.trajectory?.[scenario.drift.trajectory.length - 1]?.lat ?? (scenario.spill.centroid[0] - 0.07);
    const originLon = investigation?.source?.coords
      ? investigation.source.coords[1]
      : scenario.drift?.trajectory?.[scenario.drift.trajectory.length - 1]?.lon ?? (scenario.spill.centroid[1] - 0.065);
    const originTime = investigation?.source?.timestamp || (scenario.groundTruth ? scenario.groundTruth.sourceTimestamp : '19:30 UTC');

    // Find CPA position of primary suspect (rank #1) to reconstructed origin
    const topVessel = scenario.vessels[0];
    let topCpaPoint = topVessel?.positions?.[0];
    let topMinDist = Infinity;
    if (topVessel && topVessel.positions.length > 0) {
      topVessel.positions.forEach((p) => {
        const d = calculateDistanceNm(originLat, originLon, p.lat, p.lon);
        if (d < topMinDist) {
          topMinDist = d;
          topCpaPoint = p;
        }
      });
    }

    // Step-aware camera transition
    if (replayStep === null) {
      map.flyTo({
        center: [centerLon, centerLat],
        zoom: 9.0,
        duration: 800,
      });
    } else if (replayStep <= 3) {
      map.flyTo({
        center: [centerLon, centerLat],
        zoom: 9.4,
        duration: 600,
      });
    } else if (replayStep === 4) {
      map.flyTo({
        center: [(centerLon + originLon) / 2, (centerLat + originLat) / 2],
        zoom: 8.9,
        duration: 600,
      });
    } else if (replayStep === 5) {
      map.flyTo({
        center: [originLon, originLat],
        zoom: 9.4,
        duration: 600,
      });
    } else if (replayStep === 6 || replayStep === 7) {
      map.flyTo({
        center: [originLon, originLat],
        zoom: 8.9,
        duration: 600,
      });
    } else if (replayStep >= 8) {
      if (topCpaPoint) {
        map.flyTo({
          center: [(originLon + topCpaPoint.lon) / 2, (originLat + topCpaPoint.lat) / 2],
          zoom: 9.3,
          duration: 600,
        });
      } else {
        map.flyTo({
          center: [originLon, originLat],
          zoom: 9.0,
          duration: 600,
        });
      }
    }

    // Determine fine-grained layer and marker visibility based on replayStep
    const showSpill = replayStep === null ? layerVisibility.spillPolygon : replayStep >= 2;
    const showCentroid = replayStep === null ? true : replayStep >= 3;
    const showHindcast = replayStep === null ? layerVisibility.driftTrajectory : replayStep >= 4;
    const showForecast = replayStep === null ? layerVisibility.driftTrajectory : replayStep >= 9;
    const showSource = replayStep === null ? true : replayStep >= 5;
    const showVesselMarkers = replayStep === null ? layerVisibility.vesselTracks : replayStep >= 6;
    const showVesselTracks = replayStep === null ? layerVisibility.vesselTracks : replayStep >= 7;
    const showAnomalies = replayStep === null ? true : replayStep >= 7;
    const showCpa = replayStep === null ? true : replayStep >= 8;
    const showSelectedTrack = replayStep === null ? true : replayStep >= 9;
    const showGroundTruth = replayStep === null ? layerVisibility.groundTruth : replayStep >= 9;

    if (map.isStyleLoaded()) {
      // Toggle Style Layer Visibilities
      if (map.getLayer('spill-fill')) map.setLayoutProperty('spill-fill', 'visibility', showSpill ? 'visible' : 'none');
      if (map.getLayer('spill-line')) map.setLayoutProperty('spill-line', 'visibility', showSpill ? 'visible' : 'none');
      if (map.getLayer('drift-trail')) map.setLayoutProperty('drift-trail', 'visibility', showHindcast ? 'visible' : 'none');
      if (map.getLayer('drift-nodes')) map.setLayoutProperty('drift-nodes', 'visibility', showHindcast ? 'visible' : 'none');
      if (map.getLayer('drift-forecast-trail')) map.setLayoutProperty('drift-forecast-trail', 'visibility', showForecast ? 'visible' : 'none');
      if (map.getLayer('drift-forecast-nodes')) map.setLayoutProperty('drift-forecast-nodes', 'visibility', showForecast ? 'visible' : 'none');
      if (map.getLayer('vessel-tracks-unselected')) map.setLayoutProperty('vessel-tracks-unselected', 'visibility', showVesselTracks ? 'visible' : 'none');
      if (map.getLayer('vessel-track-pings')) map.setLayoutProperty('vessel-track-pings', 'visibility', showVesselTracks ? 'visible' : 'none');
      if (map.getLayer('vessel-tracks-selected')) map.setLayoutProperty('vessel-tracks-selected', 'visibility', (showVesselTracks && showSelectedTrack) ? 'visible' : 'none');
      if (map.getLayer('correlation-vector-trail')) map.setLayoutProperty('correlation-vector-trail', 'visibility', showCpa ? 'visible' : 'none');

      // 1. Update Spill Source
      const spillSource = map.getSource('spill-poly-source') as maplibregl.GeoJSONSource;
      if (spillSource) {
        const polyGeom = investigation?.spill?.geometry || scenario.spill.geometry;
        const areaVal = investigation?.spill?.area_sqkm || scenario.spill.areaSqKm;
        const confVal = investigation?.spill?.confidence || scenario.spill.confidence;

        spillSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                area: areaVal,
                confidence: confVal,
              },
              geometry: polyGeom,
            },
          ],
        });
      }

      // 2. Update Drift Hindcast Source
      const driftSource = map.getSource('drift-source') as maplibregl.GeoJSONSource;
      if (driftSource) {
        let hindcastCoords: [number, number][] = [];
        let hindcastPoints: any[] = [];

        if (investigation?.drift?.hindcast_points && investigation.drift.hindcast_points.length > 0) {
          hindcastCoords = investigation.drift.hindcast_points.map((p) => [p.lon, p.lat]);
          hindcastPoints = investigation.drift.hindcast_points.map((p, idx) => ({
            type: 'Feature' as const,
            properties: { step: p.step ?? idx, time: p.time },
            geometry: {
              type: 'Point' as const,
              coordinates: [p.lon, p.lat],
            },
          }));
        } else {
          hindcastCoords = scenario.drift.trajectory.map((p) => [p.lon, p.lat]);
          hindcastPoints = scenario.drift.trajectory.map((p) => ({
            type: 'Feature' as const,
            properties: { step: p.step, time: p.time },
            geometry: {
              type: 'Point' as const,
              coordinates: [p.lon, p.lat],
            },
          }));
        }

        driftSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'HINDCAST' },
              geometry: {
                type: 'LineString',
                coordinates: hindcastCoords,
              },
            },
            ...hindcastPoints,
          ],
        });
      }

      // 3. Update Drift Forecast Source
      const forecastSource = map.getSource('drift-forecast-source') as maplibregl.GeoJSONSource;
      if (forecastSource) {
        let forecastCoords: [number, number][] = [];
        let forecastPoints: any[] = [];

        if (investigation?.drift?.forecast_points && investigation.drift.forecast_points.length > 0) {
          forecastCoords = investigation.drift.forecast_points.map((p) => [p.lon, p.lat]);
          forecastPoints = investigation.drift.forecast_points.map((p, idx) => ({
            type: 'Feature' as const,
            properties: { step: p.step ?? idx, time: p.time },
            geometry: {
              type: 'Point' as const,
              coordinates: [p.lon, p.lat],
            },
          }));
        } else {
          // Synthetic forward projection from observed centroid
          const f0: [number, number] = [centerLon, centerLat];
          const f1: [number, number] = [centerLon + 0.04, centerLat + 0.035];
          const f2: [number, number] = [centerLon + 0.085, centerLat + 0.075];
          forecastCoords = [f0, f1, f2];
          forecastPoints = [
            { type: 'Feature' as const, properties: { step: 0, time: '+6h' }, geometry: { type: 'Point' as const, coordinates: f0 } },
            { type: 'Feature' as const, properties: { step: 1, time: '+12h' }, geometry: { type: 'Point' as const, coordinates: f1 } },
            { type: 'Feature' as const, properties: { step: 2, time: '+24h' }, geometry: { type: 'Point' as const, coordinates: f2 } },
          ];
        }

        forecastSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'FORECAST' },
              geometry: {
                type: 'LineString',
                coordinates: forecastCoords,
              },
            },
            ...forecastPoints,
          ],
        });
      }

      // 4. Update Vessel Tracks Source
      const vesselSource = map.getSource('vessel-tracks-source') as maplibregl.GeoJSONSource;
      if (vesselSource) {
        const trackFeatures: any[] = [];
        if (showVesselTracks) {
          scenario.vessels.forEach((v) => {
            const isSelected = selectedVesselId === v.id || selectedVesselId === v.mmsi || (replayStep !== null && replayStep >= 9 && v.rank === 1);
            const coords = v.positions.map((p) => [p.lon, p.lat]);
            if (coords.length > 1) {
              trackFeatures.push({
                type: 'Feature',
                properties: {
                  vesselId: v.id,
                  mmsi: v.mmsi,
                  name: v.name,
                  rank: v.rank,
                  score: v.suspicionScore,
                  isSelected,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: coords,
                },
              });
            }
            v.positions.forEach((p, idx) => {
              trackFeatures.push({
                type: 'Feature',
                properties: {
                  vesselId: v.id,
                  mmsi: v.mmsi,
                  time: p.time,
                  sog: p.sog,
                  cog: p.cog,
                  isSelected,
                  isEndpoint: idx === v.positions.length - 1,
                },
                geometry: {
                  type: 'Point',
                  coordinates: [p.lon, p.lat],
                },
              });
            });
          });
        }

        vesselSource.setData({
          type: 'FeatureCollection',
          features: trackFeatures,
        });
      }
    }

    // Recreate Tactical Markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Observed Spill Centroid Marker
    if (showCentroid) {
      const centroidEl = document.createElement('div');
      centroidEl.className = 'cursor-pointer flex flex-col items-center select-none';
      centroidEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-amber-950/90 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.8)]">
            <div class="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>
        </div>
        <div class="px-1.5 py-0.2 mt-0.5 rounded-[2px] bg-bridge-950/95 border border-amber-400 text-amber-300 font-mono text-[9px] font-bold shadow tracking-wider whitespace-nowrap">
          SPILL CENTROID (OBSERVED)
        </div>
      `;
      const centroidMarker = new maplibregl.Marker({ element: centroidEl })
        .setLngLat([centerLon, centerLat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, className: 'maritime-popup' }).setHTML(`
            <div style="background:#080d14; color:#e2eaf4; padding:8px; font-family:monospace; font-size:11px; border:1px solid #f59e0b;">
              <div style="font-weight:bold; color:#fbbf24; margin-bottom:4px;">OBSERVED SPILL CENTROID</div>
              <div>Coords: <b>${centerLat.toFixed(4)}°N, ${centerLon.toFixed(4)}°E</b></div>
              <div>Estimated Area: <b>${(investigation?.spill?.area_sqkm || scenario.spill.areaSqKm)} km²</b></div>
            </div>
          `)
        )
        .addTo(map);
      markersRef.current.push(centroidMarker);
    }

    // Reconstructed Origin / Spill Source Marker Locus
    if (showSource) {
      const sourceEl = document.createElement('div');
      sourceEl.className = 'cursor-pointer flex flex-col items-center select-none';
      sourceEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-red-950/90 border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
          </div>
          <div class="absolute -inset-1.5 rounded-full border border-amber-400/80 animate-ping"></div>
        </div>
        <div class="px-2 py-0.5 mt-1 rounded-[2px] bg-bridge-950/95 border border-red-500 text-red-300 font-mono text-[9px] font-bold shadow-lg tracking-wider whitespace-nowrap">
          RECONSTRUCTED SOURCE
        </div>
      `;

      const sourceMarker = new maplibregl.Marker({ element: sourceEl })
        .setLngLat([originLon, originLat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, className: 'maritime-popup' }).setHTML(`
            <div style="background:#080d14; color:#e2eaf4; padding:8px; font-family:monospace; font-size:11px; border:1px solid #ef4444;">
              <div style="font-weight:bold; color:#f87171; margin-bottom:4px;">RECONSTRUCTED DISCHARGE SOURCE</div>
              <div>Coords: <b>${originLat.toFixed(4)}°N, ${originLon.toFixed(4)}°E</b></div>
              <div>Estimated Time: <b>${originTime}</b></div>
              <div>Confidence: <b>${investigation?.source?.confidence ? (investigation.source.confidence * 100).toFixed(1) + '%' : '94.0%'}</b></div>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(sourceMarker);
    }

    // Ground Truth Origin Marker if in groundTruth layer
    if (showGroundTruth && scenario.groundTruth) {
      const gtEl = document.createElement('div');
      gtEl.className =
        'w-6 h-6 rounded-full bg-emerald-950/90 border-2 border-emerald-400 flex items-center justify-center cursor-pointer shadow-lg';
      gtEl.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      `;

      const gtMarker = new maplibregl.Marker({ element: gtEl })
        .setLngLat([scenario.groundTruth.sourceCoords[1], scenario.groundTruth.sourceCoords[0]])
        .setPopup(
          new maplibregl.Popup({ offset: 12, className: 'maritime-popup' }).setHTML(`
            <div style="background:#080d14; color:#e2eaf4; padding:8px; font-family:monospace; font-size:11px; border:1px solid #16a34a;">
              <div style="font-weight:bold; color:#22c55e; margin-bottom:4px;">GROUND TRUTH LOCUS</div>
              <div>Source: <b>${scenario.groundTruth.sourceVessel}</b></div>
              <div>MMSI: ${scenario.groundTruth.sourceMmsi}</div>
              <div>Time: ${scenario.groundTruth.sourceTimestamp}</div>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(gtMarker);
    }

    // Correlation Vector & Selected Suspect Highlights (CPA, Anomaly, Locus Vector)
    const activeVesselForCpa =
      scenario.vessels.find((v) => v.id === selectedVesselId || v.mmsi === selectedVesselId) ||
      (showCpa && scenario.vessels.length > 0 ? scenario.vessels[0] : null);

    const vectorSource = map.getSource('correlation-vector-source') as maplibregl.GeoJSONSource;

    if (showCpa && activeVesselForCpa && activeVesselForCpa.positions.length > 0) {
      let minDistance = Infinity;
      let cpaPoint = activeVesselForCpa.positions[0];

      activeVesselForCpa.positions.forEach((p) => {
        const d = calculateDistanceNm(originLat, originLon, p.lat, p.lon);
        if (d < minDistance) {
          minDistance = d;
          cpaPoint = p;
        }
      });

      // Update Correlation Vector Line from Source to CPA
      if (vectorSource) {
        vectorSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { distanceNm: minDistance },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [originLon, originLat],
                  [cpaPoint.lon, cpaPoint.lat],
                ],
              },
            },
          ],
        });
      }

      // CPA Radar Marker
      const cpaEl = document.createElement('div');
      cpaEl.className = 'cursor-pointer flex flex-col items-center select-none';
      cpaEl.innerHTML = `
        <div class="w-4 h-4 rounded-full bg-amber-400 border-2 border-bridge-950 shadow-[0_0_10px_rgba(245,158,11,1)] animate-bounce"></div>
        <div class="px-1.5 py-0.2 rounded-[2px] bg-amber-950/95 border border-amber-400 text-amber-200 font-mono text-[9px] font-bold mt-0.5 shadow whitespace-nowrap">
          CPA: ${minDistance.toFixed(2)} NM
        </div>
      `;

      const cpaMarker = new maplibregl.Marker({ element: cpaEl })
        .setLngLat([cpaPoint.lon, cpaPoint.lat])
        .addTo(map);
      markersRef.current.push(cpaMarker);

      // Highlight Anomaly Markers (AIS Gap / Speed Drop)
      if (showAnomalies && activeVesselForCpa.anomalies && activeVesselForCpa.anomalies.length > 0) {
        activeVesselForCpa.anomalies.forEach((ano) => {
          const anoEl = document.createElement('div');
          anoEl.className = 'cursor-pointer flex flex-col items-center select-none';
          anoEl.innerHTML = `
            <div class="px-2 py-0.5 rounded-[2px] bg-red-950/95 border border-red-500 text-red-300 font-mono text-[9px] font-bold shadow flex items-center space-x-1 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              <span>${ano.type}: ${(ano as any).details || ano.description || 'ANOMALY'}</span>
            </div>
          `;

          const anoMarker = new maplibregl.Marker({ element: anoEl })
            .setLngLat([cpaPoint.lon, cpaPoint.lat + 0.015])
            .addTo(map);
          markersRef.current.push(anoMarker);
        });
      }
    } else {
      if (vectorSource) {
        vectorSource.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    }

    // Candidate Vessel Markers with Directional Headings
    if (showVesselMarkers) {
      scenario.vessels.forEach((vessel) => {
        const lastPos = vessel.positions[vessel.positions.length - 1];
        if (!lastPos) return;

        const isSelected = selectedVesselId === vessel.id || selectedVesselId === vessel.mmsi || (replayStep !== null && replayStep >= 9 && vessel.rank === 1);
        const heading = vessel.headingDeg || vessel.courseDeg || 0;

        const vEl = document.createElement('div');
        vEl.className = 'cursor-pointer flex flex-col items-center select-none transition-transform hover:scale-110';

        // Directional Heading Indicator Arrow
        const arrow = document.createElement('div');
        arrow.className = 'w-4 h-4 mb-0.5 flex items-center justify-center transition-transform';
        arrow.style.transform = `rotate(${heading}deg)`;
        const arrowColor = isSelected
          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,1)]'
          : vessel.suspicionScore >= 75
          ? 'text-red-400'
          : vessel.suspicionScore >= 40
          ? 'text-amber-400'
          : 'text-blue-400';

        arrow.innerHTML = `
          <svg viewBox="0 0 24 24" class="w-4 h-4 ${arrowColor}" fill="currentColor">
            <polygon points="12,2 22,22 12,17 2,22" />
          </svg>
        `;
        vEl.appendChild(arrow);

        const box = document.createElement('div');
        const borderColor =
          vessel.suspicionScore >= 75
            ? 'border-amber-500 bg-amber-950/90 text-amber-200'
            : vessel.suspicionScore >= 40
            ? 'border-blue-500 bg-blue-950/90 text-blue-200'
            : 'border-bridge-600 bg-bridge-900/90 text-bridge-200';

        box.className = `px-1.5 py-0.5 rounded-[2px] font-mono font-bold text-[10px] border shadow ${borderColor} ${
          isSelected ? 'ring-2 ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : ''
        }`;
        box.innerText = `#${vessel.rank} ${vessel.name}`;

        const sub = document.createElement('div');
        sub.className =
          'font-mono text-[9px] px-1 bg-bridge-950/95 text-bridge-300 border border-bridge-800 rounded-[2px] mt-0.5 whitespace-nowrap';
        sub.innerText = `${vessel.speedKnots} kn | ${vessel.suspicionScore.toFixed(0)}/100`;

        vEl.appendChild(box);
        vEl.appendChild(sub);

        vEl.addEventListener('click', () => {
          if (onSelectVessel) onSelectVessel(vessel.id);
        });

        const vMarker = new maplibregl.Marker({ element: vEl })
          .setLngLat([lastPos.lon, lastPos.lat])
          .addTo(map);

        markersRef.current.push(vMarker);
      });
    }
  }, [scenario, investigation, selectedVesselId, layerVisibility, onSelectVessel, replayStep]);

  // Update Basemap style
  const handleChangeBasemap = (type: BasemapType) => {
    setCurrentBasemap(type);
    const map = mapRef.current;
    if (map) {
      map.setStyle(getStyleForBasemap(type));
    }
  };

  // Zoom handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => {
    mapRef.current?.flyTo({
      center: [scenario.spill.centroid[1], scenario.spill.centroid[0]],
      zoom: 9.0,
      duration: 800,
    });
  };

  // Layer visibility toggle
  const handleToggleLayer = (key: keyof typeof layerVisibility) => {
    const updated = { ...layerVisibility, [key]: !layerVisibility[key] };
    setLayerVisibility(updated);

    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (key === 'spillPolygon') {
      const vis = updated.spillPolygon ? 'visible' : 'none';
      if (map.getLayer('spill-fill')) map.setLayoutProperty('spill-fill', 'visibility', vis);
      if (map.getLayer('spill-line')) map.setLayoutProperty('spill-line', 'visibility', vis);
    } else if (key === 'driftTrajectory') {
      const vis = updated.driftTrajectory ? 'visible' : 'none';
      if (map.getLayer('drift-trail')) map.setLayoutProperty('drift-trail', 'visibility', vis);
      if (map.getLayer('drift-nodes')) map.setLayoutProperty('drift-nodes', 'visibility', vis);
    } else if (key === 'vesselTracks') {
      const vis = updated.vesselTracks ? 'visible' : 'none';
      if (map.getLayer('vessel-tracks-unselected')) map.setLayoutProperty('vessel-tracks-unselected', 'visibility', vis);
      if (map.getLayer('vessel-tracks-selected')) map.setLayoutProperty('vessel-tracks-selected', 'visibility', vis);
      if (map.getLayer('vessel-track-pings')) map.setLayoutProperty('vessel-track-pings', 'visibility', vis);
    }
  };

  const selectedVessel = scenario.vessels.find((v) => v.id === selectedVesselId);

  return (
    <div className={`relative w-full h-full bg-bridge-950 overflow-hidden ${className}`}>
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full bg-[#080e1a] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Floating Tactical Map Controls Toolbar */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        currentBasemap={currentBasemap}
        onChangeBasemap={handleChangeBasemap}
        layerVisibility={layerVisibility}
        onToggleLayer={handleToggleLayer}
        isMeasuring={isMeasuring}
        onToggleMeasuring={() => {
          setIsMeasuring(!isMeasuring);
          setMeasurePoints([]);
          setMeasuredDistanceNm(null);
        }}
        measuredDistanceNm={measuredDistanceNm}
      />

      {/* Selected Vessel Intelligence Detail Floating Drawer */}
      {selectedVessel && (
        <div className="absolute top-3 right-14 z-30 w-84 max-w-sm">
          <VesselDetailPanel
            vessel={{
              id: selectedVessel.id,
              mmsi: selectedVessel.mmsi,
              imo: selectedVessel.imo,
              name: selectedVessel.name,
              vesselType: selectedVessel.vesselType,
              flag: selectedVessel.flag,
              lengthM: selectedVessel.lengthM,
              widthM: selectedVessel.widthM,
              draughtM: selectedVessel.draughtM,
              speedKnots: selectedVessel.speedKnots,
              courseDeg: selectedVessel.courseDeg,
              headingDeg: selectedVessel.headingDeg,
              minDistanceNm: selectedVessel.minDistanceNm,
              correlationScore: selectedVessel.suspicionScore,
              rank: selectedVessel.rank,
              anomalies: selectedVessel.anomalies,
              positions: selectedVessel.positions,
            }}
            onClose={() => {
              if (onSelectVessel) onSelectVessel('');
            }}
            onInspectTrack={() => {
              if (mapRef.current && selectedVessel.positions.length > 0) {
                const p = selectedVessel.positions[selectedVessel.positions.length - 1];
                mapRef.current.flyTo({ center: [p.lon, p.lat], zoom: 10, duration: 800 });
              }
            }}
            onRequestInspection={(name) => {
              alert(`Inspection and interception request transmitted for: ${name}`);
            }}
          />
        </div>
      )}

      {/* Top Left: Scenario & Spill Title Tag */}
      <div className="absolute top-3 left-3 bg-bridge-900/90 border border-bridge-700 rounded-[2px] p-2 text-xs font-mono shadow-lg select-none z-10 max-w-sm">
        <div className="flex items-center space-x-1.5 font-bold text-bridge-100 text-[11px] truncate">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span className="truncate">{scenario.spill.id}</span>
          <span className="text-bridge-500">•</span>
          <span className="text-red-400 font-semibold">{scenario.spill.areaSqKm} km²</span>
        </div>
        <div className="text-[10px] text-bridge-400 truncate mt-0.5">{scenario.region}</div>
      </div>

      {/* Bottom Right: Docked Tactical Map Legend */}
      <div className="absolute bottom-8 right-3 bg-bridge-950/95 border border-bridge-700 rounded-[2px] p-2 text-xs font-mono shadow-xl select-none z-10 w-64 max-w-[calc(100vw-24px)]">
        <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-bridge-800 text-[10px] text-bridge-400 font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-1.5 text-bridge-200">
            <span className="w-2 h-2 rounded-[1px] bg-blue-500" />
            <span>TACTICAL MAP LEGEND</span>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-bridge-500 hover:text-bridge-300 font-mono text-[9px] px-1 py-0.5 rounded-[1px] border border-bridge-800"
          >
            {showLegend ? 'COLLAPSE' : 'EXPAND'}
          </button>
        </div>

        {showLegend && (
          <div className="grid grid-cols-1 gap-1 text-[10px]">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-2 bg-red-600/60 border border-red-400 rounded-[1px] flex-shrink-0" />
              <span className="text-bridge-200">Observed SAR Oil Slick</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 bg-cyan-400 flex-shrink-0" />
              <span className="text-bridge-200">Lagrangian Hindcast Trajectory</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 border-t border-dashed border-amber-400 flex-shrink-0" />
              <span className="text-bridge-200">Forecast Advection Projection</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-950/80 flex items-center justify-center flex-shrink-0">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
              </span>
              <span className="text-bridge-200">Estimated Origin Locus</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-1 bg-amber-400 flex-shrink-0 rounded-[1px]" />
              <span className="text-amber-300 font-semibold">Primary Suspect Vessel Track</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 bg-bridge-500 flex-shrink-0" />
              <span className="text-bridge-400">Other AIS Vessel Tracks</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-400 flex-shrink-0" />
              <span className="text-bridge-200">Closest Approach (CPA) Vector</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-red-900 border border-red-500 flex items-center justify-center text-[7px] text-red-200 font-bold flex-shrink-0">
                !
              </span>
              <span className="text-bridge-200">AIS Gap / Speed Drop Anomaly</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left: Tactical Coordinate & Geodetic HUD */}
      <div className="absolute bottom-3 left-3 bg-bridge-900/90 border border-bridge-700 rounded-[2px] px-2.5 py-1 text-[10px] font-mono text-bridge-300 flex items-center space-x-3 shadow-lg select-none z-10">
        <div className="flex items-center space-x-1">
          <Crosshair className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span>
            {cursorCoords
              ? `${toDegreesMinutes(cursorCoords.lat, true)} | ${toDegreesMinutes(cursorCoords.lon, false)}`
              : 'COORDS: --°--.--\' N | --°--.--\' E'}
          </span>
        </div>
        <div className="w-px h-3 bg-bridge-700" />
        <div>
          DECIMAL: {cursorCoords ? `${cursorCoords.lat.toFixed(4)}°, ${cursorCoords.lon.toFixed(4)}°` : '--'}
        </div>
        <div className="w-px h-3 bg-bridge-700" />
        <div>ZOOM: {zoomLevel}x</div>
        <div className="w-px h-3 bg-bridge-700" />
        <div className="text-emerald-400">WGS84 / EPSG:4326</div>
      </div>
    </div>
  );
};
