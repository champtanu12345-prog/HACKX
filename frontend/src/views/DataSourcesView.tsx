import React from 'react';
import { Radio, Database, Globe, Satellite, CheckCircle, RefreshCw } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/common/Badge';
import { SYSTEM_DATA_STATUS } from '../data/maritimeDemoData';

export const DataSourcesView: React.FC = () => {
  return (
    <div className="flex-1 bg-surface-100 p-4 overflow-y-auto space-y-4 font-sans text-xs select-none">
      <SectionHeader
        title="Multi-Modal Data Ingestion Feeds"
        subtitle="Satellite SAR/EO, AIS Telemetry, Atmospheric & Hydrodynamic Feeds"
        icon={<Radio className="w-4 h-4 text-blue-700" />}
        badge={<Badge variant="normal">ONLINE</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SYSTEM_DATA_STATUS.feeds.map((feed, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-3.5 rounded-[2px] space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-2">
                <Satellite className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-sm text-charcoal-900">{feed.name}</span>
              </div>
              <Badge variant="normal">NOMINAL</Badge>
            </div>

            <div className="text-[11px] space-y-1 text-charcoal-700 font-sans">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Feed Category:</span>
                <span className="text-charcoal-900 font-medium">{feed.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Status Telemetry:</span>
                <span className="text-emerald-700 font-semibold">{feed.detail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Ingestion Protocol:</span>
                <span className="text-charcoal-800 font-mono text-[10px]">REST / OData / NMEA-0183</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
