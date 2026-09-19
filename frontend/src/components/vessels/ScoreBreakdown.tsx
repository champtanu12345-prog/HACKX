import React from 'react';
import { ShieldAlert, Compass, Clock, AlertTriangle, MapPin } from 'lucide-react';

interface ScoreBreakdownProps {
  overallScore: number;
  spatialScore: number;
  temporalScore: number;
  trajectoryScore: number;
  behaviorScore: number;
  investigationPriority?: 'Low' | 'Moderate' | 'High' | 'Very High' | string;
  className?: string;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  overallScore,
  spatialScore,
  temporalScore,
  trajectoryScore,
  behaviorScore,
  investigationPriority,
  className = '',
}) => {
  const wSpatial = 0.40;
  const wTemporal = 0.25;
  const wTrajectory = 0.20;
  const wBehavior = 0.15;

  const spatialContribution = spatialScore * wSpatial;
  const temporalContribution = temporalScore * wTemporal;
  const trajectoryContribution = trajectoryScore * wTrajectory;
  const behaviorContribution = behaviorScore * wBehavior;

  const priority =
    investigationPriority ||
    (overallScore >= 80.0
      ? 'Very High'
      : overallScore >= 60.0
      ? 'High'
      : overallScore >= 30.0
      ? 'Moderate'
      : 'Low');

  const priorityBadgeStyle =
    priority === 'Very High'
      ? 'bg-red-50 border-red-200 text-red-800 font-bold'
      : priority === 'High'
      ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
      : priority === 'Moderate'
      ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
      : 'bg-gray-100 border-gray-200 text-charcoal-700 font-medium';

  const components = [
    {
      label: 'Spatial Proximity',
      weightPct: 40,
      rawScore: spatialScore,
      contribution: spatialContribution,
      maxPts: 40.0,
      color: 'bg-red-600',
      textColor: 'text-red-700',
      icon: <MapPin className="w-3 h-3 text-red-600" />,
    },
    {
      label: 'Temporal Alignment',
      weightPct: 25,
      rawScore: temporalScore,
      contribution: temporalContribution,
      maxPts: 25.0,
      color: 'bg-blue-600',
      textColor: 'text-blue-800',
      icon: <Clock className="w-3 h-3 text-blue-600" />,
    },
    {
      label: 'Trajectory Match',
      weightPct: 20,
      rawScore: trajectoryScore,
      contribution: trajectoryContribution,
      maxPts: 20.0,
      color: 'bg-sky-600',
      textColor: 'text-sky-800',
      icon: <Compass className="w-3 h-3 text-sky-600" />,
    },
    {
      label: 'Behavioral Anomaly',
      weightPct: 15,
      rawScore: behaviorScore,
      contribution: behaviorContribution,
      maxPts: 15.0,
      color: 'bg-amber-600',
      textColor: 'text-amber-800',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
    },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-[2px] p-3 shadow-xs space-y-3 font-sans text-xs ${className}`}>
      {/* Top Header: Total Score & Priority Badge */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div>
          <div className="text-[10px] font-mono text-charcoal-500 uppercase tracking-wider font-semibold">
            ATTRIBUTION CORRELATION SCORE
          </div>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span
              className={`text-2xl font-bold font-mono ${
                overallScore >= 75
                  ? 'text-red-700'
                  : overallScore >= 50
                  ? 'text-amber-800'
                  : 'text-blue-900'
              }`}
            >
              {overallScore.toFixed(1)}
            </span>
            <span className="text-xs text-charcoal-500 font-mono">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-charcoal-500 uppercase font-semibold">PRIORITY</div>
          <span className={`inline-block px-2 py-0.5 rounded-[2px] border text-[11px] uppercase tracking-wider mt-0.5 ${priorityBadgeStyle}`}>
            {priority}
          </span>
        </div>
      </div>

      {/* 4-Component Linear Stacked Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-gray-100 rounded-xs overflow-hidden flex">
          <div style={{ width: `${spatialContribution}%` }} className="bg-red-600" title="Spatial: 40%" />
          <div style={{ width: `${temporalContribution}%` }} className="bg-blue-600" title="Temporal: 25%" />
          <div style={{ width: `${trajectoryContribution}%` }} className="bg-sky-600" title="Trajectory: 20%" />
          <div style={{ width: `${behaviorContribution}%` }} className="bg-amber-600" title="Behavior: 15%" />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-charcoal-500">
          <span>0.40·S</span>
          <span>0.25·T</span>
          <span>0.20·R</span>
          <span>0.15·B</span>
        </div>
      </div>

      {/* Components Breakdown Table */}
      <div className="space-y-1.5 pt-1">
        {components.map((c) => (
          <div key={c.label} className="p-1.5 rounded-[2px] bg-gray-50 border border-gray-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              {c.icon}
              <span className="font-medium text-charcoal-800">{c.label} ({c.weightPct}%)</span>
            </div>
            <div className="flex items-center space-x-2 font-mono">
              <span className="text-charcoal-500 text-[10px]">
                {c.rawScore.toFixed(0)}/100
              </span>
              <span className={`font-bold ${c.textColor}`}>
                +{c.contribution.toFixed(1)} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
