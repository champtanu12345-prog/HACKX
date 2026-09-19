import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Crosshair, Navigation, Eye, EyeOff } from 'lucide-react';
import { SpillDetection, DriftRun, SuspectAttribution } from '../../types';

interface MaritimeMapProps {
  selectedSpill?: SpillDetection;
  driftRuns: DriftRun[];
  suspects: SuspectAttribution[];
  onSelectVessel?: (vessel: SuspectAttribution) => void;
}

export const MaritimeMap: React.FC<MaritimeMapProps> = ({
  selectedSpill,
  driftRuns,
  suspects,
  onSelectVessel,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(8.5);

  // Layer Visibility Toggles
  const [showSpillLayer, setShowSpillLayer] = useState(true);
  const [showDriftLayer, setShowDriftLayer] = useState(true);
  const [showAisLayer, setShowAisLayer] = useState(true);

  // Markers ref
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialLat = selectedSpill ? selectedSpill.centroid_lat : 19.12;
    const initialLon = selectedSpill ? selectedSpill.centroid_lon : 72.35;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: [initialLon, initialLat],
      zoom: 8.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('mousemove', (e) => {
      setCursorPos({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    });

    map.on('zoom', () => {
      setZoomLevel(Number(map.getZoom().toFixed(1)));
    });

    map.on('load', () => {
      // Add Sources and Layers for Spill & Drift
      map.addSource('spill-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Oil Spill Fill Layer
      map.addLayer({
        id: 'spill-fill',
        type: 'fill',
        source: 'spill-source',
        paint: {
          'fill-color': '#F04438',
          'fill-opacity': 0.35,
        },
      });

      // Oil Spill Outline Layer
      map.addLayer({
        id: 'spill-outline',
        type: 'line',
        source: 'spill-source',
        paint: {
          'line-color': '#EF4444',
          'line-width': 2.5,
        },
      });

      // Drift Trajectory Source & Layer
      map.addSource('drift-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'drift-line',
        type: 'line',
        source: 'drift-source',
        paint: {
          'line-color': '#06B6D4',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      map.addLayer({
        id: 'drift-points',
        type: 'circle',
        source: 'drift-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4,
          'circle-color': '#06B6D4',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#121C2A',
        },
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
    };
  }, []);

  // Update map features whenever selectedSpill, driftRuns, or suspects change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // 1. Update Spill Polygon
    const spillSource = map.getSource('spill-source') as maplibregl.GeoJSONSource;
    if (spillSource && selectedSpill) {
      try {
        const geom = JSON.parse(selectedSpill.geometry_geojson);
        spillSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: selectedSpill.id,
                area: selectedSpill.area_sqkm,
              },
              geometry: geom,
            },
          ],
        });

        // Center map to spill
        map.flyTo({
          center: [selectedSpill.centroid_lon, selectedSpill.centroid_lat],
          zoom: 9.5,
          duration: 1200,
        });
      } catch (err) {
        console.error('Error parsing spill geometry', err);
      }
    }

    // 2. Update Drift Trajectory
    const driftSource = map.getSource('drift-source') as maplibregl.GeoJSONSource;
    if (driftSource && driftRuns.length > 0) {
      const activeRun = driftRuns[0];
      const points = activeRun.trajectory_points || [];

      if (points.length > 1) {
        const lineCoords = points.map((p) => [p.longitude, p.latitude]);
        const pointFeatures = points.map((p, idx) => ({
          type: 'Feature' as const,
          properties: {
            step: idx,
            time: p.timestep_utc,
            uncertainty: p.uncertainty_radius_m,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [p.longitude, p.latitude],
          },
        }));

        driftSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: activeRun.run_type },
              geometry: {
                type: 'LineString',
                coordinates: lineCoords,
              },
            },
            ...pointFeatures,
          ],
        });
      }
    }

    // 3. Clear and recreate vessel markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Hindcast Origin Marker if available
    if (driftRuns.length > 0 && driftRuns[0].estimated_origin_lat && driftRuns[0].estimated_origin_lon) {
      const originEl = document.createElement('div');
      originEl.className = 'w-5 h-5 rounded-full border-2 border-tactical-cyan bg-cyan-950/80 flex items-center justify-center animate-ping';
      const innerEl = document.createElement('div');
      innerEl.className = 'w-2 h-2 rounded-full bg-tactical-cyan';
      originEl.appendChild(innerEl);

      const originMarker = new maplibregl.Marker({ element: originEl })
        .setLngLat([driftRuns[0].estimated_origin_lon, driftRuns[0].estimated_origin_lat])
        .setPopup(
          new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div style="background:#0b131e; color:#e2eaf4; padding:6px; font-family:monospace; font-size:11px; border:1px solid #06b6d4;">
              <div style="font-weight:bold; color:#06b6d4;">HINDCAST ORIGIN POINT</div>
              <div>Est. Time: ${driftRuns[0].estimated_origin_time ? new Date(driftRuns[0].estimated_origin_time).toUTCString() : 'N/A'}</div>
              <div>Lat: ${driftRuns[0].estimated_origin_lat.toFixed(4)}°N, Lon: ${driftRuns[0].estimated_origin_lon.toFixed(4)}°E</div>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(originMarker);
    }

    // Add Suspect Vessel Markers
    suspects.forEach((suspect) => {
      const pos = suspect.recent_positions && suspect.recent_positions.length > 0
        ? suspect.recent_positions[suspect.recent_positions.length - 1]
        : null;

      if (!pos) return;

      const isPrimary = suspect.rank === 1;
      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform hover:scale-125 flex flex-col items-center`;

      const iconBox = document.createElement('div');
      iconBox.className = `w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold border ${
        isPrimary
          ? 'bg-red-950 text-tactical-red border-red-500'
          : 'bg-bridge-900 text-bridge-200 border-bridge-600'
      }`;
      iconBox.innerText = `#${suspect.rank}`;

      const labelBox = document.createElement('div');
      labelBox.className = 'text-[9px] font-mono px-1 rounded bg-bridge-950/90 text-bridge-300 border border-bridge-800 whitespace-nowrap mt-0.5';
      labelBox.innerText = suspect.name;

      el.appendChild(iconBox);
      el.appendChild(labelBox);

      el.addEventListener('click', () => {
        if (onSelectVessel) onSelectVessel(suspect);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pos.longitude, pos.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [selectedSpill, driftRuns, suspects, onSelectVessel]);

  // Layer visibility toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('spill-fill')) {
      map.setLayoutProperty('spill-fill', 'visibility', showSpillLayer ? 'visible' : 'none');
      map.setLayoutProperty('spill-outline', 'visibility', showSpillLayer ? 'visible' : 'none');
    }
    if (map.getLayer('drift-line')) {
      map.setLayoutProperty('drift-line', 'visibility', showDriftLayer ? 'visible' : 'none');
      map.setLayoutProperty('drift-points', 'visibility', showDriftLayer ? 'visible' : 'none');
    }
  }, [showSpillLayer, showDriftLayer]);

  return (
    <div className="relative w-full h-full bg-bridge-950">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Left: GIS Layer Controls */}
      <div className="absolute top-3 left-3 bg-bridge-900/90 backdrop-blur-sm border border-bridge-700 rounded p-2 text-xs select-none shadow-lg z-10">
        <div className="flex items-center space-x-1.5 text-bridge-300 font-mono font-semibold pb-1.5 border-b border-bridge-800 mb-1.5">
          <Layers className="w-3.5 h-3.5 text-tactical-cyan" />
          <span>MAP LAYERS</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <button
            onClick={() => setShowSpillLayer(!showSpillLayer)}
            className="flex items-center justify-between w-full px-1.5 py-1 rounded hover:bg-bridge-800 text-bridge-200"
          >
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-tactical-red opacity-80" />
              <span>SAR Oil Slick</span>
            </span>
            {showSpillLayer ? <Eye className="w-3.5 h-3.5 text-tactical-cyan" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
          </button>

          <button
            onClick={() => setShowDriftLayer(!showDriftLayer)}
            className="flex items-center justify-between w-full px-1.5 py-1 rounded hover:bg-bridge-800 text-bridge-200"
          >
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-tactical-cyan" />
              <span>Hindcast Drift Trail</span>
            </span>
            {showDriftLayer ? <Eye className="w-3.5 h-3.5 text-tactical-cyan" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
          </button>

          <button
            onClick={() => setShowAisLayer(!showAisLayer)}
            className="flex items-center justify-between w-full px-1.5 py-1 rounded hover:bg-bridge-800 text-bridge-200"
          >
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full border border-tactical-amber bg-amber-950" />
              <span>AIS Vessel Tracks</span>
            </span>
            {showAisLayer ? <Eye className="w-3.5 h-3.5 text-tactical-cyan" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
          </button>
        </div>
      </div>

      {/* Bottom Left: Cursor Coordinate HUD */}
      <div className="absolute bottom-3 left-3 bg-bridge-900/90 border border-bridge-700 rounded px-2.5 py-1.5 text-[11px] font-mono text-bridge-300 flex items-center space-x-4 shadow z-10">
        <div className="flex items-center space-x-1.5">
          <Crosshair className="w-3.5 h-3.5 text-tactical-cyan" />
          <span>
            {cursorPos
              ? `LAT: ${cursorPos.lat.toFixed(4)}°N  LON: ${cursorPos.lon.toFixed(4)}°E`
              : 'LAT: --.----°N  LON: --.----°E'}
          </span>
        </div>
        <div className="w-px h-3 bg-bridge-700" />
        <div>ZOOM: {zoomLevel}x</div>
        <div className="w-px h-3 bg-bridge-700" />
        <div className="text-tactical-emerald">WGS84 / EPSG:4326</div>
      </div>
    </div>
  );
};
