import React, { useState, useRef } from 'react';
import { Layers, Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Badge } from '../common/Badge';

export type ComparisonMode = 'original' | 'overlay' | 'mask';

interface SARComparisonViewerProps {
  originalImage?: string;
  overlayImage?: string;
  maskImage?: string;
  centroid: [number, number];
  areaSqKm: number;
  confidence: number;
  sensor?: string;
  polarization?: string;
  resolutionM?: number;
  modelName?: string;
  modelMode?: string;
}

export const SARComparisonViewer: React.FC<SARComparisonViewerProps> = ({
  originalImage,
  overlayImage,
  maskImage,
  centroid,
  areaSqKm,
  confidence,
  sensor = 'Sentinel-1A C-SAR IW GRD',
  polarization = 'VV Single-Pol',
  resolutionM = 10.0,
  modelName = 'U-Net Hydrocarbon Segmenter',
  modelMode = 'demo',
}) => {
  const [activeMode, setActiveMode] = useState<ComparisonMode>('overlay');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [probeData, setProbeData] = useState<{
    pixelX: number;
    pixelY: number;
    lat: number;
    lon: number;
    sigma0Db: number;
    classification: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const pixelX = Math.round(x * 512);
    const pixelY = Math.round(y * 512);

    const spanDeg = 0.09;
    const lat = +(centroid[0] + (0.5 - y) * spanDeg).toFixed(5);
    const lon = +(centroid[1] + (x - 0.5) * spanDeg).toFixed(5);

    const distFromCenter = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    const isSlick = distFromCenter < 0.22;
    const sigma0Db = isSlick
      ? +(-24.5 - distFromCenter * 8).toFixed(1)
      : +(-15.2 + Math.sin(x * 20) * 1.5).toFixed(1);

    setProbeData({
      pixelX,
      pixelY,
      lat,
      lon,
      sigma0Db,
      classification: isSlick ? 'HYDROCARBON_DAMPING' : 'OPEN_OCEAN_SCATTER',
    });
  };

  const handleMouseLeave = () => {
    setProbeData(null);
  };

  const getDisplayImage = () => {
    switch (activeMode) {
      case 'original':
        return originalImage || overlayImage;
      case 'mask':
        return maskImage || overlayImage;
      case 'overlay':
      default:
        return overlayImage || originalImage;
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-[2px] overflow-hidden font-sans text-xs select-none shadow-xs">
      {/* Top Scientific Control Strip */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 gap-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-mono text-charcoal-700 font-bold uppercase tracking-wider text-[11px]">
            SAR Raster View
          </span>
          <Badge variant="demo" size="xs">
            SIMULATED DEMO
          </Badge>
        </div>

        {/* Mode Selector Buttons: Original, Mask, Overlay */}
        <div className="flex items-center bg-white border border-gray-300 p-0.5 rounded-[2px] text-[11px]">
          <button
            onClick={() => setActiveMode('original')}
            className={`px-2.5 py-1 rounded-[2px] font-semibold transition-colors cursor-pointer ${
              activeMode === 'original'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:bg-gray-100'
            }`}
            title="Raw Sentinel-1 Backscatter Scene"
          >
            Original
          </button>
          <button
            onClick={() => setActiveMode('mask')}
            className={`px-2.5 py-1 rounded-[2px] font-semibold transition-colors cursor-pointer ${
              activeMode === 'mask'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:bg-gray-100'
            }`}
            title="Binary Hydrocarbon Segmentation Mask"
          >
            Mask
          </button>
          <button
            onClick={() => setActiveMode('overlay')}
            className={`px-2.5 py-1 rounded-[2px] font-semibold transition-colors cursor-pointer ${
              activeMode === 'overlay'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:bg-gray-100'
            }`}
            title="Radiometric Slick Contour Overlay"
          >
            Overlay
          </button>
        </div>

        {/* Zoom & Crosshair Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-1 rounded-[2px] border text-[11px] cursor-pointer ${
              showCrosshairs ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-white text-charcoal-600 border-gray-200'
            }`}
            title="Toggle Radiometric Crosshairs"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 border border-gray-200 text-charcoal-600 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 border border-gray-200 text-charcoal-600 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 rounded-[2px] bg-white hover:bg-gray-100 border border-gray-200 text-charcoal-600 cursor-pointer"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-charcoal-500 w-10 text-right">
            {(zoomLevel * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Main Raster Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-square max-h-[460px] bg-gray-900 flex items-center justify-center overflow-hidden cursor-crosshair"
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {getDisplayImage() ? (
            <img
              src={getDisplayImage()}
              alt="SAR Detection Raster"
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          ) : (
            <div className="text-gray-400 font-mono text-xs">NO RASTER DATA</div>
          )}

          {/* Crosshair Overlay */}
          {showCrosshairs && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-px bg-blue-400/40" />
              <div className="h-full w-px bg-blue-400/40 absolute" />
              <div className="w-16 h-16 rounded-full border border-blue-400/60 absolute" />
            </div>
          )}
        </div>

        {/* Live Radiometric Probe Readout */}
        {probeData && (
          <div className="absolute bottom-2 left-2 bg-white/95 border border-gray-300 rounded-[2px] px-2 py-1 text-[10px] font-mono shadow-md text-charcoal-800 space-y-0.5 pointer-events-none">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-blue-900">RADAR PROBE:</span>
              <span className="text-charcoal-600">
                {probeData.lat}°N, {probeData.lon}°E
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>BACKSCATTER:</span>
              <span
                className={`font-bold ${
                  probeData.classification === 'HYDROCARBON_DAMPING' ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {probeData.sigma0Db} dB ({probeData.classification})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
