import React, { useEffect, useState } from 'react';
import { FileText, ShieldAlert, CheckCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Investigation } from '../types';
import { getInvestigations, updateInvestigation } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';

export const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getInvestigations();
      setInvestigations(list);
    } catch (err) {
      console.error('Failed to load investigations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateInvestigation(id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div className="flex-1 bg-bridge-950 p-6 overflow-y-auto select-none font-mono text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-bridge-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-tactical-cyan" />
              <h1 className="text-base font-bold text-bridge-100 tracking-wider uppercase">
                MARITIME INCIDENT INVESTIGATION & ENFORCEMENT DOSSIERS
              </h1>
            </div>
            <p className="text-[11px] text-bridge-400 mt-1">
              Official Coast Guard preliminary investigation packages for inspection under Merchant Shipping & MARPOL Annex I.
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bridge-850 hover:bg-bridge-800 border border-bridge-700 text-bridge-300 text-[11px] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Dossiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investigations.map((inv) => (
            <div
              key={inv.id}
              className="bg-bridge-900 border border-bridge-700 rounded p-4 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between border-b border-bridge-800 pb-2">
                <div>
                  <div className="font-bold text-sm text-bridge-100">{inv.case_number}</div>
                  <div className="text-[10px] text-bridge-400 mt-0.5">
                    LEAD AGENCY: {inv.lead_agency}
                  </div>
                </div>
                <StatusBadge status={inv.status} type="case" />
              </div>

              <div className="space-y-1 text-[11px] text-bridge-300">
                <div>
                  <span className="text-bridge-500">ASSOCIATED SPILL:</span>{' '}
                  <span className="text-bridge-200">{inv.spill_id}</span>
                </div>
                <div>
                  <span className="text-bridge-500">PRIMARY SUSPECT ID:</span>{' '}
                  <span className="text-tactical-amber font-semibold">
                    {inv.primary_suspect_id || 'UNDER TRIAGE'}
                  </span>
                </div>
                <div>
                  <span className="text-bridge-500">OPENED TIMESTAMP:</span>{' '}
                  <span className="text-bridge-200">{new Date(inv.created_at).toUTCString()}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-bridge-950 border border-bridge-800 text-[11px] text-bridge-300">
                <span className="font-bold text-bridge-400 block mb-1">EVIDENCE SUMMARY NOTES:</span>
                <p className="leading-relaxed text-[10px]">{inv.summary_notes || 'Pending field investigation report.'}</p>
              </div>

              {/* Status Action Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-bridge-800 text-[11px]">
                <span className="text-bridge-500">CHANGE STATUS:</span>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => handleStatusUpdate(inv.id, 'TRIAGED')}
                    className="px-2 py-0.5 rounded bg-bridge-800 hover:bg-bridge-700 text-tactical-amber text-[10px] border border-bridge-700"
                  >
                    Triage
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(inv.id, 'ESCALATED_TO_COAST_GUARD')}
                    className="px-2 py-0.5 rounded bg-bridge-800 hover:bg-bridge-700 text-tactical-red text-[10px] border border-bridge-700"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(inv.id, 'CLOSED')}
                    className="px-2 py-0.5 rounded bg-bridge-800 hover:bg-bridge-700 text-tactical-emerald text-[10px] border border-bridge-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ))}

          {investigations.length === 0 && !loading && (
            <div className="col-span-2 text-center py-12 text-bridge-500">
              No investigation dossiers logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
