import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Satellite, Waves, Compass, MapPin, Ship, AlertTriangle, Globe } from 'lucide-react';

export interface MapLayerState {
  sarFootprint: boolean;
  spillPlume: boolean;
  driftParticles: boolean;
  originEllipse: boolean;
  vesselTracks: boolean;
  darkAnomalies: boolean;
}

interface MapLayerControlsProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  className?: string;
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  layers,
  onToggleLayer,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const layerConfigs = [
    {
      key: 'spillPlume' as keyof MapLayerState,
      label: 'तेल रिसाव / Spill Polygon',
      icon: <Waves className="w-3.5 h-3.5 text-red-500" />,
      color: 'border-red-500 bg-red-500/10 text-red-700',
    },
    {
      key: 'driftParticles' as keyof MapLayerState,
      label: 'बहाव प्रक्षेपवक्र / Drift Hindcast',
      icon: <Compass className="w-3.5 h-3.5 text-cyan-500" />,
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-700',
    },
    {
      key: 'originEllipse' as keyof MapLayerState,
      label: 'उद्गम स्थल / Origin Locus',
      icon: <MapPin className="w-3.5 h-3.5 text-amber-500" />,
      color: 'border-amber-500 bg-amber-500/10 text-amber-700',
    },
    {
      key: 'vesselTracks' as keyof MapLayerState,
      label: 'पोत ट्रैकिंग / AIS Tracks',
      icon: <Ship className="w-3.5 h-3.5 text-blue-500" />,
      color: 'border-blue-500 bg-blue-500/10 text-blue-700',
    },
    {
      key: 'darkAnomalies' as keyof MapLayerState,
      label: 'ब्लैकआउट विसंगति / AIS Gaps',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
      color: 'border-rose-500 bg-rose-500/10 text-rose-700',
    },
    {
      key: 'sarFootprint' as keyof MapLayerState,
      label: 'उपग्रह स्वाथ / SAR Footprint',
      icon: <Satellite className="w-3.5 h-3.5 text-emerald-500" />,
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-700',
    },
  ];

  return (
    <div
      className={`absolute bottom-3 right-3 z-[1000] bg-white/95 border-2 border-[#064E26] rounded-[2px] shadow-lg select-none text-xs font-sans transition-all backdrop-blur-xs ${className}`}
    >
      {/* Control Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1.5 bg-[#064E26] text-white flex items-center justify-between space-x-2 font-bold text-[11px] cursor-pointer"
        title="Toggle GIS Tactical Map Layers"
      >
        <div className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>मानचित्र परतें / GIS LAYERS</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>{isExpanded ? '▲ बन्द करें' : '▾ खोलें'}</span>
        </div>
      </button>

      {/* Expandable Layer List */}
      {isExpanded && (
        <div className="p-2 space-y-1.5 w-64 bg-white/95 border-t border-emerald-200">
          <div className="text-[9.5px] font-mono text-[#064E26] font-bold uppercase px-1 pb-1 border-b">
            TACTICAL GIS OVERLAYS (ICG MRCC)
          </div>
          {layerConfigs.map((layer) => {
            const isVisible = layers[layer.key];
            return (
              <button
                key={layer.key}
                onClick={() => onToggleLayer(layer.key)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] border text-[11px] transition-all cursor-pointer ${
                  isVisible
                    ? 'bg-emerald-50/70 border-emerald-400 font-bold text-[#064E26] shadow-2xs'
                    : 'bg-slate-100/50 border-slate-200 text-slate-400 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`p-0.5 rounded ${isVisible ? '' : 'opacity-40'}`}>
                    {layer.icon}
                  </span>
                  <span className="truncate">{layer.label}</span>
                </div>

                <span className="flex-shrink-0 ml-1">
                  {isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-[#064E26]" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
