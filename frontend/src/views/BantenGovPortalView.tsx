import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Mail,
  Share2,
  X,
  Sparkles,
  Activity,
  Heart,
  Bookmark,
  Send,
  Eye,
  Calendar,
  Clock,
  Layers,
  Globe,
  Radio,
  BarChart3,
  Shield,
  CheckCircle,
  CheckCircle2,
  FileText,
  Phone,
  Download,
  Award,
  AlertCircle,
  Building,
  Users,
  Compass,
  Waves,
  Ship,
  Anchor,
  FileCheck,
  History,
  Target,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  ChevronsUp,
  Filter,
} from 'lucide-react';
import { StateEmblemIndia } from '../components/common/StateEmblemIndia';
import { IndianCoastGuardInsignia } from '../components/common/IndianCoastGuardInsignia';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  date: string;
  timeAgo?: string;
  image: string;
  excerpt: string;
  content: string;
  url?: string;
}

interface MediaReleaseItem {
  id: string;
  badge: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

interface AnnouncementItem {
  id: string;
  refNo: string;
  title: string;
  category: 'NAVAREA' | 'Tender' | 'Recruitment' | 'Advisory';
  date: string;
  deadline?: string;
  urgent?: boolean;
  excerpt: string;
  details: string;
}

interface BantenGovPortalViewProps {
  onLaunchWorkstation?: () => void;
  onOpenLogin?: () => void;
  onLaunchSagarMitra?: () => void;
}

export const BantenGovPortalView: React.FC<BantenGovPortalViewProps> = ({
  onLaunchWorkstation,
  onOpenLogin,
  onLaunchSagarMitra,
}) => {
  // Mode: fullscreen browser mode (default for free scrolling) vs showcase frame
  const [viewMode, setViewMode] = useState<'showcase' | 'fullscreen'>('fullscreen');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [activeAseanPage, setActiveAseanPage] = useState<number>(0);

  // Scroll Tracking & Navigation Helpers for Free Top-to-Bottom Scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Update scroll percentage from container scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const total = scrollHeight - clientHeight;
    const progress = total > 0 ? (scrollTop / total) * 100 : 0;
    setScrollProgress(progress);
    setShowScrollTop(scrollTop > 200);
  };

