import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  Send,
  Bot,
  User,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Shield,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { MaritimeScenario } from '../../data/maritimeDemoData';
import { NavView } from '../shell/Sidebar';
import { generateCopilotResponse, generateCopilotResponseAsync, CopilotAction } from '../../utils/copilotEngine';
import { SagarMitraLogo } from './SagarMitraLogo';

export interface TacticalCopilotProps {
  scenario: MaritimeScenario;
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onSelectScenario: (scenarioId: string) => void;
  onOpenDossier: () => void;
  onOpenTour?: () => void;
  onSelectVessel?: (vesselId: string) => void;
  lang?: 'en' | 'hi';
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: CopilotAction;
  suggestions?: string[];
  modelUsed?: string;
}

export const TacticalCopilot: React.FC<TacticalCopilotProps> = ({
  scenario,
  currentView,
  onNavigate,
  onSelectScenario,
  onOpenDossier,
  onOpenTour,
  onSelectVessel,
  lang = 'en',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome = generateCopilotResponse('hello', scenario, currentView, lang);
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: welcome.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: welcome.suggestions,
        modelUsed: 'SagarMitra Conversational AI',
      },
    ];
  });

  // Re-generate welcome if language changes and only welcome exists
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'msg-welcome') {
      const welcome = generateCopilotResponse('hello', scenario, currentView, lang);
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'bot',
          text: welcome.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: welcome.suggestions,
          modelUsed: 'SagarMitra Conversational AI',
        },
      ]);
    }
  }, [lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare multi-turn history from existing conversation
    const history = messages.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await generateCopilotResponseAsync(
        text,
        scenario,
        currentView,
        lang,
        history
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        suggestions: response.suggestions,
        modelUsed: response.modelUsed || 'SagarMitra AI',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      // Fallback response
      const fallback = generateCopilotResponse(text, scenario, currentView, lang);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallback.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: fallback.action,
        suggestions: fallback.suggestions,
        modelUsed: 'SagarMitra Local NLU',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteAction = (action: CopilotAction) => {
    switch (action.type) {
      case 'NAVIGATE':
        if (action.targetView) onNavigate(action.targetView);
        break;
      case 'OPEN_DOSSIER':
        onOpenDossier();
        break;
      case 'START_TOUR':
        if (onOpenTour) onOpenTour();
        break;
      case 'SWITCH_SCENARIO':
        if (action.scenarioId) onSelectScenario(action.scenarioId);
        break;
      case 'SELECT_VESSEL':
        if (action.vesselId && onSelectVessel) onSelectVessel(action.vesselId);
        break;
    }
  };

  const handleClearChat = () => {
    const welcome = generateCopilotResponse('hello', scenario, currentView, lang);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: welcome.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: welcome.suggestions,
      },
    ]);
  };

  // Basic markdown-like formatter for bolding and bullet lists
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process markdown bold (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-emerald-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-1 text-slate-300">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{renderedLine}</span>
              </div>
            );
          }

          return <div key={idx}>{renderedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <div className={`fixed bottom-5 right-5 z-[9999] select-none font-sans ${className}`}>
      {/* Floating Circular Launcher Button */}
      {/* Floating Circular / Pill Launcher Button with Appearing Animation */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#07192C] via-[#0B2545] to-[#04101D] text-white shadow-[0_8px_28px_rgba(7,25,44,0.75)] border-2 border-[#D4AF37]/80 hover:border-[#FFFBEB] hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-500"
          title={lang === 'hi' ? 'सागर मित्र एआई सहायक खोलें' : 'Open Sagar Mitra AI Copilot'}
        >
          {/* Subtle Radar Pulse Ping Indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B8860B] border-2 border-slate-900"></span>
          </span>

          {/* Classical Naval Insignia Logo */}
          <SagarMitraLogo size={42} withPulse={true} />

          {/* Classic Naval Typography */}
          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-classic text-[13.5px] font-bold tracking-wider text-[#FFFBEB]">
                {lang === 'hi' ? 'सागर मित्र' : 'SAGAR MITRA'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#FDE68A] font-mono font-bold tracking-tight">
                AI 2.0
              </span>
            </div>
            <span className="font-serif italic text-[11px] text-[#E5C158] tracking-wide">
              {lang === 'hi' ? 'नौसेना आसूचना कोपायलट' : 'Tactical Maritime Copilot'}
            </span>
          </div>
        </button>
      )}

      {/* Expanded Glassmorphic Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col bg-slate-900/95 backdrop-blur-xl border-2 border-[#D4AF37]/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 duration-300 ${
            isMinimized
              ? 'w-84 h-15'
              : 'w-[92vw] sm:w-[425px] h-[570px] max-h-[84vh]'
          }`}
        >
          {/* Top Bar / Classic Naval Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#07192C] via-[#0B2545] to-[#04101D] border-b border-[#D4AF37]/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <SagarMitraLogo size={36} withPulse={false} />
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-classic text-sm font-bold tracking-wider text-[#FFFBEB]">
                    {lang === 'hi' ? 'सागर मित्र' : 'SAGAR MITRA'}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>AI Human Copilot</span>
                  </span>
                </div>
                <span className="font-serif text-[10.5px] text-[#E5C158] tracking-wide flex items-center space-x-1">
                  <span>{scenario.title.split(':')[0]}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-sans text-[10px]">ICG Maritime Intelligence</span>
                </span>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                title={lang === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-red-900/60 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when Minimized) */}
          {!isMinimized && (
            <>
              {/* Message History Stream */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-950/70 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[92%] ${
                        msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 mt-0.5">
                        {msg.sender === 'user' ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600/30 border border-blue-400 text-blue-300">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <SagarMitraLogo size={26} withPulse={false} />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`px-3 py-2.5 rounded-xl text-xs ${
                          msg.sender === 'user'
                            ? 'bg-blue-600/80 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md backdrop-blur-md'
                        }`}
                      >
                        {renderFormattedText(msg.text)}

                        {/* Interactive In-Chat Action Button */}
                        {msg.action && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                            <button
                              onClick={() => msg.action && handleExecuteAction(msg.action)}
                              className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#0B2545] via-[#133E70] to-[#0B2545] hover:from-[#133E70] hover:to-[#1D4E89] border border-[#D4AF37]/70 text-[#FFFBEB] rounded-lg text-xs font-classic font-semibold tracking-wide shadow-md transition-all active:scale-95"
                            >
                              <span>{msg.action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#FDE68A]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full mt-1 px-1">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'bot' && msg.modelUsed && (
                        <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300/90 font-mono border border-slate-700/60 flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                          <span>{msg.modelUsed}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#0B2545] border border-[#D4AF37]/60 flex items-center justify-center text-[#FDE68A]">
                      <Sparkles className="w-3 h-3 animate-spin text-[#FDE68A]" />
                    </div>
                    <span className="font-serif italic text-[11px] text-[#E5C158] animate-pulse">
                      {lang === 'hi' ? 'उत्तर तैयार किया जा रहा है...' : 'Crafting intelligent response...'}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Quick Prompt Chips */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  {messages[messages.length - 1].suggestions?.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-[#0B2545] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 text-[10.5px] text-slate-300 hover:text-[#FFFBEB] transition-all shrink-0 active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-slate-900 border-t border-[#D4AF37]/25 flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'मानव की तरह स्वाभाविक रूप से पूछें (उदा. आप कैसे हैं, समय, संदिग्ध कौन है)...'
                      : 'Ask conversationally like a human (e.g. how are you, time, who did it?)...'
                  }
                  className="flex-1 px-3 py-2 bg-slate-950 text-white placeholder-slate-500 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] disabled:opacity-40 disabled:hover:from-[#D4AF37] text-slate-950 font-bold transition-all active:scale-95 shadow-md"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
