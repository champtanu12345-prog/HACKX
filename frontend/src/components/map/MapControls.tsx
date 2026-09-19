import React, { useState } from 'react';
import {
  Plus,
  Minus,
  RotateCcw,
  Layers,
  Ruler,
  Compass,
  Map as MapIcon,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

export type BasemapType = 'dark' | 'satellite' | 'bathymetry' | 'enc';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  currentBasemap: BasemapType;
  onChangeBasemap: (basemap: BasemapType) => void;
  layerVisibility: {
    spillPolygon: boolean;
    driftTrajectory: boolean;
    vesselTracks: boolean;
    groundTruth: boolean;
  };
  onToggleLayer: (layerKey: 'spillPolygon' | 'driftTrajectory' | 'vesselTracks' | 'groundTruth') => void;
  isMeasuring: boolean;
  onToggleMeasuring: () => void;
  measuredDistanceNm?: number | null;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  currentBasemap,
  onChangeBasemap,
  layerVisibility,
  onToggleLayer,
  isMeasuring,
  onToggleMeasuring,
  measuredDistanceNm,
}) => {
  const [showLayersDropdown, setShowLayersDropdown] = useState<boolean>(false);
  const [showBasemapsDropdown, setShowBasemapsDropdown] = useState<boolean>(false);

  const basemaps: Array<{ id: BasemapType; label: string }> = [
    { id: 'dark', label: 'Dark Nautical (Default)' },
    { id: 'satellite', label: 'Satellite Hybrid' },
    { id: 'bathymetry', label: 'Bathymetric Grayscale' },
    { id: 'enc', label: 'Maritime ENC Vector' },
  ];

  return (
    <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 select-none z-20 font-mono text-xs">
      {/* Primary Zoom & Reset Stack */}
      <div className="bg-bridge-900 border border-bridge-700 rounded-[2px] overflow-hidden shadow flex flex-col divide-y divide-bridge-700">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center text-bridge-200 hover:bg-bridge-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center text-bridge-200 hover:bg-bridge-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onResetView}
          title="Reset View to Spill Locus"
          className="w-8 h-8 flex items-center justify-center text-bridge-200 hover:bg-bridge-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
        </button>
      </div>

      {/* Tools Toolbar: Layers, Basemaps, Measure */}
      <div className="relative">
        <div className="bg-bridge-900 border border-bridge-700 rounded-[2px] p-1 shadow flex items-center space-x-1">
          {/* Layer Selector Toggle */}
          <button
            onClick={() => {
              setShowLayersDropdown(!showLayersDropdown);
              setShowBasemapsDropdown(false);
            }}
            title="Layer Visibility"
            className={`p-1.5 rounded-[2px] transition-colors ${
              showLayersDropdown ? 'bg-blue-600 text-white' : 'text-bridge-300 hover:bg-bridge-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Basemap Selector Toggle */}
          <button
            onClick={() => {
              setShowBasemapsDropdown(!showBasemapsDropdown);
              setShowLayersDropdown(false);
            }}
            title="Change Basemap"
            className={`p-1.5 rounded-[2px] transition-colors ${
              showBasemapsDropdown ? 'bg-blue-600 text-white' : 'text-bridge-300 hover:bg-bridge-800'
            }`}
          >
            <MapIcon className="w-4 h-4" />
          </button>

          {/* Distance Measurement Tool */}
          <button
            onClick={onToggleMeasuring}
            title={isMeasuring ? 'Exit Measurement Tool' : 'Measure Distance (nm)'}
            className={`p-1.5 rounded-[2px] transition-colors ${
              isMeasuring ? 'bg-amber-600 text-white animate-pulse' : 'text-bridge-300 hover:bg-bridge-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
          </button>
        </div>

        {/* Layer Visibility Menu Dropdown */}
        {showLayersDropdown && (
          <div className="absolute right-0 mt-1.5 w-60 bg-bridge-900 border border-bridge-700 rounded-[2px] p-2 shadow-xl z-30 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-bridge-400 font-bold uppercase tracking-wider pb-1 border-b border-bridge-800">
              <span>ACTIVE GIS LAYERS</span>
            </div>

            <button
              onClick={() => onToggleLayer('spillPolygon')}
              className="flex items-center justify-between w-full px-2 py-1 rounded-[2px] hover:bg-bridge-800 text-[11px] text-bridge-200"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-[1px] bg-red-500 border border-red-400" />
                <span>SAR Oil Slick Boundary</span>
              </div>
              {layerVisibility.spillPolygon ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
            </button>

            <button
              onClick={() => onToggleLayer('driftTrajectory')}
              className="flex items-center justify-between w-full px-2 py-1 rounded-[2px] hover:bg-bridge-800 text-[11px] text-bridge-200"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-0.5 bg-blue-400" />
                <span>Lagrangian Drift Vector</span>
              </div>
              {layerVisibility.driftTrajectory ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
            </button>

            <button
              onClick={() => onToggleLayer('vesselTracks')}
              className="flex items-center justify-between w-full px-2 py-1 rounded-[2px] hover:bg-bridge-800 text-[11px] text-bridge-200"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>AIS Vessel Telemetry</span>
              </div>
              {layerVisibility.vesselTracks ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
            </button>

            <button
              onClick={() => onToggleLayer('groundTruth')}
              className="flex items-center justify-between w-full px-2 py-1 rounded-[2px] hover:bg-bridge-800 text-[11px] text-bridge-200"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-950" />
                <span>Simulated Ground Truth</span>
              </div>
              {layerVisibility.groundTruth ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-bridge-500" />}
            </button>
          </div>
        )}

        {/* Basemap Selector Menu Dropdown */}
        {showBasemapsDropdown && (
          <div className="absolute right-0 mt-1.5 w-52 bg-bridge-900 border border-bridge-700 rounded-[2px] p-2 shadow-xl z-30 space-y-1">
            <div className="text-[10px] text-bridge-400 font-bold uppercase tracking-wider pb-1 border-b border-bridge-800">
              NAUTICAL BASEMAPS
            </div>
            {basemaps.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onChangeBasemap(b.id);
                  setShowBasemapsDropdown(false);
                }}
                className={`flex items-center justify-between w-full px-2 py-1 rounded-[2px] text-[11px] text-left transition-colors ${
                  currentBasemap === b.id
                    ? 'bg-bridge-800 text-blue-400 font-semibold'
                    : 'text-bridge-300 hover:bg-bridge-850 hover:text-bridge-100'
                }`}
              >
                <span>{b.label}</span>
                {currentBasemap === b.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Measurement HUD when measurement mode active */}
      {isMeasuring && (
        <div className="bg-bridge-950 border border-amber-500/80 text-amber-300 px-2.5 py-1.5 rounded-[2px] shadow-lg text-[11px] font-mono">
          <div className="font-bold flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5" />
            <span>NAUTICAL MEASUREMENT</span>
          </div>
          <div className="text-[10px] text-bridge-300 mt-0.5">
            {measuredDistanceNm !== undefined && measuredDistanceNm !== null
              ? `DISTANCE: ${measuredDistanceNm.toFixed(2)} nm (${(measuredDistanceNm * 1.852).toFixed(2)} km)`
              : 'Click two coordinates on the map to compute distance.'}
          </div>
        </div>
      )}
    </div>
  );
};
