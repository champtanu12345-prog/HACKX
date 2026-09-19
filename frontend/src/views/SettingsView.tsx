import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Save, RotateCcw } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/common/Badge';

export const SettingsView: React.FC = () => {
  const [coordFormat, setCoordFormat] = useState<'dm' | 'dd'>('dm');
  const [windageFactor, setWindageFactor] = useState<string>('0.03');
  const [searchRadiusNm, setSearchRadiusNm] = useState<string>('35.0');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 bg-surface-100 p-4 overflow-y-auto space-y-4 font-sans text-xs select-none">
      <SectionHeader
        title="Workstation Configuration & Operational Parameters"
        subtitle="Geodetic Units, Lagrangian Coefficients, and Telemetry Routing"
        icon={<SettingsIcon className="w-4 h-4 text-blue-700" />}
      />

      <div className="max-w-2xl bg-white border border-gray-200 p-4 rounded-[2px] space-y-4 shadow-xs">
        {/* Geodetic Coordinates Format */}
        <div className="space-y-1 border-b border-gray-100 pb-3">
          <label className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wider">
            Geodetic Coordinates Display Format
          </label>
          <div className="flex space-x-4 text-[11px] text-charcoal-700 pt-1">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="coordFormat"
                checked={coordFormat === 'dm'}
                onChange={() => setCoordFormat('dm')}
                className="text-blue-600"
              />
              <span>Nautical Degrees & Minutes (DD°MM.MM' N/E) — Standard Maritime</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="coordFormat"
                checked={coordFormat === 'dd'}
                onChange={() => setCoordFormat('dd')}
                className="text-blue-600"
              />
              <span>Decimal Degrees (±DD.DDDD) — GIS Raw</span>
            </label>
          </div>
        </div>

        {/* Windage Factor */}
        <div className="space-y-1 border-b border-gray-100 pb-3">
          <label className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wider">
            Lagrangian Drift Windage Coefficient (c_wind)
          </label>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={windageFactor}
              onChange={(e) => setWindageFactor(e.target.value)}
              className="w-20 bg-gray-50 border border-gray-300 font-mono text-xs px-2 py-1 rounded-[2px] text-charcoal-900"
            />
            <span className="text-[11px] text-charcoal-500">
              Standard empirical ratio: 0.03 (3% of 10-meter wind vector)
            </span>
          </div>
        </div>

        {/* Search Radius */}
        <div className="space-y-1 border-b border-gray-100 pb-3">
          <label className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wider">
            AIS Spatiotemporal Search Radius
          </label>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={searchRadiusNm}
              onChange={(e) => setSearchRadiusNm(e.target.value)}
              className="w-20 bg-gray-50 border border-gray-300 font-mono text-xs px-2 py-1 rounded-[2px] text-charcoal-900"
            />
            <span className="text-[11px] text-charcoal-500">
              Nautical miles around reconstructed origin (Default: 35.0 NM / 65.0 km)
            </span>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-[2px] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>

          {isSaved && (
            <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
              <span>Settings successfully updated.</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
