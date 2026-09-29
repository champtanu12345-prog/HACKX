import React from 'react';
import { TricolorRibbon } from './TricolorRibbon';
import { Shield, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

interface GovFooterProps {
  lang?: 'en' | 'hi';
}

export const GovFooter: React.FC<GovFooterProps> = ({ lang = 'en' }) => {
  const govLinks = [
    { label: lang === 'hi' ? 'भारत का राष्ट्रीय पोर्टल' : 'National Portal of India', href: 'https://www.india.gov.in' },
    { label: lang === 'hi' ? 'रक्षा मंत्रालय' : 'Ministry of Defence', href: 'https://mod.gov.in' },
    { label: lang === 'hi' ? 'भारतीय तटरक्षक' : 'Indian Coast Guard', href: 'https://indiancoastguard.gov.in' },
    { label: lang === 'hi' ? 'इनकोइस (INCOIS)' : 'INCOIS Ocean Portal', href: 'https://incois.gov.in' },
    { label: lang === 'hi' ? 'नौवहन महानिदेशालय' : 'Directorate General of Shipping', href: 'https://dgshipping.gov.in' },
    { label: lang === 'hi' ? 'डिजिटल इंडिया' : 'Digital India', href: 'https://digitalindia.gov.in' },
  ];

  return (
    <footer className="w-full bg-[#0D5204] text-slate-100 border-t-2 border-[#138808] select-none text-[11.5px] font-sans">
      <TricolorRibbon height="sm" />

      {/* Main Footer Links */}
      <div className="w-full px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Portals of Government of India */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-[11px]">
          <span className="text-[#FFD700] font-serif font-bold uppercase tracking-wider">
            {lang === 'hi' ? 'भारत सरकार के प्रमुख पोर्टल:' : 'Government of India Portals:'}
          </span>
          {govLinks.map((link, idx) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-orange-100 inline-flex items-center space-x-0.5 hover:underline font-medium"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-amber-300" />
              </a>
              {idx < govLinks.length - 1 && <span className="text-emerald-300/60">|</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Compliance & SIH Credits */}
        <div className="flex items-center space-x-3 text-[10.5px] text-emerald-200 font-mono">
          <span className="flex items-center space-x-1 text-[#86EFAC] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>GIGW 3.0 COMPLIANT</span>
          </span>
          <span className="text-emerald-400/70">•</span>
          <span className="text-slate-100">SIH-2026 PS-260143</span>
          <span className="text-emerald-400/70">•</span>
          <span className="text-[#FFD700] font-serif font-bold">वयं रक्षामः</span>
        </div>
      </div>
    </footer>
  );
};
