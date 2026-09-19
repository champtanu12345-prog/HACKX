import React, { useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Circle,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { DriftSimulationPoint } from '../../types';
import { useMapProvider } from '../map/MapProvider';

interface LeafletDriftMapProps {
  spillCentroid: [number, number];
  spillGeometry?: any;
  hindcastPoints: DriftSimulationPoint[];
  forecastPoints: DriftSimulationPoint[];
  estimatedOrigin?: [number, number];
  currentTimestepIndex?: number;
  activeRunType?: 'HINDCAST' | 'FORECAST';
  className?: string;
}

// Controller to smoothly pan when centroid changes
const DriftMapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const createOriginIcon = (): L.DivIcon => {
  return L.divIcon({
    html: `
      <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px dashed #D97706; background: rgba(217, 119, 6, 0.2);"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #D97706;"></div>
      </div>
    `,
    className: 'drift-origin-icon',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const createScrubberIcon = (): L.DivIcon => {
  return L.divIcon({
    html: `
      <div style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="position: absolute; inset: -2px; border-radius: 50%; border: 2px solid #0F52BA; background: rgba(15, 82, 186, 0.3);"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #0F52BA;"></div>
      </div>
    `,
    className: 'drift-scrubber-icon',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export const LeafletDriftMap: React.FC<LeafletDriftMapProps> = ({
  spillCentroid,
  spillGeometry,
  hindcastPoints,
  forecastPoints,
  estimatedOrigin,
  currentTimestepIndex = 0,
  activeRunType = 'HINDCAST',
  className = '',
}) => {
  const { config } = useMapProvider();

  const spillPolygonCoords: [number, number][] = useMemo(() => {
    try {
      if (spillGeometry && spillGeometry.coordinates && spillGeometry.coordinates[0]) {
        return spillGeometry.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
      }
    } catch {
      // Fallback
    }
    const [cLat, cLon] = spillCentroid;
    return [
      [cLat + 0.015, cLon - 0.015],
      [cLat + 0.02, cLon + 0.01],
      [cLat - 0.01, cLon + 0.02],
      [cLat - 0.015, cLon - 0.01],
    ];
  }, [spillGeometry, spillCentroid]);

  const hindcastCoords: [number, number][] = useMemo(() => {
    return hindcastPoints.map((p) => [p.latitude, p.longitude] as [number, number]);
  }, [hindcastPoints]);

  const forecastCoords: [number, number][] = useMemo(() => {
    return forecastPoints.map((p) => [p.latitude, p.longitude] as [number, number]);
  }, [forecastPoints]);

  // Current active points array based on run type
  const activePoints = activeRunType === 'HINDCAST' ? hindcastPoints : forecastPoints;
  const clampedIndex = Math.min(Math.max(0, currentTimestepIndex), Math.max(0, activePoints.length - 1));
  const currentScrubberPoint = activePoints[clampedIndex];

  const originPos: [number, number] = estimatedOrigin || (hindcastCoords.length > 0 ? hindcastCoords[hindcastCoords.length - 1] : spillCentroid);

  return (
    <div className={`relative w-full h-full bg-surface-100 overflow-hidden ${className}`}>
      <MapContainer
        center={spillCentroid}
        zoom={10}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full z-0"
      >
        <DriftMapController center={spillCentroid} />

        <TileLayer
          key={config.url}
          url={config.url}
          attribution={config.attribution}
          maxZoom={config.maxZoom}
          subdomains={config.subdomains || []}
        />

        {/* Observed Spill Polygon */}
        <Polygon
          positions={spillPolygonCoords}
          pathOptions={{
            color: '#DC2626',
            weight: 2,
            fillColor: '#DC2626',
            fillOpacity: 0.25,
          }}
        >
          <Tooltip sticky>
            <div className="text-xs font-sans">
              <div className="font-bold text-red-700">OBSERVED SPILL SLICK</div>
              <div>Centroid: {spillCentroid[0].toFixed(4)}°N, {spillCentroid[1].toFixed(4)}°E</div>
            </div>
          </Tooltip>
        </Polygon>

        {/* Backward Hindcast Trajectory */}
        {hindcastCoords.length > 0 && (
          <>
            <Polyline
              positions={hindcastCoords}
              pathOptions={{
                color: '#0284C7',
                weight: 2.5,
                dashArray: '4, 4',
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <div className="font-bold text-sky-700">HINDCAST TRAJECTORY</div>
                  <div>Backward in time to origin</div>
                </div>
              </Tooltip>
            </Polyline>

            {hindcastCoords.map((pt, idx) => (
              <CircleMarker
                key={`hc-${idx}`}
                center={pt}
                radius={3}
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

        {/* Reconstructed Origin Marker & Uncertainty Buffer */}
        <Circle
          center={originPos}
          radius={2200}
          pathOptions={{
            color: '#D97706',
            weight: 1.5,
            dashArray: '3, 4',
            fillColor: '#D97706',
            fillOpacity: 0.15,
          }}
        />
        <Marker position={originPos} icon={createOriginIcon()}>
          <Tooltip direction="top" offset={[0, -10]}>
            <div className="text-xs font-sans">
              <div className="font-bold text-amber-700">ESTIMATED DISCHARGE ORIGIN</div>
              <div className="font-mono text-[10px]">
                {originPos[0].toFixed(4)}°N, {originPos[1].toFixed(4)}°E
              </div>
            </div>
          </Tooltip>
        </Marker>

        {/* Forward Forecast Trajectory */}
        {forecastCoords.length > 0 && (
          <Polyline
            positions={forecastCoords}
            pathOptions={{
              color: '#F59E0B',
              weight: 2,
              dashArray: '2, 5',
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-sans">
                <div className="font-bold text-amber-700">FORECAST DISPERSION</div>
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Time Scrubber Active Position Marker */}
        {currentScrubberPoint && (
          <Marker
            position={[currentScrubberPoint.latitude, currentScrubberPoint.longitude]}
            icon={createScrubberIcon()}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              <div className="text-[10px] font-mono font-bold bg-white text-blue-900 px-1 py-0.5 border border-blue-400 rounded shadow-xs">
                T: {currentScrubberPoint.timestamp?.split('T')[1] || currentScrubberPoint.timestamp}
              </div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Docked Drift Legend */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-white/95 border border-gray-300 rounded-sm shadow-sm px-2.5 py-1.5 text-[10px] font-sans text-charcoal-700">
        <div className="font-bold text-charcoal-500 uppercase tracking-wider mb-1">
          Drift Legend
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2 bg-red-600 rounded-xs" />
            <span>Observed Spill</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-sky-600" />
            <span>Hindcast (Backward)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full border border-dashed border-amber-600 bg-amber-100" />
            <span>Estimated Source</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span>Forecast (Forward)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
