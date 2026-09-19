import React, { useState } from 'react';
import { PetroleumTopBar } from '../components/petroleum/PetroleumTopBar';
import { PetroleumMacroTelemetry } from '../components/petroleum/PetroleumMacroTelemetry';
import { BasinOperationsMap } from '../components/petroleum/BasinOperationsMap';
import { PipelineDiagnosticsPanel } from '../components/petroleum/PipelineDiagnosticsPanel';
import { RegulatoryAuditLedger } from '../components/petroleum/RegulatoryAuditLedger';
import { RigInspectorDrawer } from '../components/petroleum/RigInspectorDrawer';
import {
  ExtractionPlatform,
  PipelineRoute,
  EXTRACTION_PLATFORMS,
  PIPELINE_ROUTES,
  REGULATORY_AUDIT_LOGS,
  MACRO_TELEMETRY_STATS
} from '../data/petroleumAuthorityData';

export const NationalPetroleumDashboard: React.FC = () => {
  const [selectedBasin, setSelectedBasin] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<ExtractionPlatform | null>(null);
  const [platforms, setPlatforms] = useState<ExtractionPlatform[]>(EXTRACTION_PLATFORMS);
  const [pipelines, setPipelines] = useState<PipelineRoute[]>(PIPELINE_ROUTES);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportAuditReport = () => {
    const jsonStr = JSON.stringify(
      {
        authority: 'Ministry of Petroleum & Natural Gas - DGH',
        generatedAt: new Date().toISOString(),
        macroStats: MACRO_TELEMETRY_STATS,
        platforms: platforms,
        pipelines: pipelines,
        regulatoryAuditLogs: REGULATORY_AUDIT_LOGS,
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOPNG_SCADA_AUDIT_DOSSIER_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Official Tamper-Evident SCADA Audit Dossier Exported.');
  };

  const handleTriggerEmergencyDrill = () => {
    showNotification('OISD-156 Safety Protocol Test Triggered: All Subsea BOP Transponders Responding.');
  };

  const handleUpdateChoke = (platformId: string, newChoke: number) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId
          ? {
              ...p,
              chokePositionPct: newChoke,
              dailyExtractionBbl: Math.round((p.targetBbl * newChoke) / 75),
              wellheadPressureBar: Math.round((p.wellheadPressureBar * (newChoke / 70)) * 10) / 10,
            }
          : p
      )
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0D1117] text-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 relative select-none">
      {/* 1. Executive Top Bar */}
      <PetroleumTopBar
        selectedBasin={selectedBasin}
        onSelectBasin={setSelectedBasin}
        onExportAuditReport={handleExportAuditReport}
        onTriggerEmergencyDrill={handleTriggerEmergencyDrill}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[#C5A059] text-black px-4 py-2 rounded shadow-2xl font-serif text-xs font-bold border border-white/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Macro Telemetry Strip */}
      <PetroleumMacroTelemetry stats={MACRO_TELEMETRY_STATS} />

      {/* 3. Central Operational Command Grid (Map + Pipeline Diagnostics) */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Central Basin Operations Map (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col min-h-[460px]">
          <BasinOperationsMap
            platforms={platforms}
            pipelines={pipelines}
            selectedPlatformId={selectedPlatform?.id}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
            selectedBasinFilter={selectedBasin}
          />
        </div>

        {/* Pipeline Flow & Pressure Diagnostics Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col min-h-[460px]">
          <PipelineDiagnosticsPanel
            pipelines={pipelines}
            onSelectPipeline={(pipe) => {
              showNotification(`Diagnostic Focus: ${pipe.name} (${pipe.operatingPressureBar} bar)`);
            }}
          />
        </div>
      </div>

      {/* 4. Statutory & Regulatory Audit Ledger */}
      <div className="px-4 pb-6">
        <RegulatoryAuditLedger
          logs={REGULATORY_AUDIT_LOGS}
          onViewEntryDetails={(entry) => {
            showNotification(`Inspecting Audit Ref: ${entry.referenceId}`);
          }}
        />
      </div>

      {/* 5. Wellhead & Rig Inspector Drawer */}
      <RigInspectorDrawer
        platform={selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
        onUpdateChoke={handleUpdateChoke}
      />
    </div>
  );
};