  // Fallback / window scroll listener to ensure progress bar always tracks
  useEffect(() => {
    const updateScrollMetrics = () => {
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (scrollContainerRef.current) {
        scrollTop = scrollContainerRef.current.scrollTop;
        scrollHeight = scrollContainerRef.current.scrollHeight;
        clientHeight = scrollContainerRef.current.clientHeight;
      }

      if (!scrollTop || scrollTop === 0) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        clientHeight = window.innerHeight || document.documentElement.clientHeight;
      }

      const total = scrollHeight - clientHeight;
      const progress = total > 0 ? (scrollTop / total) * 100 : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 200);
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollMetrics);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    window.scrollTo({
      top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      behavior: 'smooth',
    });
  };

  // Profile Section Tabs
  const [profileTab, setProfileTab] = useState<'vision' | 'jurisdiction' | 'fleet'>('vision');

  // Governance Section Tabs
  const [governanceTab, setGovernanceTab] = useState<'leadership' | 'committees' | 'mandate'>('leadership');

  // Public Info Section Tabs
  const [publicInfoTab, setPublicInfoTab] = useState<'hotlines' | 'guidelines' | 'reports'>('hotlines');

  // Announcements Category Filter
  const [announcementFilter, setAnnouncementFilter] = useState<'ALL' | 'NAVAREA' | 'Tender' | 'Advisory'>('ALL');

  // RTI Form State
  const [rtiForm, setRtiForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Citizen of India',
    query: '',
  });
  const [rtiSubmittedId, setRtiSubmittedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('RTI/ICG/2026/08492');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [activeRtiTab, setActiveRtiTab] = useState<'submit' | 'track' | 'pio' | 'proactive'>('submit');

  // Press Release Category Filter
  const [pressFilter, setPressFilter] = useState<'ALL' | 'Operations' | 'National' | 'Environmental'>('ALL');

  // Directory quick links matching uploaded screenshot layout (India Maritime Context)
  const directoryLinks = [
    {
      id: 'semua',
      title: 'All Maritime Services',
      category: 'all',
      action: () => onLaunchWorkstation && onLaunchWorkstation(),
    },
    {
      id: 'lembaga_teknis',
      title: 'Coast Guard Regional HQs & Stations',
      category: 'agency',
      action: () => {
        const el = document.getElementById('profile');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'sekretariat_daerah',
      title: 'Ministry of Defence & DG Shipping',
      category: 'gov',
      action: () => {
        const el = document.getElementById('governance');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'layanan_publik',
      title: 'Public Spill & Pollution Incident Portal',
      category: 'public',
      action: () => {
        const el = document.getElementById('public-info');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'satpol_pp',
      title: 'Coastal Marine Police & CISF Port Units',
      category: 'security',
      action: () => {
        const el = document.getElementById('announcements');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'dinas_daerah',
      title: 'Pollution Response Teams (PRT)',
      category: 'dept',
      action: () => {
        const el = document.getElementById('governance');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'aplikasi_publik',
      title: 'Tactical Workstation & AIS Analytics',
      category: 'apps',
      highlight: true,
      action: () => onLaunchWorkstation && onLaunchWorkstation(),
    },
    {
      id: 'sekretariat_dprd',
      title: 'INCOIS & DGLL Metocean Feeds',
      category: 'dprd',
      action: () => {
        const el = document.getElementById('rti-request');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  // News items matching uploaded screenshot with authentic Indian Coast Guard imagery
  const featuredArticle: ArticleItem = {
    id: 'featured-1',
    title:
      'Director General Indian Coast Guard Addresses National Maritime Security & Marine Environment Conference in New Delhi',
    category: 'HEADQUARTERS DISPATCH',
    timeAgo: '5 hours ago',
    date: '29 September 2026',
    image: '/portal/featured_leader.jpg',
    excerpt:
      'The Director General of the Indian Coast Guard alongside senior delegates from the Ministry of Defence announced the operational commissioning of the automated National Oil Spill Intelligence & Tracking System (NOS-DCP) and expanded EEZ satellite radar surveillance.',
    content:
      'New Delhi - The Indian Coast Guard has operationalized the next-generation Maritime Oil Spill Intelligence & Attribution Workstation. Integrated with Sentinel-1 SAR constellation telemetry and INCOIS hydrodynamics v2.4, the platform correlates high-density shipping traffic corridors in Sector MH-4 (Offshore Mumbai High) with Lagrangian trajectory backward reconstruction to attribute illicit bilge dump incidents with court-admissible forensic certainty.',
  };

  const newsCards: ArticleItem[] = [
    {
      id: 'news-1',
      title:
        'Indian Coast Guard Ship (ICGS) CG-202 Deploys on Extended High-Seas EEZ Patrol & Ballast Compliance Interdiction',
      category: 'Operations',
      date: '29 September 2026',
      image: '/portal/news_launch.jpg',
      excerpt:
        'Advanced Offshore Patrol Vessel CG-202 sets sail on anti-pollution and vessel compliance surveillance along western offshore petroleum transit routes.',
      content:
        'The Indian Coast Guard has expanded its maritime patrol matrix across Gujarat, Maharashtra, and Goa coastal zones. The automated audit pipeline identifies vessel trajectory anomalies and unannounced AIS transmission dropouts in critical marine protected zones.',
    },
    {
      id: 'news-2',
      title:
        'Indian Coast Guard & Ministry of Defence Convene High-Level Indian Ocean Region Strategic Maritime Dialogue in New Delhi',
      category: 'National',
      date: '28 September 2026',
      image: '/portal/news_delegation.jpg',
      excerpt:
        'Senior commanders and maritime security delegates deliberate on real-time AIS vessel trajectory attribution, MARPOL compliance, and joint regional contingency protocols.',
      content:
        'Senior ICG leadership and delegates discussed multilateral cooperation in the Indian Ocean Region, demonstrating successful reverse-drift vessel attribution and automated legal dossier generation for maritime pollution incidents.',
    },
    {
      id: 'news-3',
      title:
        'Indian Coast Guard Pollution Response Team (PRT) Deploys High-Seas Oil Spill Containment Booms in Preparedness Drill',
      category: 'Environmental',
      date: '28 September 2026',
      image: '/portal/news_award.jpg',
      excerpt:
        'Specialized marine environment defense teams demonstrate rapid 24-hour containment boom deployment and oil recovery skimmer operations in coastal waters.',
      content:
        'Under the National Oil Spill Disaster Contingency Plan (NOS-DCP), dedicated Pollution Response Teams (PRTs) executed tactical sea trials deploying heavy-duty containment booms, absorbent sweeps, and dynamic skimmers to safeguard ecologically sensitive coastal corridors.',
    },
  ];

  // Announcements List
  const announcementsList: AnnouncementItem[] = [
    {
      id: 'ann-1',
      refNo: 'NAVAREA-VIII/0482/26',
      title:
        'NAVAREA VIII Hazard Warning: Oceanographic Drift Locus & High Wind Advisory in Sector MH-4 (Offshore Mumbai High)',
      category: 'NAVAREA',
      date: '29 September 2026',
      deadline: 'Active Until 05 Oct 2026',
      urgent: true,
      excerpt:
        'All merchant vessels, offshore petroleum installations, and fishing craft are advised to maintain vigilant watch. Unreported heavy fuel oil sheen detected 18 NM offshore; drifting southeast.',
      details:
        'Satellite radar pass Sentinel-1A detected an elongated surface slick of approximately 14.85 km² at Lat 19°06\'43"N, Lon 72°23\'42"E. Indian Coast Guard patrol vessels ICGS Samudra Prahari and Dornier CG-792 are deployed for containment and forensic sampling. Mariners are requested to report any sighting to MRCC Mumbai on VHF Ch-16 or Toll-Free 1554.',
    },
    {
      id: 'ann-2',
      refNo: 'TND/ICG/ENV/2026/094',
      title:
        'Central Public Procurement Portal: Supply & Integration of High-Capacity Ocean Containment Booms & Disc Skimmers',
      category: 'Tender',
      date: '26 September 2026',
      deadline: 'Bid Submission Deadline: 20 Oct 2026',
      excerpt:
        'Indian Coast Guard invites competitive e-tenders from certified defense & environmental engineering manufacturers for Tier-1 & Tier-2 pollution response inventory replenishment.',
      details:
        'Procurement encompasses 1,200 meters of heavy-duty offshore inflatable boom systems, 6 units of high-viscosity oleophilic disc skimmers (150 m³/h rated), and biodegradable dispersant concentrate certified under IS 14660 standards.',
    },
    {
      id: 'ann-3',
      refNo: 'ADV/DAT/2026/019',
      title:
        'Fishermen Coastal Safety Drive: Free Distribution & Calibration of Second-Generation NavIC Distress Alert Transmitters',
      category: 'Advisory',
      date: '24 September 2026',
      deadline: 'Workshop Window: 02 - 12 Oct 2026',
      excerpt:
        'Comprehensive coastal outreach program distributing ISRO-developed NavIC satellite emergency transmitters to mechanized fishing vessels across Maharashtra and Gujarat.',
      details:
        'The Distress Alert Transmitter (DAT-SG) provides two-way emergency satellite messaging directly to the Maritime Rescue Coordination Centre (MRCC), transmitting boat registration, precise GPS fix, and nature of maritime emergency within 90 seconds of activation.',
    },
  ];

  // International & National Initiatives (Replica of ASEAN section with Indian maritime theme)
  const nationalInitiatives: MediaReleaseItem[] = [
    {
      id: 'init-1',
      badge: 'Press Release',
      title:
        'Youth Innovators & Cadets Take Strategic Leadership in Blue Economy & Ocean AI Initiatives',
      date: '10 September 2026',
      excerpt:
        'National maritime hackathon finalists deploy real-time satellite imagery segmentation and deep learning models to protect coastal coral reefs and marine sanctuaries.',
      content:
        'The Smart India Hackathon initiative connects student research teams with defense scientists to develop court-admissible algorithmic attribution for maritime environmental law violations.',
    },
    {
      id: 'init-2',
      badge: 'Press Release',
      title:
        'Regional Ocean Observation Network Commended by International Maritime Delegates',
      date: '9 September 2026',
      excerpt:
        'Delegates praise India’s seamless fusion of INCOIS ocean surface hydrodynamics, NOAA wind vectors, and coastal radar feeds for disaster mitigation.',
      content:
        'International inspectors recognized the automated Runge-Kutta 4th Order (RK4) numerical drift calculation as a benchmark in regional ocean pollution mitigation.',
    },
    {
      id: 'init-3',
      badge: 'Press Release',
      title:
        'Maritime India Expo 2026: Concrete Interoperability in Pollution Response and Coastal Safety',
      date: '8 September 2026',
      excerpt:
        'Major exhibition demonstrates integrated response capabilities between Indian Navy, Coast Guard, Major Port Authorities, and DGLL.',
      content:
        'Live pollution containment exercises in Mumbai Harbour validated rapid deployment protocols for oil skimmers, aerial dispersant spraying, and coastal exclusion booms.',
    },
  ];

  const handleRtiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtiForm.name || !rtiForm.query) {
      alert('Please fill out your full name and details of information requested.');
      return;
    }
    const generatedId = `RTI/ICG/2026/${Math.floor(10000 + Math.random() * 90000)}`;
    setRtiSubmittedId(generatedId);
    setTrackingResult({
      id: generatedId,
      name: rtiForm.name,
      status: 'Registered & Assigned (Under CPIO Review)',
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      estimatedCompletion: '10 Working Days',
      officer: 'Central Public Information Officer (CPIO), Coast Guard Headquarters',
    });
  };

  const handleTrackQuery = () => {
    if (!trackingInput.trim()) return;
    setTrackingResult({
      id: trackingInput.toUpperCase(),
      name: 'Registered Citizen of India',
      status: 'Under Active Scrutiny by Technical Information Section',
      date: '28 September 2026',
      estimatedCompletion: '6 Working Days Remaining',
      officer: 'Joint Directorate of Marine Environment & Law, Coast Guard HQ',
      timeline: [
        { title: 'Application Formally Received on RTI Portal', date: '28 Sept 2026, 09:14 IST', done: true },
        { title: 'Verification of Identity & Statutory Fees', date: '28 Sept 2026, 14:30 IST', done: true },
        { title: 'Technical Record Extraction from Workstation Archives', date: '29 Sept 2026, 11:00 IST', done: true },
        { title: 'Legal Dossier Scrutiny under Section 8(1) Exemptions', date: 'In Progress', done: false },
        { title: 'Certified Public Response Dispatch via Email & Speed Post', date: 'Estimated 06 Oct 2026', done: false },
      ],
    });
  };

  const filteredLinks = searchQuery.trim()
    ? directoryLinks.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : directoryLinks;

  const filteredNews = pressFilter === 'ALL' ? newsCards : newsCards.filter((n) => n.category === pressFilter);

  const filteredAnnouncements =
    announcementFilter === 'ALL' ? announcementsList : announcementsList.filter((a) => a.category === announcementFilter);

  // The actual website body
  const PortalContent = (
    <div className="w-full bg-white text-slate-800 font-sans selection:bg-[#006837] selection:text-white scroll-smooth">
      {/* 1. TOP PORTAL NAVIGATION BAR (Indian Government & Coast Guard Portal Style) */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-xs">
        {/* National Emblem & Indian Coast Guard Crest */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Authentic Lion Capital of Ashoka (State Emblem of India) */}
            <StateEmblemIndia size="sm" variant="gold" className="drop-shadow-xs" />
            {/* Indian Coast Guard Official Insignia */}
            <IndianCoastGuardInsignia size="sm" variant="color" className="drop-shadow-xs hidden sm:inline-block" />
          </div>

          <div className="border-l border-slate-300 pl-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-slate-900 tracking-tight text-xs sm:text-sm uppercase">
                INDIAN COAST GUARD • SAGAR MITRA
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                SIH 260143
              </span>
            </div>
            <div className="text-[10px] text-[#006837] font-bold tracking-wider uppercase font-sans">
              भारत सरकार • रक्षा मंत्रालय | GOVERNMENT OF INDIA • MINISTRY OF DEFENCE
            </div>
          </div>
        </div>

        {/* Center Nav Links with Indian Government Font & Styling */}
        <div className="hidden lg:flex items-center space-x-6 text-[13px] font-semibold text-slate-700 font-sans">
          <button
            type="button"
            onClick={() => scrollToSection('profile')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('governance')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            Governance
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('public-info')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            Public Info
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('berita')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            Press Release
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('announcements')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            Announcements
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('rti-request')}
            className="hover:text-[#006837] transition-colors py-1 cursor-pointer"
          >
            RTI Request
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Sagar Mitra AI Assistant Launcher CTA */}
          {onLaunchSagarMitra && (
            <button
              onClick={onLaunchSagarMitra}
              className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-cyan-500/25 transition-all flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5 border border-cyan-400/40"
              title="Launch Sagar Mitra AI Assistant (Maritime Intelligence Copilot)"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>✦ Sagar Mitra AI</span>
            </button>
          )}

          {/* Workstation Launcher CTA */}
          {onLaunchWorkstation && (
            <button
              onClick={onLaunchWorkstation}
              className="bg-gradient-to-r from-[#006837] to-[#044322] hover:from-[#007a41] hover:to-[#05532b] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5"
              title="Launch Full Indian Maritime Intelligence Tactical Workstation"
            >
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden sm:inline">Tactical Workstation</span>
              <span className="sm:hidden">Workstation</span>
            </button>
          )}

          {/* Officer Animated Login Trigger */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
              title="Official Command / Officer Login"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Officer Login</span>
            </button>
          )}

          {/* National Tricolor Indicator Chip */}
          <div className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10.5px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            <span className="w-2 h-2 rounded-full bg-white border border-slate-300" />
            <span className="w-2 h-2 rounded-full bg-[#138808]" />
            <span className="text-slate-700 ml-1 font-mono">INDIA</span>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH AERIAL PORT BACKGROUND & INDIAN MARITIME HEADLINE */}
      <section className="relative w-full min-h-[460px] sm:min-h-[500px] flex flex-col justify-between">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/portal/hero_bg.jpg"
            alt="Aerial Coastal Highway and Maritime Port"
            className="w-full h-full object-cover object-center filter brightness-[0.76] contrast-[1.10]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/65 via-slate-900/40 to-slate-900/85" />
        </div>

        {/* Floating Social Icons (Right side, matching screenshot) */}
        <div className="absolute right-4 sm:right-6 top-1/3 -translate-y-1/2 z-20 hidden md:flex flex-col space-y-3">
          <a
            href="https://twitter.com/IndiaCoastGuard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Twitter / X (@IndiaCoastGuard)"
          >
            𝕏
          </a>
          <a
            href="https://facebook.com/IndiaCoastGuard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Facebook"
          >
            f
          </a>
          <a
            href="https://instagram.com/indiancoastguard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Instagram"
          >
            📷
          </a>
        </div>

        {/* Floating Left Tag: Official Directive / NOS-DCP */}
        <div className="absolute left-4 sm:left-6 top-1/3 -translate-y-1/2 z-20 hidden md:flex items-center">
          <div className="transform -rotate-90 origin-center bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold tracking-widest uppercase border border-white/30 shadow-md flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-ping" />
            <span>OFFICIAL DIRECTIVE</span>
          </div>
        </div>

        {/* Center Main Headline in Indian Government Typography */}
        <div className="relative z-10 pt-16 sm:pt-20 pb-20 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest mb-3">
            <span>सत्यमेव जयते • वयम् रक्षामः</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
            SAFEGUARDING INDIA&apos;S MARITIME HORIZONS <br />
            <span className="text-[#FFD700] drop-shadow-lg">& CITIZEN DIRECTIVES</span>
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto drop-shadow-sm font-medium leading-relaxed">
            Official Integrated Public Gateway of the Indian Coast Guard & National Oil Spill Disaster Contingency System
            (NOS-DCP) // Central Coordinating Authority for Marine Environmental Protection
          </p>
        </div>

        {/* 3. CENTER FLOATING WHITE DIRECTORY CARD (Exact 8 links layout adapted to India) */}
        <div className="relative z-20 max-w-3xl lg:max-w-4xl w-[92%] mx-auto -mb-20 sm:-mb-24">
          <div className="bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.22)] border border-slate-100 p-5 sm:p-7">
            {/* Search Input Bar */}
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian Coast Guard services, vessel tracking, MARPOL compliance, spill bulletins..."
                className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/20 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={() => {
                  if (onLaunchWorkstation) onLaunchWorkstation();
                }}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#006837] hover:bg-[#00522c] text-white px-4 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Search</span>
              </button>
            </div>

            {/* Quick Links Grid (4x2 or 2x4 matching screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {filteredLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setSelectedArticle({
                        id: item.id,
                        title: item.title,
                        category: 'Official Directorate',
                        date: '2026',
                        image: '/portal/hero_bg.jpg',
                        excerpt: `Official Indian Coast Guard Directorate: ${item.title}. Real-time public interface and operational coordination hub.`,
                        content: `Centralized public directory for ${item.title}. Connected with Maritime Rescue Coordination Centres (MRCC) and national satellite telemetry streams.`,
                      });
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                    item.highlight
                      ? 'bg-emerald-50/70 border-emerald-300 hover:border-[#006837] hover:bg-emerald-100/60 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-[#006837]/60'
                  }`}
                >
                  <span
                    className={`text-[12px] font-semibold line-clamp-1 pr-2 transition-colors ${
                      item.highlight ? 'text-[#006837]' : 'text-slate-700 group-hover:text-[#006837]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <ExternalLink
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      item.highlight ? 'text-[#006837]' : 'text-[#006837]/70 group-hover:text-[#006837]'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Free Top-to-Bottom Scroll Bar & Directional Action */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006837]"></span>
                </span>
                <span className="font-medium text-slate-600">
                  Prefer free scrolling? Scroll freely down with mouse wheel/touch or use options:
                </span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => scrollToSection('berita')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006837] text-xs font-bold rounded-lg border border-emerald-300 transition-all hover:shadow-xs cursor-pointer"
                  title="Scroll down to explore all sections below without clicking directory items"
                >
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Scroll Down to Content</span>
                </button>
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all cursor-pointer"
                  title="Fast jump to bottom of page"
                >
                  <span>To Bottom</span>
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Indicator for Natural Free Top-to-Bottom Scrolling */}
        <div className="relative z-20 flex justify-center -mb-6 sm:-mb-8 mt-4">
          <button
            type="button"
            onClick={() => scrollToSection('berita')}
            className="group inline-flex items-center space-x-2 px-4 py-1.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-full shadow-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#006837] transition-all hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#006837] animate-pulse" />
            <span>Scroll Down to Explore Entire Portal Below (Mouse Wheel, Swipe or Click)</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#006837] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 4. SECTION: LATEST MARITIME NEWS (India Maritime Context, Exact Screenshot Layout) */}
      <section id="berita" className="pt-28 sm:pt-36 pb-16 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-[#006837] uppercase tracking-wider font-mono">
              प्रेस विज्ञप्ति एवं नवीनतम समाचार
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Latest Maritime News & Operational Bulletins
            </h2>
            <div className="w-12 h-1 bg-[#006837] rounded-full mt-1.5" />
          </div>

          {/* Press Category Filters */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'Operations', 'National', 'Environmental'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setPressFilter(cat)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  pressFilter === cat ? 'bg-[#006837] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Releases' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article Card (2-column layout matching screenshot) */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left Image Column */}
            <div className="md:col-span-5 relative min-h-[240px] md:min-h-[290px] overflow-hidden group">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-[#006837] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                FEATURED DISPATCH
              </div>
            </div>

            {/* Right Text Content Column */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Timestamp */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium mb-2.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{featuredArticle.timeAgo}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="text-base sm:text-lg lg:text-xl font-serif font-bold text-slate-900 hover:text-[#006837] transition-colors leading-snug cursor-pointer line-clamp-2"
                >
                  {featuredArticle.title}
                </h3>

                {/* Excerpt Paragraph */}
                <p className="mt-3 text-xs sm:text-[13px] text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              {/* Read More Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="text-xs sm:text-sm font-bold text-[#006837] hover:text-[#004e29] flex items-center space-x-1 transition-colors cursor-pointer group"
                >
                  <span>Read Full Dispatch</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Official dispatch link copied to clipboard.');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  title="Share Dispatch"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 News Grid Cards Below (Matching screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              onClick={() => setSelectedArticle(news)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col group"
            >
              {/* Card Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium font-mono">
                  <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                    {news.category}
                  </span>
                  <span>{news.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 group-hover:text-[#006837] transition-colors line-clamp-3 leading-snug">
                  {news.title}
                </h4>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-[#006837] font-bold flex items-center space-x-1">
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                  <span className="text-slate-400 font-mono">{news.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: MARITIME INDIA VISION 2030 (Matching screenshot carousel with Red Emblem Badges) */}
      <section className="bg-slate-50/70 border-t border-b border-slate-200/80 py-16 px-4 sm:px-8">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#006837] uppercase tracking-wider font-mono">
                सागर पहल एवं अंतर्राष्ट्रीय सहयोग
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Maritime India Vision 2030 & Global Ocean Cooperation
              </h2>
              <div className="w-12 h-1 bg-[#006837] rounded-full mt-1.5" />
            </div>
          </div>

          {/* Cards Row (3 Cards with Red Circular Emblem Badges) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nationalInitiatives.map((release) => (
              <div
                key={release.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Red Circular Emblem Badge (Exact match to screenshot) */}
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white mb-4 shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </div>

                  {/* Badge Label */}
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                    {release.badge}
                  </div>

                  {/* Title Headline */}
                  <h4 className="mt-2 text-sm sm:text-[15px] font-serif font-bold text-slate-900 leading-snug line-clamp-3">
                    {release.title}
                  </h4>
                </div>

                {/* Read More Link */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() =>
                      setSelectedArticle({
                        id: release.id,
                        title: release.title,
                        category: release.badge,
                        date: release.date,
                        image: '/portal/news_delegation.jpg',
                        excerpt: release.excerpt,
                        content: release.content,
                      })
                    }
                    className="text-xs font-bold text-[#006837] hover:text-[#004e29] flex items-center space-x-1 cursor-pointer group"
                  >
                    <span>Read Release</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls Matching Screenshot: Dots + Green Circle Arrow Button on Right */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1 flex justify-center items-center space-x-2">
              <button
                onClick={() => setActiveAseanPage(0)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAseanPage === 0 ? 'bg-[#006837] w-6' : 'border border-[#006837] bg-transparent'
                }`}
                title="Page 1"
              />
              <button
                onClick={() => setActiveAseanPage(1)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAseanPage === 1 ? 'bg-[#006837] w-6' : 'border border-[#006837] bg-transparent'
                }`}
                title="Page 2"
              />
              <button
                onClick={() => setActiveAseanPage(2)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAseanPage === 2 ? 'bg-[#006837] w-6' : 'border border-[#006837] bg-transparent'
                }`}
                title="Page 3"
              />
            </div>

            {/* Circular Green Arrow Button on Right */}
            <button
              onClick={() => setActiveAseanPage((prev) => (prev + 1) % 3)}
              className="w-10 h-10 rounded-full bg-[#006837] hover:bg-[#00522c] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DEDICATED SECTION: PROFILE / PROFIL (#profile) */}
      {/* ========================================================================= */}
      <section id="profile" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#006837] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>भारतीय तटरक्षक • OFFICIAL AGENCY PROFILE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Indian Coast Guard: Mandate, Strategic Domain & Defense Assets
            </h2>
            <div className="w-16 h-1 bg-[#006837] rounded-full mt-2" />
          </div>

          {/* Subtabs for Profile Section */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setProfileTab('vision')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'vision' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vision & Motto
            </button>
            <button
              onClick={() => setProfileTab('jurisdiction')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'jurisdiction' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jurisdiction & EEZ
            </button>
            <button
              onClick={() => setProfileTab('fleet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'fleet' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fleet & Air Wings
            </button>
          </div>
        </div>

        {profileTab === 'vision' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-gradient-to-br from-[#006837] via-[#044c26] to-[#01351b] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                <Shield className="w-64 h-64" />
              </div>
              <Award className="w-10 h-10 text-amber-300 mb-4" />
              <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1 font-mono">
                NATIONAL MOTTO & STATUTORY CREED
              </div>
              <h3 className="text-xl font-serif font-bold leading-relaxed text-white">
                &ldquo;वयम् रक्षामः&rdquo; (Vayam Rakshamah — We Protect) <br />
                <span className="text-sm font-sans font-normal text-emerald-100 block mt-2">
                  Safeguarding India&apos;s 7,516 km coastline and 2.37 million km² Exclusive Economic Zone (EEZ) with
                  uncompromising vigilance, pollution response readiness, and maritime sovereignty.
                </span>
              </h3>
              <div className="mt-6 pt-6 border-t border-emerald-400/30 flex items-center space-x-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Central Coordinating Authority for National Oil Spill Disaster Contingency Plan (NOS-DCP)</span>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#006837] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006837] flex items-center justify-center mb-3">
                  <Waves className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">Marine Ecological Defense</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Active monitoring of illegal bilge discharging, offshore drilling compliance at Mumbai High, and
                  preservation of sensitive coral reefs from toxic hydrocarbons.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#006837] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006837] flex items-center justify-center mb-3">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">Sea Lanes of Communication (SLOC)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vigilant surveillance along international transit corridors across the Arabian Sea, Gulf of Kutch, and
                  Bay of Bengal carrying over 100,000 tankers annually.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#006837] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006837] flex items-center justify-center mb-3">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">24x7 Search & Rescue (MRCC)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Maritime Rescue Coordination Centres in Mumbai, Chennai, and Port Blair maintaining uninterrupted
                  distress watch on 1554 and VHF Ch-16 with rapid airborne scramble.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#006837] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006837] flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">AI Satellite Telemetry Fusion</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Autonomous Sentinel-1 synthetic aperture radar (SAR) feature segmentation fused with AIS tracks and
                  Lagrangian hindcast advection engines.
                </p>
              </div>
            </div>
          </div>
        )}

        {profileTab === 'jurisdiction' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-serif font-extrabold text-[#006837] mb-1">7,516 km</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                Total Indian Coastline
              </div>
              <p className="text-[11px] text-slate-500">
                Spanning 9 coastal states and 4 union territories from Gujarat to the Andaman & Nicobar archipelago.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-serif font-extrabold text-[#006837] mb-1">2.37M km²</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                Exclusive Economic Zone (EEZ)
              </div>
              <p className="text-[11px] text-slate-500">
                Sovereign jurisdiction for resource exploration, environmental defense, and maritime law enforcement.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-serif font-extrabold text-[#006837] mb-1">100,000+</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                Annual Tanker Transits
              </div>
              <p className="text-[11px] text-slate-500">
                Crucial international energy transit lane through the Arabian Sea and Malacca chokepoint gateway.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-serif font-extrabold text-[#006837] mb-1">46 Stations</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                Coastal Radar Network Chain
              </div>
              <p className="text-[11px] text-slate-500">
                Continuous radar integration fused with electro-optic thermal sensors and AIS base receivers.
              </p>
            </div>
          </div>
        )}

        {profileTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Ship className="w-8 h-8 text-[#006837] mb-3" />
              <h4 className="font-serif font-bold text-slate-900 text-base mb-1">
                Pollution Control Vessels (PCVs)
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                *ICGS Samudra Prahari*, *Samudra Paheredar*, and *Samudra Pavak* equipped with high-capacity sweeping arms,
                disc skimmers (150 m³/h), ocean booms, and 500-tonne holding tanks.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                STATUS: 24/7 STANDBY AT MUMBAI & KOCHI
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Compass className="w-8 h-8 text-[#006837] mb-3" />
              <h4 className="font-serif font-bold text-slate-900 text-base mb-1">
                Dornier 228 Maritime Patrol Aircraft
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Equipped with 360° surveillance radar, Side-Looking Airborne Radar (SLAR), and Forward-Looking Infrared
                (FLIR) electro-optics for nocturnal slick detection.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                PATROL RANGE: 1,300 NAUTICAL MILES
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Anchor className="w-8 h-8 text-[#006837] mb-3" />
              <h4 className="font-serif font-bold text-slate-900 text-base mb-1">
                Fast Interceptor Craft & Offshore Patrol
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                High-speed waterjet interceptors capable of 45+ knots for rapid vessel boarding, ship inspection under
                MARPOL Annex I, and evidence collection.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                INTERCEPTION REACTION: &lt; 15 MINUTES
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 7. DEDICATED SECTION: GOVERNANCE / TATA KELOLA (#governance) */}
      {/* ========================================================================= */}
      <section id="governance" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#006837] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Building className="w-3.5 h-3.5" />
              <span>COMMAND STRUCTURE & OVERSIGHT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Command Hierarchy, Statutory Bodies & Legal Mandates
            </h2>
            <div className="w-16 h-1 bg-[#006837] rounded-full mt-2" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setGovernanceTab('leadership')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'leadership' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Executive Command
            </button>
            <button
              onClick={() => setGovernanceTab('committees')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'committees' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Statutory Bodies
            </button>
            <button
              onClick={() => setGovernanceTab('mandate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'mandate' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Legal Framework
            </button>
          </div>
        </div>

        {governanceTab === 'leadership' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leader 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/portal/featured_leader.jpg"
                  alt="Director General Indian Coast Guard"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-3 left-3 bg-[#006837] text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  APEX COMMAND
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1 font-mono">
                  Director General Indian Coast Guard
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base mb-2">Director General, PTM, TM</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Apex executive authority commanding all operational regional headquarters, strategic policy formulation
                  with the Ministry of Defence, and national oil spill readiness coordination.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Coast Guard HQ, New Delhi</span>
                  <span className="text-[#006837] font-semibold">Active Command</span>
                </div>
              </div>
            </div>

            {/* Leader 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/portal/news_delegation.jpg"
                  alt="Commander Coast Guard Region West"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  REGIONAL TACTICAL COMMAND
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1 font-mono">
                  Commander Regional HQ (West), Mumbai
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base mb-2">Inspector General, TM</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Operational commander overseeing Arabian Sea maritime zones, Mumbai High Sector MH-4 offshore oil
                  fields, MRCC Mumbai search and rescue desks, and pollution response teams.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Worli Sea Face, Mumbai</span>
                  <span className="text-blue-700 font-semibold">Tactical Watch Active</span>
                </div>
              </div>
            </div>

            {/* Leader 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/portal/news_award.jpg"
                  alt="Directorate of Marine Environment Protection - Indian Coast Guard PRT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  ENVIRONMENT & LEGAL COMPLIANCE
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1 font-mono">
                  Chief of Marine Environment Protection (DMEP)
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base mb-2">Deputy Director General (MEP)</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Directs national pollution response capacity, manages the NOS-DCP inventory database, and oversees legal
                  dossier compilation for prosecution under the Merchant Shipping Act.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Directorate of Fisheries & MEP</span>
                  <span className="text-amber-700 font-semibold">Operational</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {governanceTab === 'committees' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#006837] px-2 py-0.5 rounded font-mono">
                  APEX STATUTORY COMMITTEE
                </span>
                <h4 className="text-base font-serif font-bold text-slate-900 mt-1">
                  National Oil Spill Disaster Contingency Plan (NOS-DCP) Apex Supervisory Board
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Inter-ministerial supervisory board bringing together the Ministry of Defence, Ministry of Petroleum &
                  Natural Gas (MoPNG), Ministry of Ports, Shipping and Waterways, and INCOIS to coordinate nationwide
                  Tier-1, Tier-2, and Tier-3 pollution incidents.
                </p>
              </div>
              <button
                onClick={() => onLaunchWorkstation && onLaunchWorkstation()}
                className="bg-[#006837] hover:bg-[#00522c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                Launch Workstation
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                  STATUTORY PORT STATE CONTROL
                </span>
                <h4 className="text-base font-serif font-bold text-slate-900 mt-1">
                  Directorate General of Shipping Port State Control & MARPOL Adjudication Committee
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Conducts rigorous physical boarding inspections of oil tankers calling on Indian ports, auditing Oil
                  Record Books (Part I & II), IOPP Certificates, and verifying oily-water separator (OWS) sensor logs.
                </p>
              </div>
              <button
                onClick={() => onLaunchWorkstation && onLaunchWorkstation()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                View Audit Pipeline
              </button>
            </div>
          </div>
        )}

        {governanceTab === 'mandate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <FileCheck className="w-6 h-6 text-[#006837] mb-2" />
              <h4 className="font-serif font-bold text-slate-900 text-sm mb-1">
                The Coast Guard Act, 1978 (Act No. 30 of 1978)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Section 14 explicitly empowers the Coast Guard to take measures for preserving and protecting the marine
                environment and preventing and controlling marine pollution within the maritime zones of India.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <FileCheck className="w-6 h-6 text-[#006837] mb-2" />
              <h4 className="font-serif font-bold text-slate-900 text-sm mb-1">
                The Merchant Shipping Act, 1958 (Part XIA - Prevention of Pollution)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sections 356A through 356O prescribe mandatory criminal penalties, vessel detention powers, and unlimited civil
                liability for damages and cleanup expenses caused by unlawful oil discharge in Indian waters.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. DEDICATED SECTION: PUBLIC INFO (#public-info) */}
      {/* ========================================================================= */}
      <section id="public-info" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#006837] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Radio className="w-3.5 h-3.5" />
              <span>CITIZEN CHARTER & 24/7 HELPLINES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Emergency Hotlines, Safety Guidelines & Citizen Advisories
            </h2>
            <div className="w-16 h-1 bg-[#006837] rounded-full mt-2" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPublicInfoTab('hotlines')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'hotlines' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Emergency Hotlines
            </button>
            <button
              onClick={() => setPublicInfoTab('guidelines')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'guidelines' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Safety Guidelines
            </button>
            <button
              onClick={() => setPublicInfoTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'reports' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Official Publications
            </button>
          </div>
        </div>

        {publicInfoTab === 'hotlines' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200">
              <Phone className="w-8 h-8 text-rose-600 mb-3" />
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider font-mono">
                TOLL-FREE MARITIME EMERGENCY
              </div>
              <div className="text-2xl font-black text-rose-900 mt-1 mb-2 font-mono">1554</div>
              <p className="text-xs text-rose-800/80 leading-relaxed">
                National toll-free emergency helpline answered 24/7 across all coastal regions for distress, search and
                rescue, and vessel collisions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <Radio className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                VHF MARINE DISTRESS CHANNEL
              </div>
              <div className="text-2xl font-black text-blue-900 mt-1 mb-2 font-mono">CH-16 (156.8 MHz)</div>
              <p className="text-xs text-blue-800/80 leading-relaxed">
                International maritime distress, safety and calling frequency continuously monitored by all Coast Guard
                stations and vessels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
              <Mail className="w-8 h-8 text-emerald-600 mb-3" />
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                RAPID POLLUTION ALERT DESK
              </div>
              <div className="text-xl font-black text-emerald-900 mt-1 mb-2 font-mono">+91 22 2437 1554</div>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Dedicated WhatsApp and direct telephone channel to transmit GPS coordinates, photographic evidence, and
                sheen observations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
              <Shield className="w-8 h-8 text-amber-600 mb-3" />
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider font-mono">
                CPGRAMS CITIZEN GRIEVANCE
              </div>
              <div className="text-xl font-black text-amber-900 mt-1 mb-2 font-mono">1800-11-4000</div>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                Centralized Public Grievance Redress and Monitoring System for coastal transparency, licensing, and
                service feedback.
              </p>
            </div>
          </div>
        )}

        {publicInfoTab === 'guidelines' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006837] flex items-center justify-center font-bold mb-3 font-mono">
                1
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
                SOP for Reporting Coastal Oil Slicks
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log exact GPS coordinates on your boat plotter, note the approximate dimensions and appearance of the slick
                (silvery sheen / rainbow sheen / brown mousse), and transmit immediately to MRCC on Ch-16.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006837] flex items-center justify-center font-bold mb-3 font-mono">
                2
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
                Monsoon Fishing Ban & Cyclone Protocols
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict adherence to the 61-day uniform monsoon fishing ban along the West Coast (01 June to 31 July) and
                East Coast (15 April to 14 June) for ecological breeding regeneration.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006837] flex items-center justify-center font-bold mb-3 font-mono">
                3
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
                Merchant Bilgewater Discharge Standards
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discharge of oily mixture into Indian territorial waters is strictly prohibited unless passing through an
                approved 15 ppm bilge alarm and oil-filtering equipment while underway.
              </p>
            </div>
          </div>
        )}

        {publicInfoTab === 'reports' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#006837] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#006837]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">National Oil Spill Disaster Plan (NOS-DCP) Manual</div>
                  <div className="text-[10px] text-slate-500 font-mono">PDF • 8.4 MB • Certified National Standard</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#006837] cursor-pointer" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#006837] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#006837]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Annual Marine Environment Protection Review</div>
                  <div className="text-[10px] text-slate-500 font-mono">PDF • 5.1 MB • Ministry of Defence</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#006837] cursor-pointer" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#006837] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#006837]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Indian Coast Guard Citizen Charter 2026</div>
                  <div className="text-[10px] text-slate-500 font-mono">PDF • 1.6 MB • Public Disclosures</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#006837] cursor-pointer" />
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 9. DEDICATED SECTION: ANNOUNCEMENTS / NOTICES (#announcements) */}
      {/* ========================================================================= */}
      <section id="announcements" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#006837] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>OFFICIAL NOTICES & WARNINGS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Official Announcements & NAVAREA VIII Warnings
            </h2>
            <div className="w-16 h-1 bg-[#006837] rounded-full mt-2" />
          </div>

          {/* Announcement Category Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'NAVAREA', 'Tender', 'Advisory'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setAnnouncementFilter(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  announcementFilter === cat ? 'bg-[#006837] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List Cards */}
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnouncement(ann)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                ann.urgent
                  ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                  : 'bg-white border-slate-200 hover:border-[#006837] hover:shadow-xs'
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2 font-mono">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ann.urgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {ann.refNo}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{ann.date}</span>
                  {ann.deadline && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded">
                      {ann.deadline}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base hover:text-[#006837] transition-colors leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.excerpt}</p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button className="text-xs font-bold text-[#006837] hover:text-[#004e29] flex items-center space-x-1 group">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. DEDICATED SECTION: RIGHT TO INFORMATION ACT (#rti-request) */}
      {/* ========================================================================= */}
      <section id="rti-request" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#006837] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <FileCheck className="w-3.5 h-3.5" />
              <span>RIGHT TO INFORMATION ACT, 2005</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Public Information Portal & Real-Time RTI Filing System
            </h2>
            <div className="w-16 h-1 bg-[#006837] rounded-full mt-2" />
          </div>

          {/* RTI Subtabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveRtiTab('submit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'submit' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submit Request
            </button>
            <button
              onClick={() => setActiveRtiTab('track')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'track' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Track Status
            </button>
            <button
              onClick={() => setActiveRtiTab('pio')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'pio' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CPIO Contacts
            </button>
            <button
              onClick={() => setActiveRtiTab('proactive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'proactive' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section 4(1)(b)
            </button>
          </div>
        </div>

        {activeRtiTab === 'submit' && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="max-w-2xl mb-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">
                Online Filing of Information Request (RTI Act 2005)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under the Right to Information Act, 2005, any citizen of India may request information from the Indian
                Coast Guard. Applications are processed transparently and dispatched within statutory time limits.
              </p>
            </div>

            {rtiSubmittedId ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-[#006837] mx-auto mb-3" />
                <h4 className="text-base font-serif font-bold text-emerald-950 mb-1">
                  RTI Application Successfully Registered with Central PIO!
                </h4>
                <p className="text-xs text-emerald-800 mb-3">
                  Your Official Tracking Registration ID:{' '}
                  <span className="font-mono font-extrabold text-sm text-[#006837] bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {rtiSubmittedId}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 max-w-md mx-auto mb-4">
                  An official acknowledgement receipt has been dispatched to your email address. Normal response window is
                  within 30 days under Section 7(1).
                </p>
                <button
                  onClick={() => {
                    setTrackingInput(rtiSubmittedId);
                    setActiveRtiTab('track');
                    handleTrackQuery();
                  }}
                  className="bg-[#006837] hover:bg-[#00522c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Track Application Status ↗
                </button>
              </div>
            ) : (
              <form onSubmit={handleRtiSubmit} className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name of Applicant (as per Aadhaar / Official ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={rtiForm.name}
                      onChange={(e) => setRtiForm({ ...rtiForm, name: e.target.value })}
                      placeholder="e.g. Lt. Cdr. Rajesh Verma / Anita Deshmukh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Active Email Address *</label>
                    <input
                      type="email"
                      required
                      value={rtiForm.email}
                      onChange={(e) => setRtiForm({ ...rtiForm, email: e.target.value })}
                      placeholder="name@domain.gov.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={rtiForm.phone}
                      onChange={(e) => setRtiForm({ ...rtiForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Category</label>
                    <select
                      value={rtiForm.category}
                      onChange={(e) => setRtiForm({ ...rtiForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none bg-white"
                    >
                      <option value="Citizen of India">Citizen of India</option>
                      <option value="Academic / Research">Academic / Marine Research Scholar</option>
                      <option value="Media Representative">Media / Environmental Journalist</option>
                      <option value="Maritime Industry">Maritime Industry / Port Seafarer</option>
                      <option value="NGO / Ecology">Non-Governmental Environmental Body</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details of Information / Records Requested *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rtiForm.query}
                    onChange={(e) => setRtiForm({ ...rtiForm, query: e.target.value })}
                    placeholder="Specify the exact subject matter, date range, or environmental incident log requested (e.g. Statistical records of oil spill interdictions and penalties levied in Arabian Sea Sector MH-4 between Jan - Sep 2026)."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Statutory application fee: ₹10 (Exempt for BPL card holders).
                  </span>
                  <button
                    type="submit"
                    className="bg-[#006837] hover:bg-[#00522c] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit RTI Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeRtiTab === 'track' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Track RTI Application Status Online</h3>
            <p className="text-xs text-slate-600 mb-6">
              Enter the Registration Number issued upon electronic filing (e.g., RTI/ICG/2026/08492).
            </p>

            <div className="flex gap-2 max-w-md mb-8">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="RTI/ICG/2026/08492"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-[#006837]"
              />
              <button
                onClick={handleTrackQuery}
                className="bg-[#006837] hover:bg-[#00522c] text-white px-5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Track Status
              </button>
            </div>

            {trackingResult && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <span className="text-xs text-slate-500">Tracking Reference:</span>
                    <span className="ml-2 font-mono font-bold text-sm text-[#006837]">{trackingResult.id}</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full font-mono">
                    {trackingResult.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
                  <div>
                    <span className="text-slate-400 block font-mono">Filing Date:</span>
                    <span className="font-bold text-slate-800">{trackingResult.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono">Assigned CPIO:</span>
                    <span className="font-bold text-slate-800">{trackingResult.officer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono">Statutory Target:</span>
                    <span className="font-bold text-slate-800">{trackingResult.estimatedCompletion}</span>
                  </div>
                </div>

                {trackingResult.timeline && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-800 mb-2 font-mono">
                      Statutory Progress Milestone History:
                    </div>
                    {trackingResult.timeline.map((item: any, i: number) => (
                      <div key={i} className="flex items-center space-x-3 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            item.done ? 'bg-[#006837] text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.done ? '✓' : i + 1}
                        </div>
                        <div className="flex-1 flex justify-between">
                          <span className={item.done ? 'font-bold text-slate-900' : 'text-slate-500'}>
                            {item.title}
                          </span>
                          <span className="text-slate-400 text-[11px] font-mono">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeRtiTab === 'pio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 font-mono">
                FIRST APPELLATE AUTHORITY (FAA)
              </div>
              <h4 className="text-base font-serif font-bold text-slate-900 mb-2">
                Inspector General (Operations & MEP), Coast Guard Headquarters
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Designated First Appellate Authority for hearing appeals against orders passed by Central Public
                Information Officers under Section 19(1) of the RTI Act.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#006837]" />
                  <span>Coast Guard Headquarters, National Stadium Complex, New Delhi 110001</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#006837]" />
                  <span>faa-icg@indiancoastguard.nic.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#006837]" />
                  <span>+91-11-2338-4934</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1 font-mono">
                CENTRAL PUBLIC INFORMATION OFFICER (CPIO - WEST)
              </div>
              <h4 className="text-base font-serif font-bold text-slate-900 mb-2">
                Command Legal Officer, Coast Guard Regional HQ (West)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Assigned CPIO for marine pollution incidents, vessel tracking records, and NOS-DCP deployments in the
                Arabian Sea jurisdiction.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>Regional HQ (West), Worli Sea Face, Mumbai 400030</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>cpio-west@indiancoastguard.nic.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span>+91-22-2437-1554</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeRtiTab === 'proactive' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Section 4(1)(b)(i): Particulars of Organization, Functions and Duties
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Statutory ICG Charter & NOS-DCP Mandate</div>
              </div>
              <Download className="w-4 h-4 text-[#006837] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Section 4(1)(b)(ii): Powers and Duties of Officers and Employees
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Powers under Coast Guard Act & Merchant Shipping Act</div>
              </div>
              <Download className="w-4 h-4 text-[#006837] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Section 4(1)(b)(xi): Annual Budget Allocation & Expenditure Statement
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Audited by Comptroller and Auditor General (CAG)</div>
              </div>
              <Download className="w-4 h-4 text-[#006837] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Section 4(1)(b)(xii): Execution of Subsidy Programs (DAT Transponders)
                </div>
                <div className="text-[10px] text-slate-500 font-mono">List of beneficiaries and coastal fishermen cooperatives</div>
              </div>
              <Download className="w-4 h-4 text-[#006837] cursor-pointer flex-shrink-0" />
            </div>
          </div>
        )}
      </section>

      {/* 11. EMERALD GREEN FOOTER: OFFICIAL PORTAL // INDIAN COAST GUARD (GOVERNMENT OF INDIA) */}
      <footer className="bg-[#006837] text-white pt-12 pb-8 px-4 sm:px-8">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {/* Top Title with National Emblem & Coast Guard Crest */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/20">
            <div className="flex items-center space-x-3.5">
              <StateEmblemIndia size="md" variant="white" className="filter drop-shadow-md" />
              <IndianCoastGuardInsignia size="md" variant="color" className="filter drop-shadow-md" />
              <div>
                <h3 className="font-serif font-black text-white text-base sm:text-lg tracking-wider uppercase">
                  OFFICIAL PORTAL // INDIAN COAST GUARD (BHARATIYA TATRAKSHAK)
                </h3>
                <p className="text-[11px] text-emerald-100 font-medium tracking-wide">
                  Ministry of Defence, Government of India • Maritime Rescue Coordination Centre (MRCC) Mumbai
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono bg-emerald-950/60 border border-emerald-400/30 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>MRCC MUMBAI // SECTOR MH-4 LIVE WATCH</span>
            </div>
          </div>

          {/* 4 Information Columns (Exact match to screenshot structure, converted to India) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-xs text-emerald-50">
            {/* Column 1: Headquarters Address */}
            <div>
              <div className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-200" />
                <span>Headquarters Address</span>
              </div>
              <p className="leading-relaxed text-emerald-100/90 text-[11.5px]">
                Coast Guard Regional Headquarters (West), Worli Sea Face, Mumbai 400030, Maharashtra, India.
              </p>
              <p className="leading-relaxed text-emerald-100/80 text-[11px] mt-2">
                Apex HQ: National Stadium Complex, New Delhi 110001.
              </p>
            </div>

            {/* Column 2: Official Contact & Email */}
            <div>
              <div className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-200" />
                <span>Official Contact & Email</span>
              </div>
              <a
                href="mailto:mrcc-mumbai@indiancoastguard.nic.in"
                className="text-emerald-100 hover:text-white hover:underline transition-colors block text-[11.5px] font-mono"
              >
                mrcc-mumbai@indiancoastguard.nic.in
              </a>
              <a
                href="mailto:dme-cg@indiancoastguard.nic.in"
                className="text-emerald-100/80 hover:text-white hover:underline transition-colors block mt-1 text-[11.5px] font-mono"
              >
                dme-cg@indiancoastguard.nic.in
              </a>
              <div className="mt-2 text-[11px] text-emerald-200 font-mono">
                Toll-Free Helpline: 1554
              </div>
            </div>

            {/* Column 3: Social Media */}
            <div>
              <div className="text-white font-bold text-sm mb-3">Official Media Handles</div>
              <div className="flex items-center space-x-3">
                <a
                  href="https://twitter.com/IndiaCoastGuard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold"
                  title="Twitter / X (@IndiaCoastGuard)"
                >
                  𝕏
                </a>
                <a
                  href="https://facebook.com/IndiaCoastGuard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold"
                  title="Facebook"
                >
                  f
                </a>
                <a
                  href="https://instagram.com/indiancoastguard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs"
                  title="Instagram"
                >
                  📷
                </a>
              </div>
              <p className="text-[10.5px] text-emerald-200 mt-2 font-mono">
                Verified: @IndiaCoastGuard
              </p>
            </div>

            {/* Column 4: Visit Statistics matching screenshot */}
            <div>
              <div className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-200" />
                <span>Visitor Statistics</span>
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-emerald-100 font-mono">
                <li className="flex items-center justify-between">
                  <span>1,180 visitors today</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>16,448 visitors this month</span>
                </li>
                <li className="flex items-center justify-between font-bold text-white">
                  <span>3,665,382 total hits</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-6 border-t border-white/20 text-center text-[11px] text-emerald-100/80 flex flex-col sm:flex-row items-center justify-between gap-2 font-sans">
            <span>Copyright © 2026 Indian Coast Guard, Ministry of Defence, Government of India. All Rights Reserved.</span>
            <div className="flex items-center space-x-4 text-[10.5px] font-semibold">
              <button
                type="button"
                onClick={() => scrollToSection('profile')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('governance')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Governance
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('public-info')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Public Info
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('announcements')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Announcements
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('rti-request')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                RTI Request
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                className="hover:underline text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="w-full h-screen bg-slate-900 flex flex-col overflow-y-auto scroll-smooth"
    >
      {/* Real-time Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-amber-400 to-[#138808] z-[60] transition-all duration-150 pointer-events-none"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Top Behance Showcase Presentation Bar (From user's uploaded screenshot) */}
      <header className="sticky top-0 z-50 bg-[#0B1B2B]/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none font-sans">
        {/* Creator Profile / Brand from uploaded Behance shot */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-amber-300">
              ICG
            </div>
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-slate-100 flex items-center space-x-1.5">
              <span>National Maritime Intelligence Portal</span>
              <span className="bg-[#006837]/30 text-emerald-300 border border-[#006837]/60 text-[9px] px-1.5 py-0.2 rounded font-mono">
                Official GOI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Indian Coast Guard • Ministry of Defence • Government of India
            </div>
          </div>
        </div>

        {/* View Mode & Quick Launch Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Toggle between Showcase Frame (like screenshot) and Full Web View */}
          <div className="bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 flex items-center text-[11px]">
            <button
              onClick={() => setViewMode('showcase')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'showcase'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🖼️ Showcase Frame
            </button>
            <button
              onClick={() => setViewMode('fullscreen')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'fullscreen'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Fullscreen Web
            </button>
          </div>

          {/* Tactical Workstation Quick Launch */}
          {onLaunchWorkstation && (
            <button
              onClick={onLaunchWorkstation}
              className="bg-[#006837] hover:bg-[#00522c] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Launch Workstation</span>
            </button>
          )}

          {/* Like & Bookmark Icons matching screenshot */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Like Design"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Officer Login pill button matching screenshot position */}
          <button
            onClick={() => {
              if (onOpenLogin) onOpenLogin();
              else if (onLaunchWorkstation) onLaunchWorkstation();
            }}
            className="bg-[#0B132B] hover:bg-[#1C2541] text-white border border-slate-700 px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Officer Login</span>
          </button>
        </div>
      </header>

      {/* Main Container: If Showcase mode, render in warm gradient backdrop like uploaded screenshot */}
      {viewMode === 'showcase' ? (
        <div className="flex-1 w-full bg-gradient-to-tr from-[#EA580C] via-[#CA8A04] to-[#006837] p-3 sm:p-8 lg:p-12 flex flex-col items-center">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-white/40 ring-1 ring-black/10">
            {PortalContent}
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full bg-white">{PortalContent}</div>
      )}

      {/* Floating Quick-Scroll Dock: Seamless top-to-bottom navigation anywhere */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-2 select-none">
        {/* Quick Section Jump Pill Bar */}
        <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 hidden sm:flex items-center space-x-1 text-[11px] font-sans">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border-r border-slate-700">
            {Math.round(scrollProgress)}%
          </span>
          {onLaunchSagarMitra && (
            <button
              type="button"
              onClick={onLaunchSagarMitra}
              className="px-2.5 py-1 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 hover:text-white transition-all border border-cyan-500/40 flex items-center space-x-1 cursor-pointer font-bold"
              title="Open Sagar Mitra AI Assistant"
            >
              <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
              <span>✦ Sagar Mitra</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollToSection('berita')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            News
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('profile')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('governance')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Governance
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('public-info')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Hotlines
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('announcements')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Notices
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('rti-request')}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            RTI
          </button>
        </div>

        {/* Scroll To Top & Scroll To Bottom Quick Buttons */}
        <div className="flex items-center space-x-2">
          {showScrollTop && (
            <button
              type="button"
              onClick={scrollToTop}
              className="bg-[#006837] hover:bg-[#00522c] text-white p-3 rounded-full shadow-lg border border-emerald-400/40 transition-all hover:scale-110 flex items-center justify-center cursor-pointer group"
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={scrollToBottom}
            className="bg-slate-800/90 hover:bg-slate-900 text-white p-3 rounded-full shadow-lg border border-slate-700 backdrop-blur-md transition-all hover:scale-110 flex items-center justify-center cursor-pointer group"
            title="Scroll to Bottom"
          >
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Read More Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="relative h-60 w-full overflow-hidden rounded-t-2xl">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 bg-[#006837] text-white text-xs font-bold px-2.5 py-1 rounded font-mono">
                {selectedArticle.category}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedArticle.date}</span>
                {selectedArticle.timeAgo && <span>• {selectedArticle.timeAgo}</span>}
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-4 leading-snug">
                {selectedArticle.title}
              </h2>

              <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedArticle.excerpt}
              </p>

              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                <p>{selectedArticle.content}</p>
                <p>
                  This system integrates seamlessly with the Indian Coast Guard National Maritime Command & Tactical
                  Intelligence Workstation for vessel trajectory reconstruction, satellite radar attribution, and MARPOL
                  compliance auditing.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                {onLaunchWorkstation && (
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      onLaunchWorkstation();
                    }}
                    className="bg-[#006837] hover:bg-[#00522c] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Open Tactical Workstation</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedAnnouncement.refNo}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">{selectedAnnouncement.title}</h3>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-mono">
              <span>Issue Date: {selectedAnnouncement.date}</span>
              {selectedAnnouncement.deadline && <span>• {selectedAnnouncement.deadline}</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedAnnouncement.details}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  alert('Downloading official certified circular / tender document (PDF)...');
                }}
                className="bg-[#006837] hover:bg-[#00522c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified PDF</span>
              </button>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
