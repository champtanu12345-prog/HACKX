import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DriftSimulationPoint } from '../../types';

interface DriftMapProps {
  spillCentroid: [number, number];
  spillGeometry?: any;
  hindcastPoints: DriftSimulationPoint[];
  forecastPoints: DriftSimulationPoint[];
  estimatedOrigin?: [number, number];
  currentTimestepIndex?: number;
  activeRunType?: 'HINDCAST' | 'FORECAST';
  className?: string;
}

export const DriftMap: React.FC<DriftMapProps> = ({
  spillCentroid,
  spillGeometry,
  hindcastPoints,
  forecastPoints,
  estimatedOrigin,
  currentTimestepIndex = 0,
  activeRunType = 'HINDCAST',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const scrubberMarkerRef = useRef<maplibregl.Marker | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CARTO, © OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [spillCentroid[1], spillCentroid[0]],
      zoom: 9.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('load', () => {
      // 1. Observed Spill Polygon Layer
      map.addSource('spill-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: spillGeometry
            ? [
                {
                  type: 'Feature',
                  properties: { type: 'OBSERVED_SLICK' },
                  geometry: spillGeometry,
                },
              ]
            : [],
        },
      });

      map.addLayer({
        id: 'spill-fill',
        type: 'fill',
        source: 'spill-source',
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.40,
        },
      });

      map.addLayer({
        id: 'spill-outline',
        type: 'line',
        source: 'spill-source',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5,
        },
      });

      // 2. Hindcast Trajectory (Backward in time) - Blue Dashed
      map.addSource('hindcast-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'hindcast-line',
        type: 'line',
        source: 'hindcast-source',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#38bdf8', // Sky blue
          'line-width': 2.5,
          'line-dasharray': [4, 2], // Distinct dashed style
        },
      });

      map.addLayer({
        id: 'hindcast-nodes',
        type: 'circle',
        source: 'hindcast-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#38bdf8',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#030712',
        },
      });

      // 3. Forecast Trajectory (Forward in time) - Amber Dotted
      map.addSource('forecast-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'forecast-line',
        type: 'line',
        source: 'forecast-source',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#f59e0b', // Amber/orange
          'line-width': 2.5,
          'line-dasharray': [2, 2], // Distinct fine dotted style
        },
      });

      map.addLayer({
        id: 'forecast-nodes',
        type: 'circle',
        source: 'forecast-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#030712',
        },
      });

      // 4. Uncertainty Envelopes
      map.addSource('uncertainty-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'uncertainty-fill',
        type: 'circle',
        source: 'uncertainty-source',
        paint: {
          'circle-radius': ['get', 'radius_px'],
          'circle-color': '#10b981',
          'circle-opacity': 0.15,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#10b981',
        },
      });
    });

    mapRef.current = map;

    return () => {
      if (scrubberMarkerRef.current) scrubberMarkerRef.current.remove();
      if (originMarkerRef.current) originMarkerRef.current.remove();
      map.remove();
    };
  }, []);

  // Update map data whenever points or scenarios update
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update Spill Polygon
    const spillSource = map.getSource('spill-source') as maplibregl.GeoJSONSource;
    if (spillSource && spillGeometry) {
      spillSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'OBSERVED_SLICK' },
            geometry: spillGeometry,
          },
        ],
      });
    }

    // Update Hindcast GeoJSON
    const hindcastSource = map.getSource('hindcast-source') as maplibregl.GeoJSONSource;
    if (hindcastSource) {
      const lineCoords = hindcastPoints.map((p) => [p.longitude, p.latitude]);
      const nodeFeatures = hindcastPoints.map((p) => ({
        type: 'Feature' as const,
        properties: { step: p.timestep_index, time: p.timestamp, vel: p.velocity },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude],
        },
      }));

      hindcastSource.setData({
        type: 'FeatureCollection',
        features: [
          ...(lineCoords.length >= 2
            ? [
                {
                  type: 'Feature' as const,
                  properties: { type: 'HINDCAST' },
                  geometry: {
                    type: 'LineString' as const,
                    coordinates: lineCoords,
                  },
                },
              ]
            : []),
          ...nodeFeatures,
        ],
      });
    }

    // Update Forecast GeoJSON
    const forecastSource = map.getSource('forecast-source') as maplibregl.GeoJSONSource;
    if (forecastSource) {
      const fLineCoords = forecastPoints.map((p) => [p.longitude, p.latitude]);
      const fNodeFeatures = forecastPoints.map((p) => ({
        type: 'Feature' as const,
        properties: { step: p.timestep_index, time: p.timestamp, vel: p.velocity },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude],
        },
      }));

      forecastSource.setData({
        type: 'FeatureCollection',
        features: [
          ...(fLineCoords.length >= 2
            ? [
                {
                  type: 'Feature' as const,
                  properties: { type: 'FORECAST' },
                  geometry: {
                    type: 'LineString' as const,
                    coordinates: fLineCoords,
                  },
                },
              ]
            : []),
          ...fNodeFeatures,
        ],
      });
    }

    // Update Estimated Origin Marker
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    if (estimatedOrigin) {
      const originEl = document.createElement('div');
      originEl.className =
        'flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-lg text-[9px] font-mono font-bold';
      originEl.innerText = 'ORIG';
      originEl.title = `Estimated Source: ${estimatedOrigin[0].toFixed(4)}°N, ${estimatedOrigin[1].toFixed(4)}°E`;

      originMarkerRef.current = new maplibregl.Marker({ element: originEl })
        .setLngLat([estimatedOrigin[1], estimatedOrigin[0]])
        .addTo(map);
    }

    // Fly to center or fit bounds
    map.flyTo({
      center: [spillCentroid[1], spillCentroid[0]],
      zoom: 9.3,
      duration: 800,
    });
  }, [spillCentroid, spillGeometry, hindcastPoints, forecastPoints, estimatedOrigin]);

  // Update Time Slider Scrubber Marker on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeList = activeRunType === 'HINDCAST' ? hindcastPoints : forecastPoints;
    const targetPoint = activeList.find((p) => p.timestep_index === currentTimestepIndex) || activeList[0];

    if (!targetPoint) return;

    if (!scrubberMarkerRef.current) {
      const el = document.createElement('div');
      el.className =
        'w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-xl animate-pulse';
      const inner = document.createElement('div');
      inner.className = 'w-2 h-2 rounded-full bg-blue-600';
      el.appendChild(inner);

      scrubberMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([targetPoint.longitude, targetPoint.latitude])
        .addTo(map);
    } else {
      scrubberMarkerRef.current.setLngLat([targetPoint.longitude, targetPoint.latitude]);
    }
  }, [currentTimestepIndex, activeRunType, hindcastPoints, forecastPoints]);

  return (
    <div className={`relative w-full h-full bg-[#05080d] overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Trajectory Legend Overlay */}
      <div className="absolute top-3 left-3 bg-bridge-950/90 border border-bridge-800 p-2.5 rounded-[2px] font-mono text-[10px] space-y-1.5 backdrop-blur-sm pointer-events-none shadow-xl">
        <div className="text-bridge-400 font-bold uppercase tracking-wider text-[9px] border-b border-bridge-800 pb-1">
          TRAJECTORY LINE STYLES
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-red-500"></div>
          <span className="text-red-400 font-semibold">Observed Slick (T0 Satellite)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-sky-400"></div>
          <span className="text-sky-400">Hindcast Trajectory (T-Backwards)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-t-2 border-dotted border-amber-400"></div>
          <span className="text-amber-400">Forecast Trajectory (T+Forwards)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black"></div>
          <span className="text-emerald-400 font-bold">Estimated Origin (Source Locus)</span>
        </div>
      </div>
    </div>
  );
};
