import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MessageSquare,
  Globe,
  Smartphone,
  Copy,
  Loader2,
  Lock,
} from 'lucide-react';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { dispatchTacticalAlert, AlertDispatchResultItem } from '../../api/client';
import { tacticalAudio } from '../../utils/audioAlerts';

interface TacticalAlertDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: MaritimeScenario;
  onDispatched?: (message: string) => void;
}

export const TacticalAlertDispatchModal: React.FC<TacticalAlertDispatchModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onDispatched,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<{
    webhook: boolean;
    telegram: boolean;
    sms: boolean;
  }>({
    webhook: true,
    telegram: true,
    sms: true,
  });

  const [dutyOfficerContact, setDutyOfficerContact] = useState('+91-98200-ICG01');
  const [telegramChannel, setTelegramChannel] = useState('@ICG_MRCC_OPS');
  const [webhookUrl, setWebhookUrl] = useState(
    'https://mrcc-mumbai.indiancoastguard.gov.in/api/v1/incident-webhook'
  );

  const [isSending, setIsSending] = useState(false);
  const [dispatchResults, setDispatchResults] = useState<AlertDispatchResultItem[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const topSuspect = scenario.vessels[0];
  const caseNumber = `ICG/MRCC-MUM/2026/${scenario.spill.id.replace('SPL-', 'CASE-')}`;
  const coords: [number, number] = scenario.spill.centroid;

  const toggleChannel = (channel: 'webhook' | 'telegram' | 'sms') => {
    setSelectedChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleTransmit = async () => {
    const activeChannels = Object.entries(selectedChannels)
      .filter(([_, active]) => active)
      .map(([k]) => k);

    if (activeChannels.length === 0) {
      alert('Please select at least one dispatch channel.');
      return;
    }

    setIsSending(true);
    tacticalAudio.playTacticalChime();

    try {
      const resp = await dispatchTacticalAlert({
        case_number: caseNumber,
        sector: scenario.region,
        coordinates: coords,
        spill_area_sqkm: scenario.spill.areaSqKm,
        primary_suspect: topSuspect?.name || 'UNKNOWN TANKER',
        suspect_mmsi: topSuspect?.mmsi || '419000123',
        priority: 'CRITICAL',
        channels: activeChannels,
        duty_officer_contact: dutyOfficerContact,
        webhook_url: webhookUrl,
        telegram_channel: telegramChannel,
      });

      setDispatchResults(resp.results);
      tacticalAudio.playSuccessChime();

      if (onDispatched) {
        onDispatched(
          `Tactical alert dispatched via ${resp.dispatched_count} channels for ${caseNumber}`
        );
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-fadeIn font-sans">
      <div className="bg-white border-2 border-[#064E26] w-full max-w-2xl rounded-[3px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#032B13] text-white px-4 py-3 flex items-center justify-between border-b-2 border-emerald-600/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-red-600/20 border border-red-500/60 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm text-[#FFD700] tracking-wide">
                  तटरक्षक सामरिक अलर्ट प्रेषण
                </span>
                <span className="text-emerald-400">|</span>
                <span className="font-classic text-xs font-bold text-white tracking-wider">
                  TACTICAL EMERGENCY DISPATCH
                </span>
              </div>
              <div className="text-[10px] font-mono text-emerald-200 mt-0.5">
                ICG-MRCC MUMBAI // MARITIME LAW ENFORCEMENT ESCALATION
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Banner */}
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-red-900 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>PRIORITY-1 TACTICAL INCIDENT: Immediate Interception & Evidence Notice</span>
          </div>
          <span className="font-mono text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold border border-red-300">
            MSA 1958 §356C
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          {/* Incident Summary Card */}
          <div className="bg-slate-50 border border-slate-300 p-3 rounded space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block font-medium">केस संदर्भ / Case:</span>
                <span className="font-mono font-bold text-slate-900 truncate block">{caseNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">क्षेत्र / Sector:</span>
                <span className="font-bold text-slate-900 truncate block">{scenario.region}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">अनुमानित आकार:</span>
                <span className="font-mono font-bold text-red-700 block">{scenario.spill.areaSqKm} km²</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">प्राथमिक संदेही:</span>
                <span className="font-bold text-[#064E26] truncate block">{topSuspect?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Channel Selectors */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#064E26] flex items-center justify-between">
              <span>अलर्ट चैनल चयन / TRANSMISSION CHANNELS</span>
              <span className="text-[10px] text-slate-500">All channels encrypted</span>
            </div>

            {/* Channel 1: MRCC Operations Webhook */}
            <div
              onClick={() => toggleChannel('webhook')}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-start space-x-3 ${
                selectedChannels.webhook
                  ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedChannels.webhook}
                onChange={() => {}}
                className="mt-0.5 rounded text-[#064E26] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-[#064E26]" />
                  <span className="font-bold text-slate-900 text-xs">
                    MRCC Operations Center Webhook (NMDA Gateway)
                  </span>
                  <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold">
                    HMAC-SHA256
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1">
                  Automated JSON event payload dispatched to Indian Coast Guard National Maritime Domain Awareness system.
                </div>
                {selectedChannels.webhook && (
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full text-[10.5px] font-mono bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-[#064E26]"
                    placeholder="Webhook URL"
                  />
                )}
              </div>
            </div>

            {/* Channel 2: Telegram Tactical Bot */}
            <div
              onClick={() => toggleChannel('telegram')}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-start space-x-3 ${
                selectedChannels.telegram
                  ? 'bg-sky-50/60 border-sky-500 shadow-xs'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedChannels.telegram}
                onChange={() => {}}
                className="mt-0.5 rounded text-sky-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Telegram Tactical Bot (@ICG_MRCC_Tactical_Bot)
                  </span>
                  <span className="text-[9.5px] bg-sky-100 text-sky-800 px-1 rounded font-mono font-bold">
                    INSTANT PUSH
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1">
                  Sends formatted Markdown tactical brief with coordinates and boarding referral to command staff channel.
                </div>
                {selectedChannels.telegram && (
                  <input
                    type="text"
                    value={telegramChannel}
                    onChange={(e) => setTelegramChannel(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full text-[10.5px] font-mono bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-sky-600"
                    placeholder="Telegram Channel / Group ID"
                  />
                )}
              </div>
            </div>

            {/* Channel 3: Emergency SMS Gateway */}
            <div
              onClick={() => toggleChannel('sms')}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-start space-x-3 ${
                selectedChannels.sms
                  ? 'bg-amber-50/60 border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedChannels.sms}
                onChange={() => {}}
                className="mt-0.5 rounded text-amber-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Emergency SMS Gateway (TRAI DLT Template)
                  </span>
                  <span className="text-[9.5px] bg-amber-100 text-amber-800 px-1 rounded font-mono font-bold">
                    PRIORITY SMS
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1">
                  Direct GSM broadcast to MRCC Mumbai Duty Officer and DGLL Coastal Surveillance officer.
                </div>
                {selectedChannels.sms && (
                  <input
                    type="text"
                    value={dutyOfficerContact}
                    onChange={(e) => setDutyOfficerContact(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full text-[10.5px] font-mono bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-amber-600"
                    placeholder="Duty Officer Mobile Number"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Dispatch Results Section if sent */}
          {dispatchResults && (
            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>सफल प्रेषण / TRANSMISSION CONFIRMED ACROSS ALL CHANNELS</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {dispatchResults.map((res, i) => (
                  <div
                    key={res.dispatch_id}
                    className="bg-white border border-emerald-200 p-2 rounded flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{res.channel}</span>
                        <span className="text-emerald-700 font-mono text-[10px]">({res.status})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {res.dispatch_id} • {res.timestamp_utc}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(res.payload_preview, i)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 text-[10px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedIndex === i ? 'Copied' : 'Payload'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10.5px] text-slate-500 font-mono">
            <Lock className="w-3 h-3 text-[#064E26]" />
            <span>ICG Military Cryptographic Mesh v2.4</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-3 py-1.5 rounded-[2px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-sans font-semibold text-xs cursor-pointer"
            >
              बन्द करें / Close
            </button>

            <button
              onClick={handleTransmit}
              disabled={isSending}
              className="px-4 py-1.5 rounded-[2px] bg-[#0D5204] hover:bg-[#064E26] disabled:opacity-50 text-white font-sans font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-md"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>प्रेषित किया जा रहा है... (Transmitting)</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>प्रेषण करें / TRANSMIT TACTICAL ALERT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
