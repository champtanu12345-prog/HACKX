import React, { useState } from 'react';
import {
  ExtractionPlatform,
  PipelineRoute,
  EXTRACTION_PLATFORMS,
  PIPELINE_ROUTES
} from '../../data/petroleumAuthorityData';
import {
  Layers,
  Crosshair,
  Activity,
  Maximize2,
  Compass,
  Radio,
  Flame,
  Gauge,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface BasinOperationsMapProps {
  platforms?: ExtractionPlatform[];
  pipelines?: PipelineRoute[];
  selectedPlatformId?: string;
  onSelectPlatform: (platform: ExtractionPlatform) => void;
  selectedBasinFilter?: string;
}

export const BasinOperationsMap: React.FC<BasinOperationsMapProps> = ({
  platforms = EXTRACTION_PLATFORMS,
  pipelines = PIPELINE_ROUTES,
  selectedPlatformId,
  onSelectPlatform,
  selectedBasinFilter = 'ALL',
}) => {
  const [hoveredPlatform, setHoveredPlatform] = useState<ExtractionPlatform | null>(null);
  const [showPipelines, setShowPipelines] = useState(true);
  const [showSeismicGrid, setShowSeismicGrid] = useState(true);
  const [showCaverns, setShowCaverns] = useState(true);

  const filteredPlatforms = platforms.filter((p) => {
    if (selectedBasinFilter === 'ALL') return true;
    if (selectedBasinFilter === 'Western Offshore') return p.basin.includes('Western') || p.basin.includes('Mumbai');
    if (selectedBasinFilter === 'Eastern Deepwater') return p.basin.includes('Krishna-Godavari') || p.basin.includes('Eastern');
    if (selectedBasinFilter === 'Rajasthan Inland') return p.basin.includes('Rajasthan');
    if (selectedBasinFilter === 'Upper Assam') return p.basin.includes('Upper Assam') || p.basin.includes('Assam');
    if (selectedBasinFilter === 'Strategic SPM') return p.region === 'terminal';
    return true;
  });

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#0A0E14] rounded-sm border border-[#C5A059]/30 overflow-hidden flex flex-col select-none">
      {/* Map Header Toolbar */}
      <div className="bg-[#111620]/95 px-4 py-2 border-b border-[#1F2937] flex items-center justify-between text-xs text-gray-300 z-20">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#C5A059]" />
          <span className="font-serif font-bold text-white uppercase tracking-wider text-xs font-['Playfair_Display']">
            राष्ट्रीय बेसिन अन्वेषण एवं निष्कर्षण ग्रिड / Hydrocarbon Basin Operations Matrix
          </span>
          <span className="text-[10px] font-mono text-[#C5A059] bg-[#C5A059]/15 px-2 py-0.5 rounded border border-[#C5A059]/40">
            DGH-GIS GEO-SCADA v4.2
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPipelines(!showPipelines)}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-all ${
              showPipelines
                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                : 'bg-gray-800/60 border-gray-700 text-gray-400'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Pipelines</span>
          </button>

          <button
            onClick={() => setShowSeismicGrid(!showSeismicGrid)}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-all ${
              showSeismicGrid
                ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                : 'bg-gray-800/60 border-gray-700 text-gray-400'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Seismic Grid</span>
          </button>

          <button
            onClick={() => setShowCaverns(!showCaverns)}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-all ${
              showCaverns
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-gray-800/60 border-gray-700 text-gray-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Caverns (ISPRL)</span>
          </button>
        </div>
      </div>

      {/* Main SVG Geographic & SCADA Canvas */}
      <div className="relative flex-1 w-full h-full bg-[#090D13] overflow-hidden flex items-center justify-center">
        {/* Animated Background Radar Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.08) 0%, transparent 60%),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        />

        {/* Ambient Compass Rose Watermark */}
        <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none text-[#C5A059]">
          <Compass className="w-48 h-48 animate-[spin_120s_linear_infinite]" />
        </div>

        {/* Geographic Schematic Container */}
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full max-h-[600px] object-contain relative z-10"
        >
          <defs>
            {/* Pulsing pipeline glow filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Flow animation pattern */}
            <linearGradient id="pipeFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#FFDF73" stopOpacity="1" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B1320" />
              <stop offset="100%" stopColor="#060A10" />
            </linearGradient>
          </defs>

          {/* India Continental Outline & EEZ Maritime Contour (Schematic Vector) */}
          <path
            d="M 220 70 L 260 50 L 320 60 L 370 70 L 410 90 L 460 120 L 530 140 L 610 130 L 660 170 L 630 200 L 550 210 L 530 250 L 480 300 L 420 370 L 380 430 L 350 480 L 340 520 L 330 480 L 300 420 L 260 350 L 220 320 L 190 280 L 140 250 L 120 200 L 140 150 L 180 110 Z"
            fill="#121926"
            stroke="#C5A059"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            className="transition-all duration-500"
          />

          {/* EEZ Maritime Boundary Curve (Offshore Shelf) */}
          <path
            d="M 100 180 Q 70 280 150 400 T 320 560 Q 420 480 500 360 T 600 230"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
          />

          {/* Seismic Grid Lines */}
          {showSeismicGrid && (
            <g opacity="0.2">
              <line x1="80" y1="150" x2="720" y2="150" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
              <line x1="80" y1="300" x2="720" y2="300" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
              <line x1="80" y1="450" x2="720" y2="450" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
              <line x1="200" y1="50" x2="200" y2="550" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
              <line x1="400" y1="50" x2="400" y2="550" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
              <line x1="600" y1="50" x2="600" y2="550" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="2 4" />
            </g>
          )}

          {/* Underground ISPRL Strategic Cavern Locations */}
          {showCaverns && (
            <g>
              {/* Padur & Mangalore Caverns */}
              <g transform="translate(290, 440)">
                <circle r="6" fill="#C5A059" fillOpacity="0.2" stroke="#C5A059" strokeWidth="1" />
                <rect x="-2" y="-2" width="4" height="4" fill="#C5A059" />
                <text x="10" y="3" fill="#C5A059" fontSize="9" fontFamily="monospace" opacity="0.8">ISPRL PADUR</text>
              </g>
              {/* Vizag Caverns */}
              <g transform="translate(470, 320)">
                <circle r="6" fill="#C5A059" fillOpacity="0.2" stroke="#C5A059" strokeWidth="1" />
                <rect x="-2" y="-2" width="4" height="4" fill="#C5A059" />
                <text x="10" y="3" fill="#C5A059" fontSize="9" fontFamily="monospace" opacity="0.8">ISPRL VIZAG</text>
              </g>
            </g>
          )}

          {/* Animated Pipeline Paths with Fluid Flow Pulses */}
          {showPipelines && (
            <g>
              {pipelines.map((pipe) => (
                <g key={pipe.id}>
                  {/* Outer Pipe Base Track */}
                  <path
                    d={pipe.pathD}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Active Inner Oil Flow Line */}
                  <path
                    d={pipe.pathD}
                    fill="none"
                    stroke="#C5A059"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                  />
                  {/* Fluid Flow Dash Animation */}
                  <path
                    d={pipe.pathD}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="8 24"
                    strokeLinecap="round"
                    className="animate-[dash_3s_linear_infinite]"
                    filter="url(#goldGlow)"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Platform & Wellhead Extraction Nodes */}
          {filteredPlatforms.map((platform) => {
            const isSelected = selectedPlatformId === platform.id;
            const isHovered = hoveredPlatform?.id === platform.id;
            const cx = platform.coords.x * 7.5 + 40;
            const cy = platform.coords.y * 5.2 + 30;

            const isAlert = platform.status === 'REDUCED_CHOKE' || platform.status === 'MAINTENANCE_HOLD';

            return (
              <g
                key={platform.id}
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onClick={() => onSelectPlatform(platform)}
                onMouseEnter={() => setHoveredPlatform(platform)}
                onMouseLeave={() => setHoveredPlatform(null)}
              >
                {/* Concentric Ambient Radar Pulse Ring */}
                <circle
                  r={isSelected ? '28' : '18'}
                  fill="none"
                  stroke={isAlert ? '#EF4444' : '#C5A059'}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  className="animate-ping"
                  style={{ animationDuration: isSelected ? '1.8s' : '3s' }}
                />

                {/* Secondary Static Ring */}
                <circle
                  r={isSelected ? '18' : '12'}
                  fill={isSelected ? '#C5A059' : '#161B22'}
                  fillOpacity={isSelected ? 0.25 : 0.9}
                  stroke={isSelected ? '#FFDF73' : isAlert ? '#EF4444' : '#C5A059'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Core Center Platform Glyph */}
                <circle
                  r="5"
                  fill={isAlert ? '#EF4444' : '#C5A059'}
                  className={isSelected ? 'animate-pulse' : ''}
                />

                {/* Rig Identifier Label */}
                <g transform="translate(16, -4)">
                  <rect
                    x="0"
                    y="-10"
                    width="110"
                    height="20"
                    fill="#0D1117"
                    fillOpacity="0.9"
                    stroke={isSelected ? '#C5A059' : '#1F2937'}
                    strokeWidth="1"
                    rx="2"
                  />
                  <text
                    x="6"
                    y="3"
                    fill={isSelected ? '#FFDF73' : '#F8F9FA'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {platform.code}
                  </text>
                  <text
                    x="75"
                    y="3"
                    fill={isAlert ? '#EF4444' : '#10B981'}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {(platform.dailyExtractionBbl / 1000).toFixed(0)}k
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Detail Telemetry Card when Rig is Hovered/Selected */}
        {hoveredPlatform && (
          <div className="absolute left-6 bottom-6 bg-[#0D1117]/95 border border-[#C5A059] p-3.5 rounded shadow-2xl backdrop-blur-md z-30 max-w-sm pointer-events-none animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-2 mb-2">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">
                  WELLHEAD / PLATFORM SCADA
                </span>
                <h4 className="font-serif font-bold text-white text-sm">
                  {hoveredPlatform.name}
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredPlatform.status === 'OPTIMAL'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : hoveredPlatform.status === 'ELEVATED_THROUGHPUT'
                  ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/40'
              }`}>
                {hoveredPlatform.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#161B22] p-1.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-gray-400">DAILY OUTPUT</div>
                <div className="text-white font-bold">
                  {hoveredPlatform.dailyExtractionBbl.toLocaleString()} BBL
                </div>
              </div>

              <div className="bg-[#161B22] p-1.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-gray-400">WELLHEAD PRESS.</div>
                <div className="text-[#C5A059] font-bold">
                  {hoveredPlatform.wellheadPressureBar} bar
                </div>
              </div>

              <div className="bg-[#161B22] p-1.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-gray-400">API GRAVITY</div>
                <div className="text-emerald-400 font-bold">
                  {hoveredPlatform.apiGravity}° API ({hoveredPlatform.crudeGrade})
                </div>
              </div>

              <div className="bg-[#161B22] p-1.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-gray-400">CHOKE POSITION</div>
                <div className="text-white font-bold">
                  {hoveredPlatform.chokePositionPct}% Open
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>BOP Safety: {hoveredPlatform.lastBopTest.split(' ')[2]}</span>
              <span className="text-[#C5A059]">Click to Inspect Wellhead</span>
            </div>
          </div>
        )}

        {/* Coordinates Watermark Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none text-[10px] font-mono text-gray-400/60 leading-tight">
          <div>GEO-REF: 18°58&apos;N 72°49&apos;E | WGS-84</div>
          <div>DATUM: NATIONAL MARITIME ZONE (EEZ SEC-4)</div>
        </div>
      </div>
    </div>
  );
};
