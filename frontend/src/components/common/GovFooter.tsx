import React from 'react';
import { TricolorRibbon } from './TricolorRibbon';
import { Shield, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

export const GovFooter: React.FC = () => {
  const govLinks = [
    { label: 'National Portal of India', href: 'https://www.india.gov.in' },
    { label: 'Ministry of Defence', href: 'https://mod.gov.in' },
    { label: 'Indian Coast Guard', href: 'https://indiancoastguard.gov.in' },
    { label: 'INCOIS Ocean Portal', href: 'https://incois.gov.in' },
    { label: 'Directorate General of Shipping', href: 'https://dgshipping.gov.in' },
    { label: 'Digital India', href: 'https://digitalindia.gov.in' },
  ];

  return (
    <footer className="w-full bg-[#032B13] text-slate-200 border-t-2 border-[#064E26] select-none text-[11.5px] font-sans">
      <TricolorRibbon height="sm" />

      {/* Main Footer Links */}
      <div className="w-full px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Portals of Government of India */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-[11px]">
          <span className="text-[#FFD700] font-serif font-bold uppercase tracking-wider">
            भारत सरकार के पोर्टल:
          </span>
          {govLinks.map((link, idx) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-emerald-100 inline-flex items-center space-x-0.5 hover:underline font-medium"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
              </a>
              {idx < govLinks.length - 1 && <span className="text-emerald-700">|</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Compliance & SIH Credits */}
        <div className="flex items-center space-x-3 text-[10.5px] text-emerald-300 font-mono">
          <span className="flex items-center space-x-1 text-[#86EFAC] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>GIGW 3.0 COMPLIANT</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="text-slate-200">SIH-2026 PS-260143</span>
          <span className="text-emerald-700">•</span>
          <span className="text-[#FFD700] font-serif font-bold">वयं रक्षामः</span>
        </div>
      </div>
    </footer>
  );
};
