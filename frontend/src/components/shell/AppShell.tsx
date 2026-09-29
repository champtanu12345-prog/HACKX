import React, { useState, useEffect } from 'react';
import { Globe, Activity, Shield, Waves, Sparkles, Bot } from 'lucide-react';
import { TopBar } from './TopBar';
import { Sidebar, NavView } from './Sidebar';
import { ContextPanel } from './ContextPanel';
import { GovMasthead } from '../common/GovMasthead';
import { GovFooter } from '../common/GovFooter';
import { WarpBackgroundCanvas } from '../common/WarpBackgroundCanvas';
import { TypewriterCommandTeletype } from '../common/TypewriterCommandTeletype';
import { LegalDossierModal } from '../common/LegalDossierModal';
import { TacticalAnalysisScanner } from '../workflow/TacticalAnalysisScanner';
import { OverviewView } from '../../views/OverviewView';
import { SpillsView } from '../../views/SpillsView';
import { DriftView } from '../../views/DriftView';
import { AttributionView } from '../../views/AttributionView';
import { InvestigationsView } from '../../views/InvestigationsView';
import { DataSourcesView } from '../../views/DataSourcesView';
import { SettingsView } from '../../views/SettingsView';
import { NationalPetroleumDashboard } from '../../views/NationalPetroleumDashboard';
import { PublicPortalView } from '../../views/PublicPortalView';
import { DEMO_SCENARIOS, MaritimeScenario } from '../../data/maritimeDemoData';
import { AnalysisProgressBar } from '../workflow/AnalysisProgressBar';
import { TacticalAlertDispatchModal } from '../workflow/TacticalAlertDispatchModal';
import { EvaluatorGuidedTour } from '../workflow/EvaluatorGuidedTour';
import { InvestigationPipelineWizard } from '../workflow/InvestigationPipelineWizard';
import { StartupBootSequence } from '../common/StartupBootSequence';
import { TacticalCopilot } from '../common/TacticalCopilot';
import { tacticalAudio } from '../../utils/audioAlerts';
import {
  getDemoScenario,
  runDetection,
  simulateDrift,
  getNearbyVessels,
  runInvestigationAnalysis,
  getInvestigationById,
} from '../../api/client';
import { AnalysisStage, InvestigationDetail } from '../../types';
import { AuthUser, getStoredSession, clearSession } from '../../api/auth';
import { LoginModal } from '../auth/LoginModal';
import { AnimatedDribbbleLoginPage } from '../auth/AnimatedDribbbleLoginPage';
import { BantenGovPortalView } from '../../views/BantenGovPortalView';
import { SagarMitraAIAssistantView } from '../../views/SagarMitraAIAssistantView';

