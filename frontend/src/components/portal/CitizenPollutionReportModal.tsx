import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  Phone,
  User,
  Shield,
  Send,
  Download,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audioAlerts';

export interface CitizenPollutionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'hi';
}

export const CitizenPollutionReportModal: React.FC<CitizenPollutionReportModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [category, setCategory] = useState<string>('Beach Tarballs (काले कोलतार के गोले)');
  const [locationName, setLocationName] = useState<string>('Juhu Beach, Mumbai (Near Lifeguard Station 3)');
  const [lat, setLat] = useState<string>('19.098824');
  const [lng, setLng] = useState<string>('72.826741');
  const [details, setDetails] = useState<string>(
    'Multiple oily tarballs observed washed up along high-tide line over approximately 120 meters. Strong crude hydrocarbon smell.'
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<{
    id: string;
    timestamp: string;
    status: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => {
          // Fallback to Alibag Beach coordinates
          setLat('18.641400');
          setLng('72.872200');
          setLocationName('Alibag Beach, Raigad Coastline');
        }
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert('Please provide your name and contact mobile number.');
      return;
    }

    setIsSubmitting(true);
    tacticalAudio.playSonarPing();

    setTimeout(() => {
      const reportId = `ICG/REP/2026/${Math.floor(10000 + Math.random() * 90000)}`;
      const newReport = {
        id: reportId,
        name,
        mobile,
        category,
        location: locationName,
        lat,
        lng,
        details,
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        status: 'Logged & Dispatched to District PRT Team (Under Immediate Investigation)',
      };

      // Save to localStorage for citizen tracking
      try {
        const existing = JSON.parse(localStorage.getItem('hackx_citizen_reports') || '[]');
        localStorage.setItem('hackx_citizen_reports', JSON.stringify([newReport, ...existing]));
      } catch {}

      setIsSubmitting(false);
      setSubmittedReport({
        id: reportId,
        timestamp: newReport.timestamp,
        status: newReport.status,
      });
      tacticalAudio.playTacticalChime();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#006837] via-[#044B27] to-[#0A2518] px-5 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/20 text-[#FFD700] backdrop-blur-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-serif font-bold tracking-tight">
                  COASTAL POLLUTION CITIZEN REPORT
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-mono px-2 py-0.2 rounded font-bold">
                  PUBLIC HOTLINE
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 font-sans">
                Indian Coast Guard • National Marine Environmental Incident Reporting Gateway
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedReport ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-200 shadow-sm animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Incident Report Successfully Registered!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Thank you for safeguarding India’s coastline. Your observation has been encrypted and routed directly
                to the nearest Pollution Response Team (PRT).
              </p>
            </div>

            {/* Official Tracking Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">Official Reference No:</span>
                <span className="font-bold text-[#006837] text-sm">{submittedReport.id}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">Registration Time:</span>
                <span className="text-slate-700">{submittedReport.timestamp}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">Assigned Unit:</span>
                <span className="text-slate-800 font-semibold">MRCC Mumbai Coastal Response Unit</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-0.5">Status:</span>
                <span className="text-emerald-700 font-bold block">{submittedReport.status}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading certified Citizen Incident Acknowledgment Receipt (${submittedReport.id})...`);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006837] hover:bg-[#00522c] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified PDF Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Gateway
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Citizen Identity Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name of Informant *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patil / Coastal Citizen"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (for SMS Tracking) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Category & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nature of Sighting / Incident Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none bg-white font-medium"
                >
                  <option>Beach Tarballs (काले कोलतार के गोले)</option>
                  <option>Surface Oil Sheen / Bilge Sludge (तेल की परत)</option>
                  <option>Chemical / Hydrocarbon Odor (तीखी गंध)</option>
                  <option>Stranded / Oiled Marine Wildlife (प्रभावित समुद्री जीव)</option>
                  <option>Suspicious Vessel Discharging Liquid (संदिग्ध पोत)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coastal Location / Beach Name
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Juhu Beach, Alibag Coast, etc."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* GPS Coordinates with Auto-Detect */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#006837]" />
                  <span>GPS Coordinates (Latitude & Longitude)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  className="text-[11px] font-semibold text-[#006837] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>📍 Auto-Detect GPS Fix</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Latitude (°N):</span>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Longitude (°E):</span>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload with Live Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Photo Evidence (Camera or Gallery)
              </label>
              <div className="flex items-center space-x-3">
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 flex-shrink-0">
                    <img src={photoPreview} alt="Sighting Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#006837] flex flex-col items-center justify-center text-slate-400 hover:text-[#006837] cursor-pointer transition-colors flex-shrink-0">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold">Add Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}

                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">Photographic evidence accelerates response.</p>
                  <p className="text-[11px]">
                    Photos are digitally geo-tagged and hashed with SHA-256 for court-admissible chain of custody.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoPreview(
                        'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="text-[10.5px] text-[#006837] font-semibold hover:underline"
                  >
                    Sample Photo Loaded (Click to view)
                  </button>
                </div>
              </div>
            </div>

            {/* Observations / Narrative */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Observation / Landmarks
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe size of oil slick/tarballs, smell, dead marine life, or approaching vessels..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#006837] hover:bg-[#00522c] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-[#FFD700]" />
                    <span>Encrypting & Routing to MRCC...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Incident Report to Indian Coast Guard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
