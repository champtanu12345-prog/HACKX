import React, { useState, useEffect } from 'react';
import { MaritimeMap } from '../components/map/MaritimeMap';
import { SpillSidebar } from '../components/analytics/SpillSidebar';
import { SuspectTable } from '../components/vessels/SuspectTable';
import { VesselDossier } from '../components/vessels/VesselDossier';
import { SpillDetection, DriftRun, SuspectAttribution } from '../types';
import {
  getSpills,
  getSpillDriftRuns,
  triggerDriftSimulation,
  getSpillSuspects,
  createInvestigation,
} from '../api/client';

export const DashboardPage: React.FC = () => {
  const [spills, setSpills] = useState<SpillDetection[]>([]);
  const [selectedSpill, setSelectedSpill] = useState<SpillDetection | undefined>(undefined);
  const [driftRuns, setDriftRuns] = useState<DriftRun[]>([]);
  const [suspects, setSuspects] = useState<SuspectAttribution[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<SuspectAttribution | undefined>(undefined);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isDriftRunning, setIsDriftRunning] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initial Load of Spills
  useEffect(() => {
    const loadSpills = async () => {
      try {
        const data = await getSpills();
        setSpills(data);
        if (data.length > 0) {
          setSelectedSpill(data[0]);
        }
      } catch (err) {
        console.error('Failed to load spills', err);
      }
    };
    loadSpills();
  }, []);

  // When selected spill changes, load its drift runs and suspect vessels
  useEffect(() => {
    if (!selectedSpill) return;

    const loadSpillContext = async () => {
      try {
        const [runsData, suspectsData] = await Promise.all([
          getSpillDriftRuns(selectedSpill.id),
          getSpillSuspects(selectedSpill.id),
        ]);
        setDriftRuns(runsData);
        setSuspects(suspectsData.suspects || []);
      } catch (err) {
        console.error('Failed to load spill context', err);
      }
    };
    loadSpillContext();
  }, [selectedSpill]);

  // Handler to trigger Lagrangian drift
  const handleTriggerDrift = async () => {
    if (!selectedSpill) return;
    setIsDriftRunning(true);
    try {
      const newRun = await triggerDriftSimulation(selectedSpill.id, {
        run_type: 'HINDCAST',
        duration_hours: selectedSpill.estimated_age_hours,
        particle_count: 150,
      });
      setDriftRuns([newRun, ...driftRuns]);

      // Re-query suspects with refreshed drift origin
      const suspectsData = await getSpillSuspects(selectedSpill.id);
      setSuspects(suspectsData.suspects || []);

      setNotification(`Lagrangian Hindcast successfully computed: ${newRun.trajectory_points.length} trajectory points.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error('Drift simulation failed', err);
    } finally {
      setIsDriftRunning(false);
    }
  };

  // Handler to escalate suspect to Coast Guard
  const handleEscalateToCoastGuard = async (vessel: SuspectAttribution) => {
    if (!selectedSpill) return;
    try {
      await createInvestigation({
        spill_id: selectedSpill.id,
        primary_suspect_id: vessel.vessel_id,
        status: 'ESCALATED_TO_COAST_GUARD',
        summary_notes: `Culprit ${vessel.name} (MMSI: ${vessel.mmsi}) scored ${vessel.composite_score}/100. AIS transponder blackout & deceleration logged.`,
      });
      setNotification(`Case escalated to Indian Coast Guard Command for MMSI: ${vessel.mmsi}.`);
      setIsDossierOpen(false);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error('Escalation failed', err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="absolute top-3 right-6 z-50 bg-tactical-cyan text-bridge-950 px-3 py-1.5 rounded font-mono text-xs font-bold shadow-lg border border-cyan-300 transition-all">
          {notification}
        </div>
      )}

      {/* Left Column: Spill Sidebar & Metrics */}
      <SpillSidebar
        spills={spills}
        selectedSpill={selectedSpill}
        onSelectSpill={(sp) => {
          setSelectedSpill(sp);
          setSelectedVessel(undefined);
          setIsDossierOpen(false);
        }}
        activeDrift={driftRuns.length > 0 ? driftRuns[0] : undefined}
        onTriggerDrift={handleTriggerDrift}
        isDriftRunning={isDriftRunning}
      />

      {/* Center & Bottom: Map and AIS Attribution Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top: Central Maritime Tactical GIS Map */}
        <div className="flex-1 relative">
          <MaritimeMap
            selectedSpill={selectedSpill}
            driftRuns={driftRuns}
            suspects={suspects}
            onSelectVessel={(vsl) => {
              setSelectedVessel(vsl);
              setIsDossierOpen(true);
            }}
          />
        </div>

        {/* Bottom: AIS Correlation & Suspect Leaderboard */}
        <div className="h-64">
          <SuspectTable
            suspects={suspects}
            selectedVessel={selectedVessel}
            onSelectVessel={(vsl) => setSelectedVessel(vsl)}
            onEscalate={(vsl) => {
              setSelectedVessel(vsl);
              setIsDossierOpen(true);
            }}
          />
        </div>
      </div>

      {/* Right Slide-over: Vessel Dossier */}
      {isDossierOpen && selectedVessel && (
        <VesselDossier
          vessel={selectedVessel}
          spill={selectedSpill}
          onClose={() => setIsDossierOpen(false)}
          onEscalateToCoastGuard={handleEscalateToCoastGuard}
        />
      )}
    </div>
  );
};
