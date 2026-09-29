import React, { useState } from 'react';
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
  Filter,
} from 'lucide-react';

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
  onLaunchHero?: () => void;
  onOpenLogin?: () => void;
}

export const BantenGovPortalView: React.FC<BantenGovPortalViewProps> = ({
  onLaunchWorkstation,
  onLaunchHero,
  onOpenLogin,
}) => {
  // Mode: showcase frame (with warm gradient canvas as uploaded) vs fullscreen browser mode
  const [viewMode, setViewMode] = useState<'showcase' | 'fullscreen'>('showcase');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [activeAseanPage, setActiveAseanPage] = useState<number>(0);
  const [edition, setEdition] = useState<'banten' | 'maritime'>('banten');

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
    category: 'Citizen',
    query: '',
  });
  const [rtiSubmittedId, setRtiSubmittedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('RTI/2026/08492');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [activeRtiTab, setActiveRtiTab] = useState<'submit' | 'track' | 'pio' | 'proactive'>('submit');

  // Press Release Category Filter
  const [pressFilter, setPressFilter] = useState<'ALL' | 'Pemerintahan' | 'Nasional' | 'Prestasi'>('ALL');

  // Directory quick links matching uploaded screenshot
  const directoryLinks = [
    {
      id: 'semua',
      title: edition === 'banten' ? 'Semua' : 'All Services',
      category: 'all',
      action: () => onLaunchWorkstation && onLaunchWorkstation(),
    },
    {
      id: 'lembaga_teknis',
      title: edition === 'banten' ? 'Lembaga Teknis Daerah' : 'Regional Technical Agency',
      category: 'agency',
      action: () => {
        const el = document.getElementById('profile');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'sekretariat_daerah',
      title: edition === 'banten' ? 'Sekretariat Daerah' : 'Regional Secretariat (SETDA)',
      category: 'gov',
      action: () => {
        const el = document.getElementById('governance');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'layanan_publik',
      title: edition === 'banten' ? 'Website Layanan Publik' : 'Public Service Portal',
      category: 'public',
      action: () => {
        const el = document.getElementById('public-info');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'satpol_pp',
      title: edition === 'banten' ? 'Satuan Polisi Pamong Praja' : 'Coastal Security & Marine Police',
      category: 'security',
      action: () => {
        const el = document.getElementById('announcements');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'dinas_daerah',
      title: edition === 'banten' ? 'Dinas Daerah' : 'Department of Marine & Environment',
      category: 'dept',
      action: () => {
        const el = document.getElementById('governance');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'aplikasi_publik',
      title: edition === 'banten' ? 'Aplikasi Publik dan Tata Kelola Pemerintah' : 'Tactical Workstation & AIS Analytics',
      category: 'apps',
      highlight: true,
      action: () => onLaunchWorkstation && onLaunchWorkstation(),
    },
    {
      id: 'sekretariat_dprd',
      title: edition === 'banten' ? 'Sekretariat DPRD' : 'Regional Maritime Advisory Board',
      category: 'dprd',
      action: () => {
        const el = document.getElementById('rti-request');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  // News items matching uploaded screenshot
  const featuredArticle: ArticleItem = {
    id: 'featured-1',
    title:
      edition === 'banten'
        ? "Pj Gubernur Banten Al Muktabar Sambut Kedatangan Wapres KH Ma'ruf Amin di Ponpes An Nawawi Tanara"
        : 'State Leadership & Coast Guard Commander Inaugurate Advanced Maritime Surveillance Hub',
    category: 'Berita Terkini',
    timeAgo: '5 hours ago',
    date: '9 September 2026',
    image: '/portal/featured_leader.jpg',
    excerpt:
      edition === 'banten'
        ? "Penjabat (Pj) Gubernur Banten Al Muktabar menyambut kedatangan Wakil Presiden Republik Indonesia KH Ma'ruf Amin di Pondok Pesantren An Nawawi Tanara, Kabupaten Serang, Banten (9/9/2026). Pada kesempatan itu, Al Muktabar sampaikan pembangunan di Provinsi Banten sekaligus mendapatkan arahan dari Wapres KH Ma'ruf Amin."
        : 'The Executive Leadership alongside maritime security command reviewed live Sentinel-1 synthetic aperture radar feeds, automated oil spill attribution matrices, and integrated coastal protection workflows for regional waters.',
    content:
      edition === 'banten'
        ? "Serang - Penjabat (Pj) Gubernur Banten Al Muktabar mendampingi agenda kerja Wakil Presiden RI KH Ma'ruf Amin dalam peresmian sentra digital informasi dan koordinasi pelayanan terpadu. Pemerintah Provinsi Banten terus memacu transformasi digital pelayanan publik, penguatan konektivitas maritim, serta transparansi tata kelola demi percepatan kesejahteraan masyarakat Banten secara menyeluruh."
        : 'A joint review was convened on automated vessel tracking, Lagrangian drift simulation, and inter-agency maritime compliance.',
  };

  const newsCards: ArticleItem[] = [
    {
      id: 'news-1',
      title:
        edition === 'banten'
          ? 'Pj Gubernur Banten Al Muktabar Luncurkan TeDeSS, Situs Diskon Belanja Untuk Pembayar Pajak Kendaraan Bermotor'
          : 'Launch of Integrated Automated Coastal Monitoring and Maritime Compliance Platform',
      category: 'Pemerintahan',
      date: '9 September 2026',
      image: '/portal/news_launch.jpg',
      excerpt:
        'Inovasi digital terbaru untuk mempermudah akses layanan publik dan memberikan apresiasi nyata kepada seluruh wajib pajak.',
      content:
        'Pemerintah Provinsi Banten secara resmi meluncurkan platform digital terpadu untuk efisiensi pelayanan administrasi dan transparansi publik.',
    },
    {
      id: 'news-2',
      title:
        edition === 'banten'
          ? 'Pj Gubernur Al Muktabar Turut Antar Keberangkatan Presiden Joko Widodo ke India'
          : 'High-Level Maritime Delegation Departs for International Summit Cooperation',
      category: 'Nasional',
      date: '8 September 2026',
      image: '/portal/news_delegation.jpg',
      excerpt:
        'Pj Gubernur Banten turut serta dalam rangkaian pelepasan delegasi kenegaraan dalam rangka KTT internasional.',
      content:
        'Delegasi kenegaraan bertolak untuk menghadiri rangkaian pertemuan strategis bilateral dan multilateral dalam penguatan ketahanan regional.',
    },
    {
      id: 'news-3',
      title:
        edition === 'banten'
          ? 'Pemprov Banten Raih Penghargaan 5 Besar Peningkatan Indeks Pembangunan Pemuda'
          : 'Provincial Maritime Safety Board Recognized in Top 5 National Environmental Excellence',
      category: 'Prestasi',
      date: '8 September 2026',
      image: '/portal/news_award.jpg',
      excerpt:
        'Apresiasi tinggi atas capaian signifikan Provinsi Banten dalam peningkatan daya saing dan pembangunan sumber daya unggul.',
      content:
        'Penghargaan nasional diserahkan atas keberhasilan implementasi program strategis berbasis teknologi informasi dan tata kelola modern.',
    },
  ];

  // Announcements List
  const announcementsList: AnnouncementItem[] = [
    {
      id: 'ann-1',
      refNo: 'NAVAREA-VIII/0482/26',
      title:
        edition === 'banten'
          ? 'Peringatan Dini Navigasi: Prakiraan Gelombang Tinggi & Angin Kencang di Selat Sunda Bagian Selatan'
          : 'NAVAREA VIII Warning: Oceanographic Drift Locus & High Wind Advisory (Sector MH-4)',
      category: 'NAVAREA',
      date: '28 September 2026',
      deadline: 'Berlaku s/d 04 Okt 2026',
      urgent: true,
      excerpt:
        'Seluruh nakhoda kapal niaga, nelayan tradisional, dan armada patroli dihimbau mewaspadai potensi gelombang 2.5 - 4.0 meter.',
      details:
        'Berdasarkan pemantauan satelit oseanografi dan stasiun radar pantai, terpantau sistem tekanan rendah yang memicu peningkatan kecepatan angin barat daya hingga 28 knot. Dihimbau tidak melakukan lego jangkar pada koridor alur pelayaran utama.',
    },
    {
      id: 'ann-2',
      refNo: 'TND/ENV/ICG/2026/094',
      title:
        edition === 'banten'
          ? 'Pengumuman Tender Terbuka: Pengadaan Perangkat Sensor Pemantau Kualitas Air Pesisir Otomatis'
          : 'Open Tender: Supply & Integration of Airborne Hyperspectral Marine Pollution Sensors',
      category: 'Tender',
      date: '26 September 2026',
      deadline: 'Batas Pendaftaran: 15 Okt 2026',
      excerpt:
        'Pemerintah Provinsi mengundang penyedia jasa teknologi bersertifikasi untuk berpartisipasi dalam e-procurement.',
      details:
        'Paket pengadaan mencakup 12 unit sensor buoy telemetri dan sistem integrasi data berbasis IoT dengan stasiun darat pusat komando.',
    },
    {
      id: 'ann-3',
      refNo: 'ADV/SAR/2026/019',
      title:
        edition === 'banten'
          ? 'Sosialisasi Keselamatan Berlayar & Pemasangan Transponder AIS Gratis Bagi Nelayan Tradisional'
          : 'Fishermen Safety Drive: Distribution & Calibration of NavIC Emergency Distress Beacons',
      category: 'Advisory',
      date: '24 September 2026',
      deadline: 'Pelaksanaan: 01 - 10 Okt 2026',
      excerpt:
        'Program bantuan terintegrasi dalam rangka meminimalisasi risiko kecelakaan laut dan mempermudah evakuasi darurat.',
      details:
        'Dinas Kelautan dan Badan Penyelamatan memberikan pelatihan gratis mengenai penggunaan alat komunikasi maritim dan penanganan pertama darurat di laut bagi perwakilan koperasi nelayan.',
    },
  ];

  // ASEAN Indonesia 2023 Cards matching screenshot
  const aseanReleases: MediaReleaseItem[] = [
    {
      id: 'asean-1',
      badge: 'Rilis Media',
      title:
        edition === 'banten'
          ? 'Saatnya generasi muda ASEAN ambil peran strategis'
          : 'Youth Innovators Take Strategic Leadership in Blue Economy & Ocean AI',
      date: '10 September 2026',
      excerpt:
        'Generasi muda memegang peranan krusial sebagai katalisator inovasi teknologi digital, keberlanjutan maritim, dan integrasi ekonomi kawasan.',
      content:
        'Pertemuan pemuda tingkat ASEAN menyepakati roadmap kolaborasi pemanfaatan teknologi kecerdasan buatan dalam pemantauan lingkungan maritim.',
    },
    {
      id: 'asean-2',
      badge: 'Rilis Media',
      title:
        edition === 'banten'
          ? 'Kesenik Indonesia curi perhatian Delegasi KTT ASEAN'
          : 'Regional Ocean Observation Network Commended by International Delegates',
      date: '9 September 2026',
      excerpt:
        'Kekayaan warisan budaya nusantara dipadukan dengan kesiapan infrastruktur maritim modern memikat perhatian delegasi mancanegara.',
      content:
        'Para delegasi mengapresiasi keharmonisan kearifan lokal bahari dengan kecanggihan sistem mitigasi tumpahan minyak terpadu.',
    },
    {
      id: 'asean-3',
      badge: 'Rilis Media',
      title:
        edition === 'banten'
          ? 'CelebKRIAN Expo 2023, bukti konkret kolaborasi pelaku ekonomi kreatif ASEAN'
          : 'Maritime Technology Expo Showcases Concrete Regional Interoperability',
      date: '8 September 2026',
      excerpt:
        'Pameran akbar industri kreatif memperkuat sinergi lintas negara dalam mendorong pertumbuhan ekonomi berbasis kelautan dan kepemudaan.',
      content:
        'Ekshibisi teknologi dan ekonomi kelautan menghubungkan pemangku kebijakan maritim dengan platform AI pelacakan kapal internasional.',
    },
  ];

  const handleRtiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtiForm.name || !rtiForm.query) {
      alert('Silakan lengkapi nama dan rincian permohonan informasi.');
      return;
    }
    const generatedId = `RTI/ICG/2026/${Math.floor(10000 + Math.random() * 90000)}`;
    setRtiSubmittedId(generatedId);
    setTrackingResult({
      id: generatedId,
      name: rtiForm.name,
      status: 'Terdaftar & Diproses (Dalam Verifikasi PPID)',
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      estimatedCompletion: '10 Hari Kerja',
      officer: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Utama',
    });
  };

  const handleTrackQuery = () => {
    if (!trackingInput.trim()) return;
    setTrackingResult({
      id: trackingInput.toUpperCase(),
      name: 'Pemohon Publik Terverifikasi',
      status: 'Sedang Ditinjau Petugas PPID (Tahap Analisis Dokumen)',
      date: '28 September 2026',
      estimatedCompletion: '7 Hari Kerja Tersisa',
      officer: 'Sub Bagian Tata Usaha & Keterbukaan Publik',
      timeline: [
        { title: 'Permohonan Diterima Sistem', date: '28 Sept 2026, 09:14 WIB', done: true },
        { title: 'Verifikasi Identitas & Syarat', date: '28 Sept 2026, 14:30 WIB', done: true },
        { title: 'Penyiapan Informasi Teknis', date: '29 Sept 2026, 11:00 WIB', done: true },
        { title: 'Penyusunan Salinan & Pengesahan', date: 'Dalam Proses', done: false },
        { title: 'Pengiriman Jawaban Resmi', date: 'Estimasi 05 Okt 2026', done: false },
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
    <div className="w-full bg-white text-slate-800 font-sans selection:bg-[#008744] selection:text-white scroll-smooth">
      {/* 1. TOP PORTAL NAVIGATION BAR (Matching screenshot with smooth section anchors) */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          {/* Provincial Shield Emblem */}
          <div className="w-9 h-11 relative flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
              <path
                d="M50 0 C75 0 95 15 95 40 C95 85 50 115 50 115 C50 115 5 85 5 40 C5 15 25 0 50 0 Z"
                fill="#008744"
                stroke="#FFD700"
                strokeWidth="4"
              />
              <path d="M50 15 L78 35 L78 70 L50 95 L22 70 L22 35 Z" fill="#FFFFFF" opacity="0.9" />
              <circle cx="50" cy="50" r="18" fill="#FFB703" />
              <path d="M50 34 L54 44 L64 45 L56 52 L59 62 L50 56 L41 62 L44 52 L36 45 L46 44 Z" fill="#FFFFFF" />
              <path d="M30 75 Q50 65 70 75 Q50 82 30 75 Z" fill="#023E8A" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-slate-900 tracking-tight text-xs sm:text-sm uppercase font-serif">
              {edition === 'banten' ? 'Pemerintah Provinsi Banten' : 'Indian Coast Guard • Sagar Mitra'}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold tracking-wider uppercase">
              {edition === 'banten' ? 'Portal Resmi Terpadu' : 'Maritime Intelligence Portal'}
            </div>
          </div>
        </div>

        {/* Center Nav Links with smooth jump anchors */}
        <div className="hidden lg:flex items-center space-x-6 text-[13px] font-medium text-slate-700">
          <a href="#profile" className="hover:text-[#008744] transition-colors py-1">
            {edition === 'banten' ? 'Profil Provinsi' : 'Profile'}
          </a>
          <a href="#governance" className="hover:text-[#008744] transition-colors py-1">
            {edition === 'banten' ? 'Profil Pemerintah' : 'Governance'}
          </a>
          <a href="#public-info" className="hover:text-[#008744] transition-colors py-1">
            {edition === 'banten' ? 'Informasi Publik' : 'Public Info'}
          </a>
          <a href="#berita" className="hover:text-[#008744] transition-colors py-1">
            Press Release
          </a>
          <a href="#announcements" className="hover:text-[#008744] transition-colors py-1">
            {edition === 'banten' ? 'Pengumuman' : 'Announcements'}
          </a>
          <a href="#rti-request" className="hover:text-[#008744] transition-colors py-1">
            {edition === 'banten' ? 'Permohonan Informasi' : 'RTI Request'}
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Workstation Launcher CTA */}
          {onLaunchWorkstation && (
            <button
              onClick={onLaunchWorkstation}
              className="bg-gradient-to-r from-[#008744] to-[#005f30] hover:from-[#007038] hover:to-[#004724] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5"
              title="Launch Full Maritime Intelligence Tactical Workstation"
            >
              <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden sm:inline">Tactical Workstation</span>
              <span className="sm:hidden">Workstation</span>
            </button>
          )}

          {/* HackX 3D Hero launcher */}
          {onLaunchHero && (
            <button
              onClick={onLaunchHero}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
              title="View HackX 3D Glassmorphic Hero"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden md:inline">3D Hero</span>
            </button>
          )}

          {/* Edition Switcher */}
          <button
            onClick={() => setEdition(edition === 'banten' ? 'maritime' : 'banten')}
            className="px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors font-mono cursor-pointer"
            title="Toggle between Original Banten Portal & Maritime English edition"
          >
            {edition === 'banten' ? '🇮🇩 Banten' : '🌐 Maritime'}
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH AERIAL HIGHWAY / PORT BACKGROUND (Exact match to screenshot) */}
      <section className="relative w-full min-h-[460px] sm:min-h-[500px] flex flex-col justify-between overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/portal/hero_bg.jpg"
            alt="Aerial Highway and Coastal Port"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08]"
          />
          {/* Subtle gradient overlay to match screenshot's atmospheric contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />
        </div>

        {/* Floating Social Icons (Right side, matching screenshot) */}
        <div className="absolute right-4 sm:right-6 top-1/3 -translate-y-1/2 z-20 hidden md:flex flex-col space-y-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Facebook"
          >
            f
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Instagram"
          >
            📷
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/30 text-xs font-bold"
            title="Twitter / X"
          >
            𝕏
          </a>
        </div>

        {/* Floating Left Tag: "Wajib Tahu" (Matching screenshot) */}
        <div className="absolute left-4 sm:left-6 top-1/3 -translate-y-1/2 z-20 hidden md:flex items-center">
          <div className="transform -rotate-90 origin-center bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold tracking-widest uppercase border border-white/30 shadow-md flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{edition === 'banten' ? 'Wajib Tahu' : 'Directives'}</span>
          </div>
        </div>

        {/* Center Main Headline (Exact words and typography from screenshot) */}
        <div className="relative z-10 pt-16 sm:pt-20 pb-20 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-wide uppercase leading-tight drop-shadow-md font-sans">
            {edition === 'banten' ? (
              <>
                Menjawab Kebutuhan Informasi <br />
                <span className="text-white drop-shadow-lg">Warga Banten</span>
              </>
            ) : (
              <>
                Answering Information Needs <br />
                <span className="text-white drop-shadow-lg">Of Maritime Citizens</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-xl mx-auto drop-shadow-sm font-medium">
            {edition === 'banten'
              ? 'Layanan Informasi Terpadu Pemerintah Daerah Provinsi Banten'
              : 'Integrated Public Maritime Gateway & Oil Spill Intelligence Attributor'}
          </p>
        </div>

        {/* 3. CENTER FLOATING WHITE DIRECTORY CARD (Exact 8 links from screenshot) */}
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
                placeholder={
                  edition === 'banten'
                    ? 'Cari website resmi provinsi Banten...'
                    : 'Search official government portal, vessel registry, spill reports...'
                }
                className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={() => {
                  if (onLaunchWorkstation) onLaunchWorkstation();
                }}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#008744] hover:bg-[#007038] text-white px-4 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Cari</span>
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
                        category: 'Direktori Resmi',
                        date: '2026',
                        image: '/portal/hero_bg.jpg',
                        excerpt: `Direktori Resmi Pemerintah Daerah: ${item.title}. Membuka integrasi data publik dan tata kelola terpadu.`,
                        content: `Halaman informasi layanan terpusat untuk ${item.title}. Sistem terhubung langsung dengan pusat komando dan data operasional resmi.`,
                      });
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                    item.highlight
                      ? 'bg-emerald-50/70 border-emerald-300 hover:border-[#008744] hover:bg-emerald-100/60 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-[#008744]/60'
                  }`}
                >
                  <span
                    className={`text-[12.5px] font-semibold line-clamp-1 pr-2 transition-colors ${
                      item.highlight ? 'text-[#008744]' : 'text-slate-700 group-hover:text-[#008744]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <ExternalLink
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      item.highlight ? 'text-[#008744]' : 'text-[#008744]/70 group-hover:text-[#008744]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: BERITA TERKINI (Matching screenshot with featured leader article & 3 news cards) */}
      <section id="berita" className="pt-28 sm:pt-36 pb-16 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten' ? 'Berita Terkini' : 'Latest Maritime News'}
            </h2>
            <div className="w-12 h-1 bg-[#008744] rounded-full mt-1.5" />
          </div>

          {/* Press Category Filters */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'Pemerintahan', 'Nasional', 'Prestasi'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setPressFilter(cat)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  pressFilter === cat ? 'bg-[#008744] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? (edition === 'banten' ? 'Semua' : 'All') : cat}
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
              <div className="absolute top-3 left-3 bg-[#008744] text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                {edition === 'banten' ? 'Utama' : 'Featured'}
              </div>
            </div>

            {/* Right Text Content Column */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Timestamp */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium mb-2.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{featuredArticle.timeAgo}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 hover:text-[#008744] transition-colors leading-snug cursor-pointer line-clamp-2"
                >
                  {featuredArticle.title}
                </h3>

                {/* Excerpt Paragraph */}
                <p className="mt-3 text-xs sm:text-[13px] text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              {/* Read More Link (Green with external arrow icon) */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="text-xs sm:text-sm font-bold text-[#008744] hover:text-[#006432] flex items-center space-x-1 transition-colors cursor-pointer group"
                >
                  <span>{edition === 'banten' ? 'Selengkapnya' : 'Read Full Article'}</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Tautan disalin ke clipboard');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  title="Bagikan Berita"
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
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                  <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                    {news.category}
                  </span>
                  <span>{news.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#008744] transition-colors line-clamp-3 leading-snug">
                  {news.title}
                </h4>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-[#008744] font-bold flex items-center space-x-1">
                    <span>{edition === 'banten' ? 'Selengkapnya' : 'Read More'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                  <span className="text-slate-400">{news.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: ASEAN INDONESIA 2023 (Matching screenshot carousel with red emblem badges) */}
      <section className="bg-slate-50/70 border-t border-b border-slate-200/80 py-16 px-4 sm:px-8">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {edition === 'banten' ? 'ASEAN Indonesia 2023' : 'ASEAN Maritime Cooperation'}
              </h2>
              <div className="w-12 h-1 bg-[#008744] rounded-full mt-1.5" />
            </div>
          </div>

          {/* Cards Row (3 Cards with Red Circular Emblem Badges) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aseanReleases.map((release) => (
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
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {release.badge}
                  </div>

                  {/* Title Headline */}
                  <h4 className="mt-2 text-sm sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-3">
                    {release.title}
                  </h4>
                </div>

                {/* Read More Link (Green) */}
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
                    className="text-xs font-bold text-[#008744] hover:text-[#006432] flex items-center space-x-1 cursor-pointer group"
                  >
                    <span>{edition === 'banten' ? 'Selengkapnya' : 'Read More'}</span>
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
                  activeAseanPage === 0 ? 'bg-[#008744] w-6' : 'border border-[#008744] bg-transparent'
                }`}
                title="Halaman 1"
              />
              <button
                onClick={() => setActiveAseanPage(1)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAseanPage === 1 ? 'bg-[#008744] w-6' : 'border border-[#008744] bg-transparent'
                }`}
                title="Halaman 2"
              />
              <button
                onClick={() => setActiveAseanPage(2)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAseanPage === 2 ? 'bg-[#008744] w-6' : 'border border-[#008744] bg-transparent'
                }`}
                title="Halaman 3"
              />
            </div>

            {/* Circular Green Arrow Button on Right (Matching screenshot) */}
            <button
              onClick={() => setActiveAseanPage((prev) => (prev + 1) % 3)}
              className="w-10 h-10 rounded-full bg-[#008744] hover:bg-[#007038] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DEDICATED SECTION: PROFIL PROVINSI / AGENCY PROFILE (#profile) */}
      {/* ========================================================================= */}
      <section id="profile" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#008744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>{edition === 'banten' ? 'Profil Wilayah & Lembaga' : 'Agency Profile & Mandate'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten'
                ? 'Profil Provinsi Banten: Gerbang Maritim Nusantara'
                : 'Indian Coast Guard & Sagar Mitra Intelligence Profile'}
            </h2>
            <div className="w-16 h-1 bg-[#008744] rounded-full mt-2" />
          </div>

          {/* Subtabs for Profile Section */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setProfileTab('vision')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'vision' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Visi & Misi' : 'Vision & Mission'}
            </button>
            <button
              onClick={() => setProfileTab('jurisdiction')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'jurisdiction' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Yurisdiksi Geografis' : 'Jurisdiction'}
            </button>
            <button
              onClick={() => setProfileTab('fleet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                profileTab === 'fleet' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Armada & Fasilitas' : 'Fleet & Assets'}
            </button>
          </div>
        </div>

        {profileTab === 'vision' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-gradient-to-br from-[#008744] to-[#01522b] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                <Shield className="w-64 h-64" />
              </div>
              <Award className="w-10 h-10 text-amber-300 mb-4" />
              <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1">
                {edition === 'banten' ? 'Visi Strategis 2026 - 2030' : 'Motto & Core Directive'}
              </div>
              <h3 className="text-xl font-bold leading-relaxed text-white">
                {edition === 'banten'
                  ? '"Banten yang Maju, Mandiri, Berdaya Saing, Sejahtera, dan Berakhlakul Karimah Berbasis Ekonomi Biru & Konektivitas Selat Sunda."'
                  : '"Vayam Rakshamah (We Protect) — Safeguarding Maritime Borders, Preserving Coastal Ecology, and Upholding Rule of Law at Sea."'}
              </h3>
              <div className="mt-6 pt-6 border-t border-emerald-400/30 flex items-center space-x-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Terakreditasi Standar Pelayanan Publik Nasional & ISO 9001:2015</span>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#008744] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#008744] flex items-center justify-center mb-3">
                  <Waves className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {edition === 'banten' ? 'Perlindungan Ekosistem Pesisir' : 'Marine Environmental Defense'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pemantauan 24/7 terhadap potensi tumpahan minyak, sampah plastik laut, dan perlindungan terumbu karang
                  Taman Nasional Ujung Kulon.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#008744] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#008744] flex items-center justify-center mb-3">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {edition === 'banten' ? 'Konektivitas Selat Sunda (ALKI I)' : 'Chokepoint Surveillance (ALKI I)'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menjamin kelancaran alur pelayaran internasional Selat Sunda dengan volume transit 65.000+ kapal niaga
                  setiap tahunnya.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#008744] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#008744] flex items-center justify-center mb-3">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {edition === 'banten' ? 'Kesiapsiagaan Darurat & SAR' : '24x7 Maritime Search & Rescue'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sinergi instan dengan Basarnas, MRCC, dan KPLP untuk evakuasi cepat bencana perairan dengan waktu tanggap
                  di bawah 30 menit.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#008744] transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#008744] flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {edition === 'banten' ? 'Transformasi Birokrasi Digital' : 'Automated Satellite Radar AI'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integrasi algoritma AI untuk pelacakan kapal nakal, analisis noda minyak Sentinel-1, dan transparansi
                  penegakan hukum maritim.
                </p>
              </div>
            </div>
          </div>
        )}

        {profileTab === 'jurisdiction' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-extrabold text-[#008744] mb-1">509.6 km</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Panjang Garis Pantai</div>
              <p className="text-[11px] text-slate-500">Mencakup pesisir utara Laut Jawa, Selat Sunda, dan Samudera Hindia.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-extrabold text-[#008744] mb-1">9.662 km²</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Luas Wilayah Darat</div>
              <p className="text-[11px] text-slate-500">Terdiri atas 4 Kabupaten dan 4 Kota dengan 155 Kecamatan.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-extrabold text-[#008744] mb-1">65.000+</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Lalu Lintas Kapal/Tahun</div>
              <p className="text-[11px] text-slate-500">Koridor Alur Laut Kepulauan Indonesia (ALKI I) dengan pengawasan ketat.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-extrabold text-[#008744] mb-1">12 Unit</div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Stasiun Radar Pesisir</div>
              <p className="text-[11px] text-slate-500">Jaringan radar pantai terpadu terhubung ke pusat kendali operasional.</p>
            </div>
          </div>
        )}

        {profileTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Ship className="w-8 h-8 text-[#008744] mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">Kapal Penanggulangan Polusi (PCV)</h4>
              <p className="text-xs text-slate-600 mb-3">
                Dilengkapi oil booms 500m, sweeping arms, disc skimmers berkekuatan 150m³/jam, dan tangki penampung emulsi
                500 ton.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Status: Siaga 24/7 di Pelabuhan Merak
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Compass className="w-8 h-8 text-[#008744] mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">Pesawat Patroli Maritim Dornier 228</h4>
              <p className="text-xs text-slate-600 mb-3">
                Dilengkapi Synthetic Aperture Radar (SAR), Side-Looking Airborne Radar (SLAR), dan FLIR electro-optics
                untuk deteksi malam hari.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Radius Patroli: 1.200 Mil Laut
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Anchor className="w-8 h-8 text-[#008744] mb-3" />
              <h4 className="font-bold text-slate-900 text-base mb-1">Kapal Interseptor Cepat (Fast Patrol Craft)</h4>
              <p className="text-xs text-slate-600 mb-3">
                Kecepatan jelajah 45 knot untuk pencegatan kapal pelanggar regulasi MARPOL Annex I dan inspeksi kepatuhan
                langsung di laut.
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Waktu Reaksi: &lt; 15 Menit
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 7. DEDICATED SECTION: PROFIL PEMERINTAH / GOVERNANCE (#governance) */}
      {/* ========================================================================= */}
      <section id="governance" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#008744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>{edition === 'banten' ? 'Tata Kelola & Pimpinan' : 'Governance & Leadership'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten' ? 'Struktur Pemerintahan & Hierarki Kepemimpinan' : 'Executive Command & Legal Governance'}
            </h2>
            <div className="w-16 h-1 bg-[#008744] rounded-full mt-2" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setGovernanceTab('leadership')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'leadership' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Pimpinan Eksekutif' : 'Executive Roster'}
            </button>
            <button
              onClick={() => setGovernanceTab('committees')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'committees' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Komite Statuta' : 'Statutory Bodies'}
            </button>
            <button
              onClick={() => setGovernanceTab('mandate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                governanceTab === 'mandate' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Dasar Hukum' : 'Legal Mandates'}
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
                  alt="Pj Gubernur Banten"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-3 left-3 bg-[#008744] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  PIMPINAN TERTINGGI
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                  Penjabat (Pj) Gubernur
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Al Muktabar, M.Sc., Ph.D</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Bertanggung jawab atas arah kebijakan umum, percepatan investasi strategis, ketahanan maritim, dan
                  reformasi tata kelola pemerintahan berbasis digital di Provinsi Banten.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kantor: Gedung Negara KP3B</span>
                  <span className="text-[#008744] font-semibold">Aktif</span>
                </div>
              </div>
            </div>

            {/* Leader 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/portal/news_delegation.jpg"
                  alt="Komandan Wilayah Maritim"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  KOMANDO OPERASIONAL
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">
                  Komandan Pengawasan Maritim & MRCC
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Laksamana Pertama TNI (Purn) Suryadi</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Memimpin operasi pencegahan pencemaran laut, koordinasi lintas instansi dengan TNI AL, Polairud, serta
                  penegakan hukum pidana maritim di Selat Sunda.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kantor: Puskodal Maritim Merak</span>
                  <span className="text-blue-700 font-semibold">Siaga Operasi</span>
                </div>
              </div>
            </div>

            {/* Leader 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/portal/news_launch.jpg"
                  alt="Sekretaris Daerah"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  ADMINISTRASI & PELAYANAN
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">
                  Sekretaris Daerah Provinsi Banten
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Ir. H. Rahmat Jaya, M.T.</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Mengkoordinasikan 24 Organisasi Perangkat Daerah (OPD), pengelolaan anggaran publik terpadu, serta
                  keterbukaan informasi dan pelayanan perizinan satu pintu.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kantor: Setda KP3B Serang</span>
                  <span className="text-amber-700 font-semibold">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {governanceTab === 'committees' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#008744] px-2 py-0.5 rounded">
                  Komite Tingkat Tinggi
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Badan Koordinasi Kesiapsiagaan Tanggap Tumpahan Minyak (Tier-1 & Tier-2 NOS-DCP)
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Forum koordinasi terpadu melibatkan SKK Migas, Pertamina, Otoritas Pelabuhan Cilegon-Merak, dan Dinas
                  Lingkungan Hidup untuk mitigasi instan tumpahan minyak di laut.
                </p>
              </div>
              <button
                onClick={() => onLaunchWorkstation && onLaunchWorkstation()}
                className="bg-[#008744] hover:bg-[#007038] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                Buka Peta Komite
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Pengawasan Hukum
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Satuan Tugas Port State Control (PSC) & Kepatuhan Konvensi MARPOL 73/78
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Audit berkala terhadap Oil Record Book kapal tangki, sertifikasi International Oil Pollution Prevention
                  (IOPP), dan uji laboratorium bahan bakar minyak.
                </p>
              </div>
              <button
                onClick={() => onLaunchWorkstation && onLaunchWorkstation()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                Lihat Standar Audit
              </button>
            </div>
          </div>
        )}

        {governanceTab === 'mandate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <FileCheck className="w-6 h-6 text-[#008744] mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">UU No. 32 Tahun 2009 tentang Perlindungan Lingkungan Hidup</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pasal 98 & 99 menetapkan ancaman pidana hingga 10 tahun penjara dan denda Rp 10 Miliar bagi setiap korporasi
                atau nakhoda yang sengaja membuang limbah minyak B3 ke laut.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <FileCheck className="w-6 h-6 text-[#008744] mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Perpres No. 109 Tahun 2006 tentang Penanggulangan Keadaan Darurat Tumpahan Minyak</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengatur rantai komando penanggulangan keadaan darurat tumpahan minyak di laut dari level pelabuhan (Tier 1),
                wilayah provinsi (Tier 2), hingga skala nasional (Tier 3).
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. DEDICATED SECTION: INFORMASI PUBLIK (#public-info) */}
      {/* ========================================================================= */}
      <section id="public-info" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#008744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>{edition === 'banten' ? 'Layanan Terbuka Warga' : 'Citizen Information & Hotlines'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten' ? 'Pusat Informasi Publik & Hotline Siaga 24 Jam' : 'Public Information & Emergency Hotlines'}
            </h2>
            <div className="w-16 h-1 bg-[#008744] rounded-full mt-2" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPublicInfoTab('hotlines')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'hotlines' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Hotline Darurat' : 'Hotlines'}
            </button>
            <button
              onClick={() => setPublicInfoTab('guidelines')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'guidelines' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Panduan Warga' : 'Guidelines'}
            </button>
            <button
              onClick={() => setPublicInfoTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                publicInfoTab === 'reports' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Dokumen Publik' : 'Reports'}
            </button>
          </div>
        </div>

        {publicInfoTab === 'hotlines' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200">
              <Phone className="w-8 h-8 text-rose-600 mb-3" />
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Hotline Darurat Maritim</div>
              <div className="text-2xl font-black text-rose-900 mt-1 mb-2">1554 / 115</div>
              <p className="text-xs text-rose-800/80 leading-relaxed">
                Bebas pulsa 24 jam untuk laporan kecelakaan kapal, orang hilang di laut, dan tanggap darurat tumpahan minyak.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <Radio className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Kanal Radio VHF Maritim</div>
              <div className="text-2xl font-black text-blue-900 mt-1 mb-2">CH-16 (156.8 MHz)</div>
              <p className="text-xs text-blue-800/80 leading-relaxed">
                Frekuensi internasional maritim dipantau nonstop oleh stasiun radio pantai untuk sinyal marabahaya (Mayday).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
              <Mail className="w-8 h-8 text-emerald-600 mb-3" />
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">WhatsApp Cepat Lapor</div>
              <div className="text-xl font-black text-emerald-900 mt-1 mb-2">+62 811-1900-1554</div>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Kirim foto dan koordinat GPS noda minyak atau limbah mencurigakan untuk respon cepat tim patroli.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
              <Shield className="w-8 h-8 text-amber-600 mb-3" />
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Sentra Pengaduan Pungli</div>
              <div className="text-xl font-black text-amber-900 mt-1 mb-2">0800-1-BANTEN</div>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                Saluran pengaduan terenkripsi untuk transparansi pelayanan izin tangkap nelayan dan kepelabuhanan.
              </p>
            </div>
          </div>
        )}

        {publicInfoTab === 'guidelines' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#008744] flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">SOP Pelaporan Ceceran Minyak Bagi Nelayan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ambil titik koordinat pada GPS kapal, amati arah angin dan warna lapisan minyak (sheen/rainbow/mousse),
                serta jauhi area jika tercium bau gas menyengat.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#008744] flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Panduan Keselamatan Cuaca Ekstrem Pesisir</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pastikan jaket pelampung (life jacket) dipakai sebelum melaut, periksa baterai lampu suar darurat, dan
                pantau pengumuman NAVAREA setiap 6 jam sekali.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#008744] flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Standar Pembuangan Bilga Kapal Niaga</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kandungan minyak air bilga tidak boleh melebihi 15 ppm melalui Oily Water Separator (OWS) terkalibrasi dan
                dilarang keras membuang dalam jarak 50 mil dari garis pantai.
              </p>
            </div>
          </div>
        )}

        {publicInfoTab === 'reports' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#008744] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#008744]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Laporan Lingkungan Hidup Pesisir 2026</div>
                  <div className="text-[10px] text-slate-500">PDF • 4.8 MB • Diperbarui 15 Sept 2026</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#008744] cursor-pointer" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#008744] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#008744]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Dokumen Rencana Kontinjensi Daerah (NOS-DCP)</div>
                  <div className="text-[10px] text-slate-500">PDF • 8.1 MB • Terakreditasi Nasional</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#008744] cursor-pointer" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#008744] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#008744]" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Maklumat Pelayanan & Standar Biaya PPID</div>
                  <div className="text-[10px] text-slate-500">PDF • 1.2 MB • Bebas Biaya Layanan</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 hover:text-[#008744] cursor-pointer" />
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 9. DEDICATED SECTION: PENGUMUMAN (#announcements) */}
      {/* ========================================================================= */}
      <section id="announcements" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#008744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{edition === 'banten' ? 'Pemberitahuan Resmi' : 'Notices & Warnings'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten' ? 'Pengumuman Resmi & Warta Navigasi' : 'Official Announcements & NAVAREA Bulletins'}
            </h2>
            <div className="w-16 h-1 bg-[#008744] rounded-full mt-2" />
          </div>

          {/* Announcement Category Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'NAVAREA', 'Tender', 'Advisory'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setAnnouncementFilter(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  announcementFilter === cat ? 'bg-[#008744] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? (edition === 'banten' ? 'Semua Warta' : 'All') : cat}
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
                  : 'bg-white border-slate-200 hover:border-[#008744] hover:shadow-xs'
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
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

                <h3 className="font-bold text-slate-900 text-sm sm:text-base hover:text-[#008744] transition-colors leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.excerpt}</p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button className="text-xs font-bold text-[#008744] hover:text-[#006432] flex items-center space-x-1 group">
                  <span>Rincian</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. DEDICATED SECTION: PERMOHONAN INFORMASI & RTI (#rti-request) */}
      {/* ========================================================================= */}
      <section id="rti-request" className="py-20 px-4 sm:px-8 max-w-5xl lg:max-w-6xl mx-auto border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-[#008744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{edition === 'banten' ? 'Keterbukaan Informasi Publik' : 'Right to Information (RTI)'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {edition === 'banten'
                ? 'Layanan Permohonan Informasi Publik (PPID Terpadu)'
                : 'Right to Information & Transparency Portal'}
            </h2>
            <div className="w-16 h-1 bg-[#008744] rounded-full mt-2" />
          </div>

          {/* RTI Subtabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveRtiTab('submit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'submit' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Formulir Permohonan' : 'Submit Request'}
            </button>
            <button
              onClick={() => setActiveRtiTab('track')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'track' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Lacak Status' : 'Track Status'}
            </button>
            <button
              onClick={() => setActiveRtiTab('pio')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'pio' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Kontak PPID' : 'PIO Contacts'}
            </button>
            <button
              onClick={() => setActiveRtiTab('proactive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRtiTab === 'proactive' ? 'bg-white text-[#008744] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edition === 'banten' ? 'Informasi Berkala' : 'Proactive Info'}
            </button>
          </div>
        </div>

        {activeRtiTab === 'submit' && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="max-w-2xl mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {edition === 'banten' ? 'Pengajuan Permohonan Informasi Publik' : 'Online Information Request Filing'}
              </h3>
              <p className="text-xs text-slate-600">
                Sesuai Undang-Undang Keterbukaan Informasi Publik No. 14 Tahun 2008 & Right to Information Act, warga negara
                berhak memperoleh data publik secara transparan, akurat, dan tanpa dipungut biaya.
              </p>
            </div>

            {rtiSubmittedId ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-[#008744] mx-auto mb-3" />
                <h4 className="text-base font-bold text-emerald-950 mb-1">
                  Permohonan Berhasil Terdaftar di Sistem PPID!
                </h4>
                <p className="text-xs text-emerald-800 mb-3">
                  Nomor Registrasi Resmi Anda:{' '}
                  <span className="font-mono font-extrabold text-sm text-[#008744] bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {rtiSubmittedId}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 max-w-md mx-auto mb-4">
                  Surat konfirmasi telah dikirimkan ke email Anda. Waktu penyelesaian standar adalah 10 hari kerja.
                </p>
                <button
                  onClick={() => {
                    setTrackingInput(rtiSubmittedId);
                    setActiveRtiTab('track');
                    handleTrackQuery();
                  }}
                  className="bg-[#008744] hover:bg-[#007038] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Lacak Progres Permohonan Ini ↗
                </button>
              </div>
            ) : (
              <form onSubmit={handleRtiSubmit} className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Pemohon (Sesuai KTP/Identitas) *
                    </label>
                    <input
                      type="text"
                      required
                      value={rtiForm.name}
                      onChange={(e) => setRtiForm({ ...rtiForm, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso / Dr. Rajesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email Aktif *</label>
                    <input
                      type="email"
                      required
                      value={rtiForm.email}
                      onChange={(e) => setRtiForm({ ...rtiForm, email: e.target.value })}
                      placeholder="nama@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={rtiForm.phone}
                      onChange={(e) => setRtiForm({ ...rtiForm, phone: e.target.value })}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pemohon</label>
                    <select
                      value={rtiForm.category}
                      onChange={(e) => setRtiForm({ ...rtiForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] outline-none bg-white"
                    >
                      <option value="Citizen">Masyarakat Umum / Perorangan</option>
                      <option value="Academic">Akademisi / Peneliti / Mahasiswa</option>
                      <option value="Media">Jurnalis / Media Massa</option>
                      <option value="NGO">Organisasi Non-Pemerintah (LSM / NGO)</option>
                      <option value="Maritime">Pelaku Usaha Maritim / Perkapalan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rincian Informasi Publik yang Dimohonkan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rtiForm.query}
                    onChange={(e) => setRtiForm({ ...rtiForm, query: e.target.value })}
                    placeholder="Tuliskan secara spesifik data, dokumen, atau statistik yang Anda perlukan (Contoh: Data statistik pemantauan tumpahan minyak perairan Teluk Banten periode Januari - September 2026)."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Layanan terjamin bebas biaya retribusi resmi (Gratis).
                  </span>
                  <button
                    type="submit"
                    className="bg-[#008744] hover:bg-[#007038] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Permohonan Informasi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeRtiTab === 'track' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Lacak Status Permohonan Informasi</h3>
            <p className="text-xs text-slate-600 mb-6">
              Masukkan Nomor Registrasi yang Anda terima saat pendaftaran (format: RTI/ICG/2026/XXXXX).
            </p>

            <div className="flex gap-2 max-w-md mb-8">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="RTI/2026/08492"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-[#008744]"
              />
              <button
                onClick={handleTrackQuery}
                className="bg-[#008744] hover:bg-[#007038] text-white px-5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cek Status
              </button>
            </div>

            {trackingResult && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <span className="text-xs text-slate-500">Nomor Tiket:</span>
                    <span className="ml-2 font-mono font-bold text-sm text-[#008744]">{trackingResult.id}</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {trackingResult.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
                  <div>
                    <span className="text-slate-400 block">Tanggal Pengajuan:</span>
                    <span className="font-bold text-slate-800">{trackingResult.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pejabat Penanggung Jawab:</span>
                    <span className="font-bold text-slate-800">{trackingResult.officer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Estimasi Selesai:</span>
                    <span className="font-bold text-slate-800">{trackingResult.estimatedCompletion}</span>
                  </div>
                </div>

                {trackingResult.timeline && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-800 mb-2">Riwayat Proses Verifikasi:</div>
                    {trackingResult.timeline.map((item: any, i: number) => (
                      <div key={i} className="flex items-center space-x-3 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            item.done ? 'bg-[#008744] text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.done ? '✓' : i + 1}
                        </div>
                        <div className="flex-1 flex justify-between">
                          <span className={item.done ? 'font-bold text-slate-900' : 'text-slate-500'}>
                            {item.title}
                          </span>
                          <span className="text-slate-400 text-[11px]">{item.date}</span>
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
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Atasan Pejabat Pengelola Informasi (PPID Utama)
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Kepala Dinas Komunikasi & Informatika Banten</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Memimpin pengawasan penyelesaian sengketa informasi, penerbitan maklumat keterbukaan informasi, serta
                pelaporan berkala ke Komisi Informasi Provinsi.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#008744]" />
                  <span>Gedung Dinas Kominfo KP3B, Jl. Syech Nawawi Al-Bantani, Curug, Serang</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#008744]" />
                  <span>ppid.utama@bantenprov.go.id</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#008744]" />
                  <span>(0254) 267000 / Ext. 104</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                Pejabat Informasi Teknis Maritim & Lingkungan
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Biro Hukum & Informasi Keselamatan Pelayaran</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Melayani permintaan data riwayat nakhoda, catatan pemantauan tumpahan minyak, koordinat AIS, dan status
                penyidikan MARPOL Annex I.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>Pusat Koordinasi Maritim (MRCC), Pelabuhan Merak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>info.maritim@bantenprov.go.id</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span>(0254) 571155</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeRtiTab === 'proactive' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Daftar Informasi Publik Wajib Disediakan Berkala (Pasal 9 UU KIP)</div>
                <div className="text-[10px] text-slate-500">Mencakup profil lembaga, ringkasan program strategis & kinerja</div>
              </div>
              <Download className="w-4 h-4 text-[#008744] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Daftar Informasi Publik Serta Merta (Keadaan Darurat Maritim)</div>
                <div className="text-[10px] text-slate-500">Protokol peringatan dini tsunami, gelombang tinggi, dan bahaya bahan kimia</div>
              </div>
              <Download className="w-4 h-4 text-[#008744] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Laporan Keuangan & Realisasi Anggaran Daerah TA 2025/2026</div>
                <div className="text-[10px] text-slate-500">Opini WTP Badan Pemeriksa Keuangan (BPK) RI</div>
              </div>
              <Download className="w-4 h-4 text-[#008744] cursor-pointer flex-shrink-0" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Hasil Audit Kepatuhan Lingkungan Dermaga & Terminal BBM</div>
                <div className="text-[10px] text-slate-500">Hasil uji sampel laboratorium kualitas baku mutu air laut</div>
              </div>
              <Download className="w-4 h-4 text-[#008744] cursor-pointer flex-shrink-0" />
            </div>
          </div>
        )}
      </section>

      {/* 11. EMERALD GREEN FOOTER: WEBSITE RESMI PROVINSI BANTEN (Exact match to screenshot) */}
      <footer className="bg-[#008744] text-white pt-12 pb-8 px-4 sm:px-8">
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          {/* Top Title with Official Provincial Seal */}
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-8 h-10 relative flex-shrink-0">
              <svg viewBox="0 0 100 120" className="w-full h-full filter drop-shadow-md">
                <path
                  d="M50 0 C75 0 95 15 95 40 C95 85 50 115 50 115 C50 115 5 85 5 40 C5 15 25 0 50 0 Z"
                  fill="#FFD700"
                />
                <path d="M50 10 L85 35 L85 65 L50 95 L15 65 L15 35 Z" fill="#008744" />
                <circle cx="50" cy="50" r="16" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wider uppercase">
                {edition === 'banten' ? 'Website Resmi Provinsi Banten' : 'Official Portal • Indian Coast Guard'}
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium tracking-wide">
                {edition === 'banten'
                  ? 'Kawasan Pusat Pemerintahan Provinsi Banten (KP3B)'
                  : 'Maritime Rescue Coordination Centre (MRCC) Mumbai'}
              </p>
            </div>
          </div>

          {/* 4 Information Columns (Exact match to screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-xs text-emerald-50">
            {/* Column 1: Alamat (Address) */}
            <div>
              <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
                <MapPin className="w-4 h-4 text-emerald-200" />
                <span>Alamat</span>
              </div>
              <p className="leading-relaxed text-emerald-100/90 text-[11.5px]">
                Jl. Syech Nawawi Al-Bantani No. 1, Kawasan Pusat Pemerintahan Provinsi Banten (KP3B) Kecamatan Curug, Kota
                Serang, Provinsi Banten.
              </p>
            </div>

            {/* Column 2: Email */}
            <div>
              <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
                <Mail className="w-4 h-4 text-emerald-200" />
                <span>Email</span>
              </div>
              <a
                href="mailto:admin@bantenprov.go.id"
                className="text-emerald-100 hover:text-white hover:underline transition-colors block text-[11.5px]"
              >
                admin@bantenprov.go.id
              </a>
              <a
                href="mailto:layanan@bantenprov.go.id"
                className="text-emerald-100/80 hover:text-white hover:underline transition-colors block mt-1 text-[11.5px]"
              >
                layanan@bantenprov.go.id
              </a>
            </div>

            {/* Column 3: Media Sosial */}
            <div>
              <div className="text-white font-bold text-sm mb-3">Media Sosial</div>
              <div className="flex items-center space-x-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold"
                  title="Facebook"
                >
                  f
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs"
                  title="Instagram"
                >
                  📷
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold"
                  title="Twitter / X"
                >
                  𝕏
                </a>
              </div>
            </div>

            {/* Column 4: Statistik Kunjungan (Visit Statistics matching screenshot) */}
            <div>
              <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
                <BarChart3 className="w-4 h-4 text-emerald-200" />
                <span>Statistik Kunjungan</span>
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-emerald-100">
                <li className="flex items-center justify-between">
                  <span>1.180 pengunjung hari ini</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>16.448 pengunjung bulan ini</span>
                </li>
                <li className="flex items-center justify-between font-bold text-white">
                  <span>3.665.382 jumlah hit</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-6 border-t border-white/20 text-center text-[11px] text-emerald-100/80 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Copyright © 2026 Pemerintah Daerah Provinsi Banten. All Rights Reserved</span>
            <div className="flex items-center space-x-4 text-[10.5px]">
              <a href="#profile" className="hover:underline">
                Profil
              </a>
              <a href="#governance" className="hover:underline">
                Pemerintah
              </a>
              <a href="#public-info" className="hover:underline">
                Layanan
              </a>
              <a href="#announcements" className="hover:underline">
                Pengumuman
              </a>
              <a href="#rti-request" className="hover:underline">
                PPID
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="w-full h-full min-h-screen bg-slate-900 flex flex-col overflow-y-auto">
      {/* Top Behance Showcase Presentation Bar (From user's uploaded screenshot) */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none">
        {/* Creator Profile / Brand from uploaded Behance shot */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-rose-300">
              SM
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Sabrina Misyell Aaliyah</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] px-1.5 py-0.2 rounded font-mono">
                Official UI
              </span>
            </div>
            <button
              onClick={() => setEdition(edition === 'banten' ? 'maritime' : 'banten')}
              className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Follow • {edition === 'banten' ? 'Provinsi Banten Portal' : 'Maritime Intelligence Edition'}
            </button>
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
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

          {/* "Get in touch" pill button matching screenshot */}
          <button
            onClick={() => {
              if (onLaunchWorkstation) onLaunchWorkstation();
            }}
            className="bg-[#0B132B] hover:bg-[#1C2541] text-white border border-slate-700 px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Get in touch
          </button>
        </div>
      </header>

      {/* Main Container: If Showcase mode, render in warm gradient backdrop like uploaded screenshot */}
      {viewMode === 'showcase' ? (
        <div className="flex-1 w-full min-h-screen bg-gradient-to-tr from-[#EA580C] via-[#CA8A04] to-[#10B981] p-3 sm:p-8 lg:p-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden border border-white/40 ring-1 ring-black/10">
            {PortalContent}
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-screen bg-white">{PortalContent}</div>
      )}

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
              <div className="absolute bottom-3 left-4 bg-[#008744] text-white text-xs font-bold px-2.5 py-1 rounded">
                {selectedArticle.category}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedArticle.date}</span>
                {selectedArticle.timeAgo && <span>• {selectedArticle.timeAgo}</span>}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-snug">
                {selectedArticle.title}
              </h2>

              <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedArticle.excerpt}
              </p>

              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                <p>{selectedArticle.content}</p>
                <p>
                  Sistem pemantauan ini terhubung langsung dengan National Maritime Command & Tactical Intelligence
                  Workstation untuk pelacakan kapal, analisis tumpahan minyak, serta integrasi data satelit.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                {onLaunchWorkstation && (
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      onLaunchWorkstation();
                    }}
                    className="bg-[#008744] hover:bg-[#007038] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Buka Tactical Workstation</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
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

            <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedAnnouncement.title}</h3>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
              <span>Tanggal Rilis: {selectedAnnouncement.date}</span>
              {selectedAnnouncement.deadline && <span>• {selectedAnnouncement.deadline}</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedAnnouncement.details}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  alert('Mengunduh salinan resmi surat edaran (PDF)...');
                }}
                className="bg-[#008744] hover:bg-[#007038] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Salinan PDF</span>
              </button>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
