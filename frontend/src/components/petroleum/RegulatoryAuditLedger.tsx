import React, { useState } from 'react';
import {
  RegulatoryAuditEntry,
  REGULATORY_AUDIT_LOGS
} from '../../data/petroleumAuthorityData';
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronDown,
  Download,
  Building
} from 'lucide-react';

interface RegulatoryAuditLedgerProps {
  logs?: RegulatoryAuditEntry[];
  onViewEntryDetails?: (entry: RegulatoryAuditEntry) => void;
}

export const RegulatoryAuditLedger: React.FC<RegulatoryAuditLedgerProps> = ({
  logs = REGULATORY_AUDIT_LOGS,
  onViewEntryDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      log.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.directive.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.officer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <div className="bg-[#0D1117] border border-[#C5A059]/30 rounded-sm shadow-xl flex flex-col h-full overflow-hidden">
      {/* Ledger Header */}
      <div className="bg-[#161B22] px-4 py-2.5 border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C5A059]" />
          <div>
            <h3 className="font-serif font-bold text-white text-xs tracking-wider uppercase font-['Playfair_Display']">
              वैधानिक अनुपालन एवं सुरक्षा ऑडिट लेजर / Regulatory & Audit Compliance Ledger
            </h3>
            <div className="text-[10px] text-gray-400 font-mono">
              TAMPER-EVIDENT SHA-256 SCADA VERIFICATION
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference / facility / officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0D1117] text-white text-xs font-mono pl-8 pr-3 py-1 rounded border border-[#1F2937] focus:border-[#C5A059] focus:outline-none w-56 placeholder-gray-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0D1117] text-xs font-mono text-gray-200 border border-[#1F2937] focus:border-[#C5A059] rounded px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="SCADA_ALERT">SCADA Alerts</option>
            <option value="ENVIRONMENTAL">Environmental (Zero-Flaring)</option>
            <option value="ALLOCATION">Strategic Allocation (ISPRL)</option>
            <option value="MAINTENANCE">BOP & Rig Inspections</option>
            <option value="COMPLIANCE">Pipeline Integrity</option>
          </select>
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="overflow-x-auto flex-1 p-3">
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-mono text-xs">
              No matching regulatory audit records found.
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const isAlert = entry.severity === 'CRITICAL';
              const isVerified = entry.severity === 'VERIFIED';

              return (
                <div
                  key={entry.id}
                  className="bg-[#161B22]/90 border border-[#1F2937] hover:border-[#C5A059]/50 rounded p-3 transition-all flex flex-col gap-2"
                >
                  {/* Top line of record */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2937] pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#C5A059]">
                        {entry.referenceId}
                      </span>
                      <span className="text-gray-500 text-[10px]">|</span>
                      <span className="text-[11px] text-gray-300 font-sans font-medium flex items-center gap-1">
                        <Building className="w-3 h-3 text-gray-400" />
                        {entry.facility}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400">
                        {entry.timestamp}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isAlert
                            ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                            : isVerified
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : 'bg-blue-950 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {entry.severity}
                      </span>
                    </div>
                  </div>

                  {/* Directive & Statutory Details */}
                  <div className="text-xs text-gray-200 font-sans leading-relaxed">
                    {entry.directive}
                  </div>

                  {/* Bottom Verification Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#1F2937]/60 text-[10px] font-mono">
                    <div className="text-gray-400 flex items-center gap-2">
                      <span>Authority: <strong className="text-gray-300">{entry.authority}</strong></span>
                      <span>•</span>
                      <span>Signatory: <strong className="text-gray-300">{entry.officer}</strong></span>
                    </div>

                    {/* SHA Verification Badge */}
                    <div className="flex items-center gap-1 bg-[#0D1117] px-2 py-0.5 rounded border border-[#1F2937]">
                      <Lock className="w-2.5 h-2.5 text-[#C5A059]" />
                      <span className="text-gray-400">SHA-256:</span>
                      <button
                        onClick={() => handleCopySha(entry.verifiedSha)}
                        title="Copy Cryptographic SHA-256 Hash"
                        className="text-[#C5A059] hover:underline font-mono"
                      >
                        {entry.verifiedSha.substring(0, 14)}...
                      </button>
                      {copiedSha === entry.verifiedSha && (
                        <span className="text-emerald-400 ml-1">Copied!</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-[#111620] px-4 py-2 border-t border-[#1F2937] text-[10px] font-mono text-gray-400 flex items-center justify-between">
        <span>Statutory Authority: Petroleum & Natural Gas Regulatory Board Act 2006</span>
        <span className="text-[#C5A059]">Total Audited Records: {filteredLogs.length}</span>
      </div>
    </div>
  );
};