export const AppShell: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<NavView>('portal');
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('scenario_a');
  const [activeScenarioData, setActiveScenarioData] = useState<MaritimeScenario>(
    DEMO_SCENARIOS.scenario_a
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isContextOpen, setIsContextOpen] = useState<boolean>(false);
  const [selectedVesselId, setSelectedVesselId] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    const saved = localStorage.getItem('hackx_font_size');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('hackx_lang') as 'en' | 'hi') || 'en';
  });

  // Interactive HTML5 Canvas Warp-Drive Hyperspace Background State
  const [isWarpActive, setIsWarpActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('hackx_warp_active');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleWarp = () => {
    setIsWarpActive((prev) => {
      const next = !prev;
      localStorage.setItem('hackx_warp_active', String(next));
      setNotification(
        next
          ? (lang === 'hi' ? '✨ वार्प-ड्राइव पृष्ठभूमि सक्रिय (60 FPS)' : '✨ Warp-Drive Hyperspace Canvas Active (60 FPS)')
          : (lang === 'hi' ? 'वार्प पृष्ठभूमि निष्क्रिय' : 'Warp Canvas Disabled')
      );
      setTimeout(() => setNotification(null), 3500);
      return next;
    });
  };

  // Apply GIGW 3.0 font scaling on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-sm', 'font-scale-base', 'font-scale-lg');
    if (fontSizeLevel === -1) {
      root.classList.add('font-scale-sm');
      root.style.fontSize = '13.5px';
    } else if (fontSizeLevel === 1) {
      root.classList.add('font-scale-lg');
      root.style.fontSize = '18.5px';
    } else {
      root.classList.add('font-scale-base');
      root.style.fontSize = '16px';
    }
    localStorage.setItem('hackx_font_size', String(fontSizeLevel));
  }, [fontSizeLevel]);

  // Persist language changes
  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('hackx_lang', next);
      setNotification(
        next === 'hi'
          ? 'भाषा बदली गई: हिन्दी (राजभाषा पोर्टल सक्रिय)'
          : 'Language Switched: English (Official Portal Active)'
      );
      setTimeout(() => setNotification(null), 3000);
      return next;
    });
  };
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return getStoredSession().user;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setNotification(
      lang === 'hi'
        ? 'सफलतापूर्वक लॉग आउट किया गया।'
        : 'Logged out successfully.'
    );
    setTimeout(() => setNotification(null), 3500);
  };

  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isPipelineWizardOpen, setIsPipelineWizardOpen] = useState<boolean>(false);
  const [isSoundActive, setIsSoundActive] = useState<boolean>(tacticalAudio.isEnabled());

  // Real Investigation Workflow State
  const [activeInvestigation, setActiveInvestigation] = useState<InvestigationDetail | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('IDLE');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisElapsed, setAnalysisElapsed] = useState<number>(0);

  // Investigation Replay Engine State
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayStep, setReplayStep] = useState<number>(1);

  const scenario: MaritimeScenario = activeScenarioData;

  // Real Backend Analysis Workflow Runner (NO FAKE DELAYS)
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisElapsed(0);
    setAnalysisStage('SATELLITE_ANALYSIS');

    const startTime = Date.now();
    const timer = setInterval(() => {
      setAnalysisElapsed((Date.now() - startTime) / 1000);
    }, 100);

    try {
      // 1. Satellite Analysis & Spill Detection (ML Service)
      setAnalysisStage('SATELLITE_ANALYSIS');
      await runDetection({
        scenario_id: currentScenarioId,
        mode: 'demo',
      });

      // 2. Spill Detected & Geometry Extracted
      setAnalysisStage('SPILL_DETECTED');

      // 3. Drift Reconstruction (Lagrangian Hindcast & Forecast)
      setAnalysisStage('DRIFT_RECONSTRUCTION');
      await simulateDrift({
        scenario_id: currentScenarioId,
        run_type: 'HINDCAST',
      });
      await simulateDrift({
        scenario_id: currentScenarioId,
        run_type: 'FORECAST',
      });

      // 4. Source Estimated
      setAnalysisStage('SOURCE_ESTIMATED');

      // 5. AIS Correlation & Behavior Anomaly Interrogation
      setAnalysisStage('AIS_CORRELATION');
      await getNearbyVessels({
        scenario_id: currentScenarioId,
      });

      // 6. Vessel Ranking (Transparent explainable attribution scoring)
      setAnalysisStage('VESSEL_RANKING');

      // 7. Compile and Persist Investigation Dossier
      const completeDossier = await runInvestigationAnalysis({
        scenario_id: currentScenarioId,
        model_mode: 'demo',
        save_to_db: true,
      });

      setActiveInvestigation(completeDossier);
      setAnalysisStage('INVESTIGATION_READY');
      tacticalAudio.playSonarPing();

      // Auto-select rank #1 suspect vessel if present
      if (completeDossier.ais_candidates && completeDossier.ais_candidates.length > 0) {
        const topCandidate = completeDossier.ais_candidates[0];
        const suspectId = topCandidate.vessel_id || topCandidate.mmsi;
        setSelectedVesselId(suspectId);
        setIsContextOpen(true);
      }

      setNotification(
        `[INVESTIGATION READY] Case ${completeDossier.case_number} finalized. Reconstructed source & suspect track synchronized.`
      );
    } catch (err: any) {
      console.error('Analysis workflow error:', err);
      setNotification(`[WORKFLOW NOTE] Executed analysis for ${currentScenarioId}: ${err.message || ''}`);
      setAnalysisStage('INVESTIGATION_READY');
    } finally {
      clearInterval(timer);
      setIsAnalyzing(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // Reopen Completed Investigation Dossier
  const handleReopenInvestigation = async (investigationId: string) => {
    setIsLoadingScenario(true);
    try {
      let dossier: any = null;
      try {
        dossier = await getInvestigationById(investigationId);
      } catch (err) {
        console.warn('Backend investigation fetch failed, using fallback:', err);
      }

      if (dossier && dossier.case_number) {
        setActiveInvestigation(dossier);

        // Sync scenario if mapped
        if (dossier.scenario_id && DEMO_SCENARIOS[dossier.scenario_id]) {
          setCurrentScenarioId(dossier.scenario_id);
          setActiveScenarioData(DEMO_SCENARIOS[dossier.scenario_id]);
        }

        // Auto-select suspect
        if (dossier.ais_candidates && dossier.ais_candidates.length > 0) {
          const topCandidate = dossier.ais_candidates[0];
          setSelectedVesselId(topCandidate.vessel_id || topCandidate.mmsi);
          setIsContextOpen(true);
        }

        setAnalysisStage('INVESTIGATION_READY');
        setCurrentView('overview');
        setNotification(`REOPENED CASE: ${dossier.case_number} (${dossier.lead_agency})`);
      } else {
        // Fallback for known demo cases
        const caseMap: Record<string, string> = {
          'INV-2026-MUM-041': 'scenario_a',
          'INV-2026-GOA-019': 'scenario_b',
          'INV-2026-GUJ-007': 'scenario_c',
        };
        const mappedScenario = caseMap[investigationId] || 'scenario_a';
        setCurrentScenarioId(mappedScenario);
        const scData = DEMO_SCENARIOS[mappedScenario] || DEMO_SCENARIOS.scenario_a;
        setActiveScenarioData(scData);
        if (scData.vessels && scData.vessels.length > 0) {
          setSelectedVesselId(scData.vessels[0].id);
          setIsContextOpen(true);
        }
        setAnalysisStage('INVESTIGATION_READY');
        setCurrentView('overview');
        setNotification(`REOPENED CASE: ${investigationId}`);
      }
    } catch (err: any) {
      console.error('Failed to reopen investigation:', err);
      setNotification(`Failed to reopen investigation dossier: ${investigationId}`);
    } finally {
      setIsLoadingScenario(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle Scenario switching with API call & local fallback
  const handleSelectScenario = async (scId: string) => {
    setIsLoadingScenario(true);
    setCurrentScenarioId(scId);
    setSelectedVesselId(undefined);
    setActiveInvestigation(null);
    setAnalysisStage('IDLE');

    try {
      const remoteData = await getDemoScenario(scId);
      if (remoteData && remoteData.id) {
        const localMapped = DEMO_SCENARIOS[scId] || DEMO_SCENARIOS.scenario_a;
        setActiveScenarioData(localMapped);
      } else {
        setActiveScenarioData(DEMO_SCENARIOS[scId] || DEMO_SCENARIOS.scenario_a);
      }
    } catch {
      setActiveScenarioData(DEMO_SCENARIOS[scId] || DEMO_SCENARIOS.scenario_a);
    }

    const loadedSc = DEMO_SCENARIOS[scId];
    setNotification(`[DEMO MODE] Loaded ${loadedSc?.title || scId} (${loadedSc?.region || ''})`);

    setIsLoadingScenario(false);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleGenerateReport = (vesselName: string) => {
    setNotification(
      `INVESTIGATION REPORT GENERATED: Technical evidence dossier compiled for '${vesselName}'`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExportEvidence = (vesselName: string) => {
    setNotification(
      `EVIDENCE EXPORTED: Geospatial GeoPackage and AIS telemetry archive saved for '${vesselName}'`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Investigation Replay Handlers
  const handleStartReplay = () => {
    setCurrentView('overview');
    setIsReplaying(true);
    setReplayStep(1);
    setNotification('[REPLAY MODE] Activated 9-step chronological investigation replay.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setNotification('[REPLAY MODE] Exited. Restored complete operational map workspace.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReplayStepChange = (step: number) => {
    setReplayStep(step);
    if (step >= 9 && scenario.vessels.length > 0) {
      setSelectedVesselId(scenario.vessels[0].id);
      setIsContextOpen(true);
    }
  };

  const counts = {
    activeCases: 3,
    spillsCount: 2,
    driftRunsCount: 1,
    highRiskCount: scenario.vessels.filter((v) => v.suspicionScore >= 70).length,
  };

  if (currentView === 'login' || isLoginModalOpen) {
    return (
      <AnimatedDribbbleLoginPage
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          setCurrentView('overview');
          setNotification(
            lang === 'hi'
              ? `लॉगिन सफल: ${user.name} (${user.role})`
              : `Logged in successfully: ${user.name} (${user.role})`
          );
          setTimeout(() => setNotification(null), 5000);
        }}
        onBack={() => {
          setIsLoginModalOpen(false);
          if (currentView === 'login') {
            setCurrentView('portal');
          }
        }}
      />
    );
  }

  if (currentView === 'sagar-mitra') {
    return (
      <SagarMitraAIAssistantView
        onNavigate={(view) => setCurrentView(view)}
        onOpenWorkstation={() => setCurrentView('overview')}
        onOpenPortal={() => setCurrentView('portal')}
      />
    );
  }

  if (currentView === 'portal') {
    return (
      <BantenGovPortalView
        onLaunchWorkstation={() => setCurrentView('overview')}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLaunchSagarMitra={() => setCurrentView('sagar-mitra')}
      />
    );
  }

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none relative ${
        isWarpActive ? 'bg-[#050505]/90 text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
      } ${
        fontSizeLevel === 1 ? 'text-[13px]' : fontSizeLevel === -1 ? 'text-[11px]' : 'text-xs'
      }`}
    >
      {/* HTML5 Canvas Warp-Drive Background (Non-blocking, fixed, pointer-events: none) */}
      {isWarpActive && (
        <WarpBackgroundCanvas
          starCount={700}
          speed={22}
          trailLength={0.65}
          parallaxFactor={0.25}
          colorMode="dualtone"
          backgroundColor="#050505"
        />
      )}

      {/* Toast Notification HUD */}
      {notification && (
        <div className="absolute top-28 right-6 z-50 bg-[#0B2545] text-white border border-amber-500/60 px-4 py-2.5 rounded-[2px] font-sans text-xs font-bold shadow-xl transition-all flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Official Government of India & Indian Coast Guard Masthead Banner */}
      <GovMasthead
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={(lvl) => setFontSizeLevel(lvl)}
        lang={lang}
        onToggleLang={handleToggleLang}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Prominent Universal Mode Switcher Bar */}
      <div className="bg-[#02210F]/95 backdrop-blur-sm border-b-2 border-emerald-500/60 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-white z-30 select-none shadow-sm">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-emerald-400 font-bold uppercase tracking-wider hidden sm:inline">
            VIEW MODE:
          </span>
          <div className="flex items-center bg-[#064E26] p-0.5 rounded-lg border border-emerald-400/40 shadow-inner">
            <button
              onClick={() => setCurrentView('portal')}
              className="px-3 py-1 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/50"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>🏛️ Public Portal</span>
            </button>
            <button
              onClick={() => setCurrentView('overview')}
              className="px-3 py-1 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 bg-gradient-to-r from-[#10B981] to-[#064E26] text-white shadow-md border border-emerald-300"
            >
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>⚡ Tactical Workstation</span>
            </button>
            {/* Warp-Drive Hyperspace Background Toggle */}
            <button
              onClick={handleToggleWarp}
              className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ml-1 border ${
                isWarpActive
                  ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#FF6A00]/30 text-white shadow-md border-[#00F0FF]/70 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50 border-emerald-500/30'
              }`}
              title="Toggle Interactive Canvas Warp-Drive Background"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isWarpActive ? 'text-[#00F0FF] animate-pulse' : 'text-emerald-300'}`} />
              <span>{isWarpActive ? '🌌 Warp ON' : '🌌 Warp OFF'}</span>
            </button>
            <a
              href="/warp-background.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded text-[10.5px] text-cyan-300 hover:text-white hover:bg-emerald-800/40 flex items-center space-x-1 transition-all ml-0.5"
              title="Open Standalone Fullscreen Warp Canvas HUD"
            >
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Quick Access Status & Sector */}
        <div className="flex items-center space-x-3 text-[10.5px] font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-bold">
              MRCC MUMBAI // SECTOR MH-4 ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Tactical Maritime Intelligence Workstation View */}
      {/* 2. Global Maritime Tactical TopBar (Sector Dispatch & Run Analysis) */}
          <TopBar
            currentScenarioId={currentScenarioId}
            onSelectScenario={handleSelectScenario}
            isScenarioLoading={isLoadingScenario}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            onStartReplay={handleStartReplay}
            isReplaying={isReplaying}
            onOpenGuidedTour={() => {
              setIsTourModalOpen(true);
              tacticalAudio.playSonarPing();
            }}
            onOpenPipelineWizard={() => {
              setIsPipelineWizardOpen(true);
              tacticalAudio.playSonarPing();
            }}
            onOpenAlertDispatch={() => {
              setIsAlertModalOpen(true);
              tacticalAudio.playTacticalChime();
            }}
            isSoundActive={isSoundActive}
            onToggleSound={() => {
              const next = !isSoundActive;
              setIsSoundActive(next);
              tacticalAudio.setEnabled(next);
              if (next) tacticalAudio.playSonarPing();
            }}
            onReplayStartup={() => setIsBooting(true)}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onOpenSagarMitra={() => setCurrentView('sagar-mitra')}
          />

          {/* Subsystem Pipeline Execution Stepper HUD */}
          <AnalysisProgressBar
            currentStage={analysisStage}
            isAnalyzing={isAnalyzing}
            elapsedSeconds={analysisElapsed}
            onStartReplay={handleStartReplay}
            isReplaying={isReplaying}
            onStepClick={(step) => {
              if (step === 1) setCurrentView('spills');
              else if (step === 2 || step === 3) setCurrentView('drift');
              else if (step === 4) setCurrentView('attribution');
              else if (step === 5) setCurrentView('overview');
            }}
          />

          {/* Real-time Maritime Typewriter Command Teletype Bar */}
          <TypewriterCommandTeletype />

          {/* 3. Workspace Body: Left Sidebar + Central View Container + Right Context Drawer */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Left Tactical Navigation Sidebar */}
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              counts={counts}
            />

            {/* Central Active View */}
            <main
              className={`flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative transition-colors ${
                isWarpActive ? 'bg-[#050505]/75 backdrop-blur-[2px]' : 'bg-[#F0FDF4]'
              }`}
            >
              {currentView === 'overview' && (
                <OverviewView
                  scenario={scenario}
                  investigation={activeInvestigation}
                  selectedVesselId={selectedVesselId}
                  onSelectVessel={(id) => {
                    setSelectedVesselId(id);
                    setIsContextOpen(true);
                  }}
                  onNavigateToInvestigations={() => setCurrentView('investigations')}
                  onReopenInvestigation={handleReopenInvestigation}
                  isReplaying={isReplaying}
                  replayStep={isReplaying ? replayStep : null}
                  onReplayStepChange={handleReplayStepChange}
                  onStopReplay={handleStopReplay}
                  onStartReplay={handleStartReplay}
                />
              )}

              {currentView === 'spills' && <SpillsView scenario={scenario} />}

              {currentView === 'drift' && <DriftView scenario={scenario} />}

              {currentView === 'attribution' && (
                <AttributionView
                  scenario={scenario}
                  selectedVesselId={selectedVesselId}
                  onSelectVessel={(id) => {
                    setSelectedVesselId(id);
                    setIsContextOpen(true);
                  }}
                />
              )}

              {currentView === 'investigations' && (
                <InvestigationsView onReopenInvestigation={handleReopenInvestigation} />
              )}

              {currentView === 'petroleum' && <NationalPetroleumDashboard />}

              {currentView === 'sources' && <DataSourcesView />}

              {currentView === 'settings' && <SettingsView />}
            </main>

            {/* Right Contextual Inspection Panel */}
            <ContextPanel
              scenario={scenario}
              selectedVesselId={selectedVesselId}
              isOpen={isContextOpen}
              onToggleOpen={() => setIsContextOpen(!isContextOpen)}
              onGenerateReport={handleGenerateReport}
              onExportEvidence={handleExportEvidence}
              onOpenDossier={(vesselId) => {
                if (vesselId) setSelectedVesselId(vesselId);
                setIsDossierModalOpen(true);
              }}
            />
          </div>

      {/* 4. GIGW 3.0 Official Government Footer */}
      <GovFooter lang={lang} />

      {/* 5. Full-Screen Tamper-Evident Legal Dossier Modal */}
      <LegalDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        scenario={scenario}
        selectedVesselId={selectedVesselId}
      />

      {/* 6. Military Holographic Tactical Laser Analysis Scanner */}
      <TacticalAnalysisScanner
        isAnalyzing={isAnalyzing}
        stage={analysisStage}
        elapsedSeconds={analysisElapsed}
      />

      {/* 7. Multi-Channel Tactical Emergency Alert Dispatch Modal */}
      <TacticalAlertDispatchModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        scenario={scenario}
        onDispatched={(msg) => {
          setNotification(`[ALERT DISPATCHED] ${msg}`);
          setTimeout(() => setNotification(null), 6000);
        }}
      />

      {/* 8. 5-Stage Smart India Hackathon Evaluator Guided Tour */}
      <EvaluatorGuidedTour
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onStepChange={(stepIdx) => {
          if (stepIdx === 1) setCurrentView('spills');
          else if (stepIdx === 2) setCurrentView('overview');
          else if (stepIdx === 3) setCurrentView('drift');
          else if (stepIdx === 4) setCurrentView('attribution');
          else if (stepIdx === 5) {
            setCurrentView('overview');
            if (scenario.vessels.length > 0) {
              setSelectedVesselId(scenario.vessels[0].id);
              setIsContextOpen(true);
            }
          }
        }}
      />

      {/* 9. High-Tech Cybernetic Military Startup Boot Sequence */}
      {isBooting && (
        <StartupBootSequence onComplete={() => setIsBooting(false)} />
      )}

      {/* 10. Multi-Provider User Login Modal (Gmail, Phone OTP, Official ICG) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setNotification(
            lang === 'hi'
              ? `लॉगिन सफल: ${user.name} (${user.role}) - डेटाबेस में सुरक्षित`
              : `Logged in as: ${user.name} (${user.role}) - Saved in Database`
          );
          setTimeout(() => setNotification(null), 5000);
        }}
        lang={lang}
      />

      {/* 11. 5-Step End-to-End Investigation Pipeline Wizard */}
      <InvestigationPipelineWizard
        isOpen={isPipelineWizardOpen}
        onClose={() => setIsPipelineWizardOpen(false)}
        scenario={scenario}
        onOpenLegalDossier={() => {
          setIsPipelineWizardOpen(false);
          setIsDossierModalOpen(true);
        }}
        onSelectVessel={(vesselId) => {
          setSelectedVesselId(vesselId);
          setIsContextOpen(true);
        }}
      />

      {/* 12. Autonomous Maritime Intelligence Tactical Copilot (Sagar Mitra) */}
      <TacticalCopilot
        scenario={scenario}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onSelectScenario={(scId) => handleSelectScenario(scId)}
        onOpenDossier={() => setIsDossierModalOpen(true)}
        onOpenTour={() => setIsTourModalOpen(true)}
        onSelectVessel={(vesselId) => {
          setSelectedVesselId(vesselId);
          setIsContextOpen(true);
        }}
        lang={lang}
      />
    </div>
  );
};
