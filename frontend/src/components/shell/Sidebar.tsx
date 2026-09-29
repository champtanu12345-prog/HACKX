import React from 'react';
import {
  LayoutDashboard,
  Waves,
  Wind,
  Ship,
  FileText,
  Radio,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Badge, BadgeVariant } from '../common/Badge';

export type NavView =
  | 'portal'
  | 'overview'
  | 'spills'
  | 'drift'
  | 'attribution'
  | 'investigations'
  | 'petroleum'
  | 'sources'
  | 'settings'
  | 'hero'
  | 'login';

interface NavItem {
  id: NavView;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: BadgeVariant;
}

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  counts?: {
    activeCases?: number;
    spillsCount?: number;
    driftRunsCount?: number;
    highRiskCount?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  counts,
}) => {
  const primaryNavItems: NavItem[] = [
    {
      id: 'hero' as NavView,
      label: '✨ HackX 3D Hero',
      shortLabel: '3D Hero',
      icon: <Sparkles className="w-4 h-4 text-cyan-500" />,
      badge: 'CONCEPT',
      badgeVariant: 'info' as const,
    },
    {
      id: 'portal' as NavView,
      label: '🏛️ ICG Portal',
      shortLabel: 'Portal',
      icon: <Globe className="w-4 h-4 text-emerald-600" />,
      badge: 'OFFICIAL',
      badgeVariant: 'info' as const,
    },
    {
      id: 'overview' as NavView,
      label: '• Overview',
      shortLabel: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: '3',
      badgeVariant: 'warning' as const,
    },
    {
      id: 'petroleum' as NavView,
      label: '• Petroleum SCADA',
      shortLabel: 'Petroleum',
      icon: <Flame className="w-4 h-4 text-amber-600" />,
      badge: 'DGH SCADA',
      badgeVariant: 'warning' as const,
    },
    {
      id: 'spills' as NavView,
      label: '• Oil Spills',
      shortLabel: 'Spills',
      icon: <Waves className="w-4 h-4" />,
      badge: '3',
      badgeVariant: 'critical' as const,
    },
    {
      id: 'drift' as NavView,
      label: '• Drift Analysis',
      shortLabel: 'Drift',
      icon: <Wind className="w-4 h-4" />,
      badge: '1',
      badgeVariant: 'info' as const,
    },
    {
      id: 'attribution' as NavView,
      label: '• Vessel Attribution',
      shortLabel: 'Attribution',
      icon: <Ship className="w-4 h-4" />,
      badge: '1',
      badgeVariant: 'critical' as const,
    },
    {
      id: 'investigations' as NavView,
      label: '• Evidence Dossiers',
      shortLabel: 'Dossiers',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'sources' as NavView,
      label: '• Sensor Feeds',
      shortLabel: 'Feeds',
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'settings' as NavView,
      label: '• System Settings',
      shortLabel: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'login' as NavView,
      label: '• Animated Login',
      shortLabel: 'Login',
      icon: <Shield className="w-4 h-4" />,
      badge: 'Auth',
      badgeVariant: 'neutral',
    },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center px-3 py-2.5 text-xs font-sans transition-all text-left relative cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-orange-50/90 to-white text-[#C2410C] font-extrabold border-l-4 border-l-[#EA580C] shadow-2xs'
            : 'text-slate-700 hover:bg-orange-50/50 hover:text-[#C2410C] border-l-4 border-l-transparent font-medium'
        }`}
      >
        <span className={`flex-shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-slate-500'}`}>
          {item.icon}
        </span>

        {!isCollapsed && (
          <div className="ml-2.5 flex-1 flex items-center justify-between truncate">
            <span className="truncate tracking-tight font-semibold text-[11.5px]">{item.label}</span>
            {item.badge && (
              <Badge variant={item.badgeVariant} size="xs" className="ml-1.5">
                {item.badge}
              </Badge>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`bg-white border-r-2 border-slate-300 flex flex-col justify-between select-none transition-all duration-200 z-20 shadow-xs ${
        isCollapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Top Nav Items */}
      <div className="py-2 space-y-0.5">
        {!isCollapsed && (
          <div className="px-3.5 py-1 text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            MISSION OPERATIONS
          </div>
        )}
        {primaryNavItems.map(renderNavButton)}

        {/* Clear Section Divider */}
        <div className="my-2 mx-3 border-t border-slate-200" />

        {!isCollapsed && (
          <div className="px-3.5 py-1 text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            SYSTEM MANAGEMENT
          </div>
        )}
        {secondaryNavItems.map(renderNavButton)}
      </div>

      {/* Bottom Footer & Official ICG Motto Badge */}
      <div className="p-2.5 border-t border-slate-300 bg-slate-50/80 text-[11px] font-sans">
        {!isCollapsed && (
          <div className="px-2 py-1.5 mb-2 rounded bg-slate-900 text-white border border-slate-700 text-center shadow-xs">
            <div className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider">
              INDIAN COAST GUARD
            </div>
            <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mt-0.5">
              MRCC MUMBAI (WEST)
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="w-full flex items-center justify-center p-1.5 rounded-[2px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0D5204] border border-slate-300 transition-colors cursor-pointer shadow-2xs"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
