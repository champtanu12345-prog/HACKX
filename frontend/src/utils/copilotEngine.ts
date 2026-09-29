/**
 * HACKX — Maritime Intelligence Copilot Knowledge & Intent Engine
 * "सागर मित्र | Sagar Mitra" — Autonomous ICG Tactical Assistant
 *
 * Provides real-time context-aware answers, human-like natural conversation,
 * maritime law references (BSA 2023 / MARPOL / MSA), scientific physics explanations (RK4, ADIOS),
 * and UI action dispatching.
 */

import { MaritimeScenario } from '../data/maritimeDemoData';
import { NavView } from '../components/shell/Sidebar';
import { sendCopilotQuery } from '../api/client';

export interface CopilotAction {
  type: 'NAVIGATE' | 'OPEN_DOSSIER' | 'START_TOUR' | 'SWITCH_SCENARIO' | 'SELECT_VESSEL';
  targetView?: NavView;
  scenarioId?: 'scenario_a' | 'scenario_b' | 'scenario_c';
  vesselId?: string;
  label: string;
}

export interface CopilotResponse {
  text: string;
  action?: CopilotAction;
  suggestions: string[];
  modelUsed?: string;
}

/**
 * Async AI Generation: Tries the intelligent backend endpoint (/api/v1/copilot/chat) first,
 * maintaining multi-turn conversational context with external LLM or backend NLU,
 * and seamlessly falls back to the rich client-side engine if offline.
 */
export async function generateCopilotResponseAsync(
  query: string,
  scenario: MaritimeScenario,
  currentView: NavView,
  lang: 'en' | 'hi' = 'en',
  history: Array<{ role: string; content: string }> = []
): Promise<CopilotResponse> {
  try {
    const res = await sendCopilotQuery({
      query,
      scenario_id: scenario.id,
      current_view: currentView,
      lang,
      history,
      scenario_context: {
        spillArea: scenario.spill.areaSqKm,
        confidence: scenario.spill.confidence,
        topSuspect: scenario.vessels[0]?.name,
        region: scenario.region,
      },
    });

    if (res && res.reply) {
      let action: CopilotAction | undefined = undefined;
      if (res.action) {
        action = {
          type: res.action.type as any,
          targetView: res.action.target_view as any,
          scenarioId: res.action.scenario_id as any,
          vesselId: res.action.vessel_id,
          label: res.action.label,
        };
      }
      return {
        text: res.reply,
        action,
        suggestions: res.suggestions && res.suggestions.length > 0 ? res.suggestions : [
          lang === 'hi' ? 'मुख्य संदिग्ध कौन है?' : 'Who is the prime suspect?',
          lang === 'hi' ? 'समय एवं दिनांक क्या है?' : 'What time is it in IST?',
          lang === 'hi' ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
        ],
        modelUsed: res.model_used,
      };
    }
  } catch (err) {
    // Smooth fallback to local intelligent conversational engine
    console.debug('Backend copilot endpoint offline or timed out, using intelligent local engine:', err);
  }

  return generateCopilotResponse(query, scenario, currentView, lang);
}

/**
 * Synchronous / Local Intelligent Conversational Engine
 * Formatted with warm, polite, and articulate human prose.
 */
export function generateCopilotResponse(
  query: string,
  scenario: MaritimeScenario,
  currentView: NavView,
  lang: 'en' | 'hi' = 'en'
): CopilotResponse {
  const q = query.trim().toLowerCase();
  const isHi = lang === 'hi';

  const topVessel = scenario.vessels[0];
  const secondVessel = scenario.vessels[1];

  // 0A. SMALL TALK / WELL-BEING ("How are you?", "How are you doing?", "How's your day?")
  if (
    q.includes('how are you') ||
    q.includes('how are u') ||
    q.includes('how do you do') ||
    q.includes('how are you doing') ||
    q.includes('how are you feeling') ||
    q.includes('how is your day') ||
    q.includes('hows your day') ||
    q.includes('whats up') ||
    q.includes("what's up") ||
    q.includes('doing today') ||
    q.includes('feeling today') ||
    q.includes('आप कैसे हैं') ||
    q.includes('क्या हाल है') ||
    q.includes('सब ठीक') ||
    q.includes('kaise ho')
  ) {
    const textEn = `Hello! I'm doing really well, thank you for asking! The surveillance radar feeds are operational and the ocean hydrodynamics models are tracking smoothly on our watch.

How are things going on your end today? Whether you're here to run an investigation or just taking a breather between shifts, feel free to ask me anything!`;

    const textHi = `नमस्ते! मैं बिल्कुल सतर्क और ठीक हूँ, पूछने के लिए बहुत-बहुत धन्यवाद! हमारी रडार निगरानी और एआईएस नेटवर्क सक्रिय हैं।

आप बताइए, आज आपकी ड्यूटी कैसी चल रही है? क्या आप किसी विशेष मामले की जांच करना चाहते हैं?`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the prime suspect?',
        isHi ? 'RK4 बहाव मॉडल समझाइए' : 'Explain RK4 drift simulation',
        isHi ? 'एक चुटकुला सुनाइए' : 'Tell me a joke',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 0B. CASUAL GREETINGS & NAMASTE
  if (
    /^(hi|hello|hey|namaste|morning|afternoon|evening|howdy|sup)[\s!.,?]*$/i.test(q) ||
    q.startsWith('hello') ||
    q.startsWith('hi ') ||
    q.startsWith('hey ') ||
    q === 'नमस्ते' ||
    q === 'हेलो'
  ) {
    const textEn = `Hello there! I'm **Sagar Mitra**, your AI operations assistant for the Indian Coast Guard HACKX platform.

I'm here to chat about anything on your mind—from tracking down suspicious rogue tankers and explaining ocean drift equations, to checking current times or exploring our satellite radar passes. How are you doing today, and how can I help?`;

    const textHi = `नमस्ते! मैं **सागर मित्र** हूँ — भारतीय तटरक्षक बल (HACKX) का AI समुद्री साथी।

मैं आपकी किसी भी जांच, तेल रिसाव डेटा, बहाव भौतिकी या सामान्य प्रश्नों में सहायता करने के लिए यहाँ मौजूद हूँ। आप कैसे हैं, और आज मैं आपके लिए क्या कर सकता हूँ?`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who caused the oil spill?',
        isHi ? 'आज का समय और तारीख?' : "What is today's time & date?",
        isHi ? 'मार्गदर्शित दौरा शुरू करें' : 'Start Guided Tour',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 0C. REAL-TIME DATE, TIME & TACTICAL CLOCK QUERY
  const isTimeQuery =
    /\b(time|date|clock|calendar|ist|utc|hour|current time|what time|what date|which date)\b/i.test(q) ||
    q.includes('समय') ||
    q.includes('तारीख') ||
    q.includes('घड़ी') ||
    q.includes('घड़ी') ||
    q.includes('वक्त') ||
    q.includes('कितने बजे');

  if (isTimeQuery) {
    const now = new Date();
    const istTimeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);

    const istDateStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const utcTimeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
    const utcDateStr = `${pad(now.getUTCDate())}-${pad(now.getUTCMonth() + 1)}-${now.getUTCFullYear()}`;

    const textEn = `Good day! It is currently **${istTimeStr}** Indian Standard Time (IST) on **${istDateStr}**.

In Universal Coordinated Time, that translates to **${utcTimeStr}** (${utcDateStr}). Our Coast Guard station is synchronized with MRCC Mumbai. The satellite acquisition for our active scenario was captured at **${scenario.spill.acquisitionTime} UTC** over the **${scenario.region}** sector. Let me know if you would like me to review any operational timelines!`;

    const textHi = `नमस्ते! वर्तमान भारतीय मानक समय (IST) के अनुसार **${istTimeStr}** हुए हैं, और आज **${istDateStr}** है।

सार्वभौमिक समय (UTC) के अनुसार यह **${utcTimeStr}** (${utcDateStr}) है। हमारा समय मुंबई स्थित तटरक्षक समुद्री बचाव समन्वय केंद्र (MRCC) से समन्वयित है। मौजूदा परिदृश्य का उपग्रह डेटा **${scenario.spill.acquisitionTime} UTC** पर लिया गया था।`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the prime suspect?',
        isHi ? 'स्लिक की आयु क्या है?' : 'What is the slick age?',
        isHi ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 0D. HUMOR & JOKES ("Tell me a joke", "Make me laugh")
  if (
    q.includes('joke') ||
    q.includes('funny') ||
    q.includes('laugh') ||
    q.includes('मजाक') ||
    q.includes('चुटकुला')
  ) {
    const textEn = `Haha, absolutely! Here is one from the naval wardroom:

*Why did the rogue oil tanker captain refuse to play hide-and-seek with the Indian Coast Guard?*

Because between our **Sentinel-1 Synthetic Aperture Radar** and **Lagrangian reverse-drift models**, he knew there was *literally nowhere to hide on the seven seas!* 😄⚓

Keeping morale high is rule number one on watch duty!`;

    const textHi = `हाहा, बिल्कुल! एक नाविक वाला चुटकुला सुनिए:

एक बार एक संदिग्ध जहाज का कैप्टन अपने साथी से बोला — *"अरे जल्दी भागो, वो ऊपर देखो!"*
साथी बोला — *"क्या हुआ कैप्टन, तटरक्षक का हेलीकॉप्टर आ गया क्या?"*
कैप्टन बोला — *"नहीं, सागर मित्र का उपग्रह रडार बादलों के आर-पार भी हमें 4K में देख रहा है!"* 😄⚓

मुस्कुराते रहिए, हमारी तटरक्षक टीम 24 घंटे सतर्क है!`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the prime suspect?',
        isHi ? 'वर्तमान समय क्या है?' : 'What time is it right now?',
        isHi ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 0E. GRATITUDE & POLITE PRAISE ("Thank you", "You're great", "Good job")
  if (
    q.includes('thank') ||
    q.includes('thanks') ||
    q.includes('awesome') ||
    q.includes('great job') ||
    q.includes('good bot') ||
    q.includes('धन्यवाद') ||
    q.includes('शुक्रिया')
  ) {
    const textEn = `You're very welcome! It's an honor to assist you. Protecting India's Exclusive Economic Zone (EEZ) and holding environmental violators accountable is what I'm built for.

Let me know whenever you're ready to inspect candidate vessels, review hydrodynamics, or prepare court documents!`;

    const textHi = `आपका बहुत-बहुत धन्यवाद! देश के समुद्री जल को स्वच्छ रखने और जांच में आपकी सहायता करना मेरा कर्तव्य है। 

जब भी आपको किसी उपग्रह रिपोर्ट या विधिक साक्ष्य की जरूरत हो, मुझे बताइएगा!`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
        isHi ? 'संदिग्ध जहाज दिखाएं' : 'Show Candidate Vessels',
        isHi ? 'हिंडकास्ट सिमुलेशन चलाएं' : 'Run Drift Hindcast',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 0F. IDENTITY / SYSTEM STATUS / ABOUT QUERY
  if (
    q.includes('who are you') ||
    q.includes('who created you') ||
    q.includes('what are you') ||
    q.includes('what is hackx') ||
    q.includes('about you') ||
    q.includes('what is sagar mitra') ||
    q.includes('आप कौन हैं') ||
    q.includes('किसने बनाया') ||
    q.includes('परिचय')
  ) {
    const textEn = `I am **Sagar Mitra (सागर मित्र)** — which translates from Sanskrit to *"Friend of the Ocean"*. 

I serve as the autonomous AI tactical copilot developed for the Indian Coast Guard and maritime enforcement authorities under project **HACKX (Smart India Hackathon 2026, Problem Statement: SIH 260143)**.

My role is to connect the dots across:
1. **Satellite Radar**: Detecting dark slick patches with Sentinel-1 SAR and calculating volume with the Bonn agreement (BAOAC).
2. **Reverse Ocean Physics**: Running 4th-Order Runge-Kutta (**RK4**) reverse-drift hindcasting to reconstruct release points.
3. **4D AIS Spatiotemporal Correlation**: Identifying dark vessels that turned off their transponders or decelerated right over the slick locus.
4. **Court-Admissible Evidence**: Generating digitally hashed legal dossiers certified under **Section 63 of Bharatiya Sakshya Adhiniyam (BSA) 2023** and **Section 356J Merchant Shipping Act 1958**.

I'm programmed to chat with you just like a friendly operations officer on duty!`;

    const textHi = `मैं **सागर मित्र** हूँ — भारतीय तटरक्षक और समुद्री कानून प्रवर्तन हेतु विकसित स्वायत्त एआई साथी (**HACKX / SIH 260143**)।

मेरा मुख्य कार्य:
1. उपग्रह सिंथेटिक एपर्चर रडार (SAR) से तेल रिसाव की पहचान।
2. चौथे क्रम के रूंगे-कुट्टा (RK4) मॉडल द्वारा रिसाव के मूल समय व स्थान का रिवर्स-ट्रैकिंग (हिंडकास्ट)।
3. 4D एआईएस डेटा द्वारा संदिग्ध जहाजों (डार्क शिप विसंगतियों) की पहचान।
4. भारतीय साक्ष्य अधिनियम 2023 (धारा 63) के तहत अदालती साक्ष्य प्रमाण पत्र तैयार करना।`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'आज का समय और तारीख?' : "What is today's time & date?",
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the prime suspect?',
        isHi ? 'मार्गदर्शित दौरा शुरू करें' : 'Start Guided Tour',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 1. TOP SUSPECT / ATTRIBUTION QUERY
  if (
    q.includes('suspect') ||
    q.includes('culprit') ||
    q.includes('who spilled') ||
    q.includes('who is guilty') ||
    q.includes('who did') ||
    q.includes('who caused') ||
    q.includes('responsible') ||
    q.includes('tanker') ||
    q.includes('arabian star') ||
    q.includes('संदिग्ध') ||
    q.includes('दोषी') ||
    q.includes('किसने किया')
  ) {
    const textEn = `Based on our multi-criteria spatial-temporal reconstruction, our prime suspect is **${topVessel?.name || 'MT ARABIAN STAR'}** (${topVessel?.vesselType || 'Crude Oil Tanker'}, Flag: ${topVessel?.flag || 'Panama'}).

**Why is this vessel the prime suspect?**
• **Correlation Score**: **${topVessel?.suspicionScore.toFixed(1) || '94.2'} / 100** (HIGH CONFIDENCE)
• **Closest Point of Approach (CPA)**: Came within **0.8 nautical miles** of the computed slick origin centroid.
• **Maneuver Anomaly**: Abruptly decelerated from **14.2 knots to 8.1 knots** during the discharge window (indicative of engine desludging or tank washing).
• **AIS Blackout**: Recorded an unnotified **42-minute dark transponder gap** precisely over the slick origin coordinates.

By contrast, second candidate **${secondVessel?.name || 'CHEM TIGER'}** scored only **${secondVessel?.suspicionScore.toFixed(1) || '34.8'}%** because its track was down-drift by 18 nautical miles. Would you like me to open the legal dossier or suspect matrix?`;

    const textHi = `हमारे 4D स्थानिक-सामयिक विश्लेषण के अनुसार, मुख्य संदिग्ध **${topVessel?.name || 'MT ARABIAN STAR'}** (${topVessel?.flag || 'पनामा'}) है।

**साक्ष्य सारांश:**
• **दायित्व स्कोर**: **${topVessel?.suspicionScore.toFixed(1) || '94.2'} / 100** (उच्चतम संभावना)
• **दूरी (CPA)**: रिसाव के मूल स्थान से मात्र **0.8 नॉटिकल मील**।
• **गति विसंगति**: गति में 14.2 से 8.1 नॉटिकल मील की अप्रत्याशित गिरावट।
• **डार्क शिप गैप**: रिसाव खिड़की के दौरान 42 मिनट के लिए AIS ट्रांसपोंडर बंद रखा गया।

क्या आप विधिक साक्ष्य डोजियर का निरीक्षण करना चाहेंगे?`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'NAVIGATE',
        targetView: 'attribution',
        label: isHi ? 'संदिग्ध विश्लेषण देखें' : 'View Attribution Matrix',
      },
      suggestions: [
        isHi ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
        isHi ? 'केम टाइगर क्यों निर्दोष है?' : 'Why is Chem Tiger cleared?',
        isHi ? 'ड्रिफ्ट हिंडकास्ट देखें' : 'Show Drift Hindcast',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 2. SLICK AGE, ORIGIN & GEOMETRY
  if (
    q.includes('age') ||
    q.includes('origin') ||
    q.includes('when was it spilled') ||
    q.includes('how old') ||
    q.includes('area') ||
    q.includes('size') ||
    q.includes('volume') ||
    q.includes('आयु') ||
    q.includes('उत्पत्ति') ||
    q.includes('क्षेत्रफल') ||
    q.includes('मात्रा')
  ) {
    const textEn = `**Hydrocarbon Slick Characterisation & Release Age:**

• **Estimated Slick Age**: **~9.5 to 11.2 Hours** prior to Sentinel-1 SAR acquisition.
• **Calculated Origin Time**: **14-Sep-2026 02:40 UTC** (08:10 AM IST).
• **Estimated Release Locus**: **18.974° N, 72.392° E** (Uncertainty radius: $\\pm 1.8\\text{ km}$).
• **Surface Slick Area**: **${scenario.spill.areaSqKm} km²** with centroid at **${scenario.spill.centroid[0].toFixed(3)}°N, ${scenario.spill.centroid[1].toFixed(3)}°E**.
• **Discharge Volume (BAOAC Code 3-4)**: **~${scenario.spill.estimatedVolumeM3 || 42.6} m³** of medium crude oil.`;

    const textHi = `**तेल रिसाव के लक्षण एवं आयु आकलन:**

• **अनुमानित रिसाव आयु**: उपग्रह अवलोकन से लगभग **9.5 से 11.2 घंटे पूर्व**।
• **रिसाव का मूल समय**: **14 सितंबर 2026, 02:40 UTC** (सुबह 08:10 IST)।
• **रिसाव केंद्र बिंदु**: **18.974° N, 72.392° E** (सटीकता: $\\pm 1.8$ किमी)।
• **सतही क्षेत्रफल**: **${scenario.spill.areaSqKm} वर्ग किमी**।
• **अनुमानित मात्रा (Bonn IMO Code 3-4)**: **~${scenario.spill.estimatedVolumeM3 || 42.6} घन मीटर**।`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'NAVIGATE',
        targetView: 'spills',
        label: isHi ? 'रिसाव पहचान विंडो खोलें' : 'Open Spill Detection',
      },
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the top suspect?',
        isHi ? 'ड्रिफ्ट मॉडल समझाइए' : 'Explain Drift Physics',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 3. DRIFT PHYSICS & LAGRANGIAN RK4
  if (
    q.includes('drift') ||
    q.includes('rk4') ||
    q.includes('euler') ||
    q.includes('runge') ||
    q.includes('hindcast') ||
    q.includes('forecast') ||
    q.includes('physics') ||
    q.includes('बहाव') ||
    q.includes('हिंडकास्ट')
  ) {
    const textEn = `**Lagrangian Hydrodynamic Drift Engine (RK4 vs Euler):**

How our reverse trajectory simulation works in plain terms:
1. **Forcing Vectors**: Oil moves through a vector sum:
   $$\\vec{U}_{\\text{total}} = \\vec{U}_{\\text{current}} + 0.035 \\times \\vec{U}_{\\text{wind}} + \\vec{U}_{\\text{diffusion}}$$
   - Surface ocean currents provide **100%** transport.
   - 10m surface wind exerts **3.5%** leeway factor with a **20° Coriolis deflection** to the right in the Northern Hemisphere.

2. **Why 4th-Order Runge-Kutta (RK4)?**:
   - Standard 1st-Order **Euler** integration assumes velocity remains constant over the whole timestep, which produces severe truncation error in curving coastal eddies.
   - **RK4** computes 4 weighted velocity probes per timestep ($k_1, k_2, k_3, k_4$), keeping positioning uncertainty below $\\pm 1.8\\text{ km}$ over a 12-hour hindcast!`;

    const textHi = `**लाग्रेंजियन महासागरीय बहाव मॉडल (RK4 बनाम यूलर):**

हमारा रिवर्स प्रक्षेपवक्र सिमुलेशन कैसे काम करता है:
1. **बहाव गतिशीलता**: तेल दो प्रमुख शक्तियों के योग से बहता है:
   - **महासागरीय धाराएँ**: 100% वेग संचरण।
   - **सतही पवन**: हवा की गति का 3.5% हिस्सा, जो कोरिओलिस बल के कारण 20° दाहिनी ओर मुड़ता है।
2. **RK4 का महत्व**: साधारण यूलर मॉडल तीव्र घुमावदार धाराओं में गलत परिणाम देता है। हमारा 4th-Order Runge-Kutta मॉडल प्रति चरण 4 परीक्षण बिंदुओं का औसत लेकर उप-किलोमीटर सटीकता सुनिश्चित करता है।`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'NAVIGATE',
        targetView: 'drift',
        label: isHi ? 'ड्रिफ्ट सिमुलेशन खोलें' : 'Open Drift Workspace',
      },
      suggestions: [
        isHi ? 'सिमुलेशन चलाएं' : 'Run 12h Hindcast',
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the top suspect?',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 4. ENVIRONMENTAL DAMAGE & RECOVERY
  if (
    q.includes('harmful') ||
    q.includes('damage') ||
    q.includes('environment') ||
    q.includes('fish') ||
    q.includes('coral') ||
    q.includes('clean') ||
    q.includes('pollution') ||
    q.includes('नुकसान') ||
    q.includes('पर्यावरण')
  ) {
    const textEn = `**Environmental & Socio-Economic Impact Analysis:**

When crude oil is discharged in coastal waters, it produces acute and long-term consequences:
• **Marine Organisms**: Toxic polycyclic aromatic hydrocarbons (PAHs) smother fish gills, destroy plankton nurseries, and accumulate in commercial fisheries.
• **Mangrove Estuaries**: If oil reaches the Maharashtra/Gujarat coastline, it coats pneumatophore breathing roots of mangrove trees, causing irreversible mangrove mortality.
• **Coast Guard Response Protocol**: Our Maritime Rescue Coordination Centre (MRCC) coordinates pollution response vessels (like *ICGS Samudra Prahari*) armed with oleophilic skimmers, ocean booms, and approved dispersants.`;

    const textHi = `**पर्यावरणीय एवं सामाजिक-आर्थिक प्रभाव:**

समुद्र में कच्चा तेल फैलने के गंभीर परिणाम होते हैं:
• **जलीय जीवन पर प्रभाव**: तेल की परत ऑक्सीजन के आदान-प्रदान को रोक देती है जिससे मछलियां और प्रवाल भित्तियां (कोरल) नष्ट हो जाती हैं।
• **तटीय मैंग्रोव वन**: तेल मैंग्रोव की श्वसन जड़ों को ढक देता है, जिससे तटीय जैव विविधता को अपूरणीय क्षति पहुंचती है।
• **तटरक्षक प्रतिक्रिया**: भारतीय तटरक्षक के विशेष प्रदूषण निवारण जहाज बूम्स और स्किमर्स की मदद से तेल को पानी से अलग करते हैं।`;

    return {
      text: isHi ? textHi : textEn,
      suggestions: [
        isHi ? 'विधिक जुर्माना क्या है?' : 'What are the legal fines?',
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the top suspect?',
        isHi ? 'सामरिक अलर्ट प्रेषित करें' : 'Transmit Tactical Alert',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 5. LEGAL FRAMEWORK & COURT ADMISSIBILITY
  if (
    q.includes('legal') ||
    q.includes('court') ||
    q.includes('law') ||
    q.includes('bsa') ||
    q.includes('section 63') ||
    q.includes('msa') ||
    q.includes('fine') ||
    q.includes('penalty') ||
    q.includes('marpol') ||
    q.includes('कानूनी') ||
    q.includes('विधिक') ||
    q.includes('जुर्माना')
  ) {
    const textEn = `**Indian Maritime Law & Forensic Court Admissibility:**

1. **Bharatiya Sakshya Adhiniyam (BSA), 2023 — Section 63**:
   - Replaced Section 65B of the Indian Evidence Act, 1872.
   - Our system automatically generates an official Section 63 electronic certificate with **SHA-256 cryptographic hashes** of all raw satellite imagery, NMEA AIS packets, and drift outputs.

2. **Merchant Shipping Act, 1958 — Section 356J & Part XIA**:
   - Authorizes the Indian Coast Guard to issue a statutory detention notice against the polluting vessel.
   - Imposes mandatory cleanup cost recovery plus environmental security bonds exceeding **₹15,00,00,000 (~$1.8M USD)** before the ship is permitted to leave port.`;

    const textHi = `**भारतीय समुद्री कानून एवं न्यायिक साक्ष्य प्रमाण पत्र:**

1. **भारतीय साक्ष्य अधिनियम (BSA) 2023 — धारा 63**:
   - पूर्ववर्ती 65B IEA के स्थान पर लागू। प्रत्येक डिजिटल साक्ष्य, उपग्रह चित्र व AIS लॉग को **SHA-256 क्रिप्टोग्राफिक हैश** के साथ अदालत में प्रस्तुत किया जाता है।

2. **मर्चेंट शिपिंग एक्ट 1958 — धारा 356J**:
   - भारतीय तटरक्षक को जहाज को बंदरगाह पर रोकने (Detention Notice) और ₹15 करोड़ से अधिक का सफाई खर्च व बैंक गारंटी वसूलने का कानूनी अधिकार देती है।`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'OPEN_DOSSIER',
        label: isHi ? 'विधिक डोजियर खोलें' : 'Open Legal Dossier',
      },
      suggestions: [
        isHi ? 'अदालती PDF निर्यात करें' : 'Export Court PDF',
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the top suspect?',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 6. SATELLITE RADAR & SAR TECHNOLOGY
  if (
    q.includes('satellite') ||
    q.includes('sar') ||
    q.includes('sentinel') ||
    q.includes('radar') ||
    q.includes('उपग्रह') ||
    q.includes('रडार')
  ) {
    const textEn = `**Satellite Radar (SAR) Oil Slick Detection:**

Why Synthetic Aperture Radar (SAR) is indispensable for maritime enforcement:
• **Monsoon & Night Capability**: Unlike optical cameras that need daylight and cloudless skies, C-band SAR (5.4 GHz) penetrates monsoon clouds and operates at midnight.
• **Capillary Damping**: Oil dampens ocean wind-ripples. Clean sea backscatters microwave signals (bright grey), while smooth oil patches bounce radar away, creating a high-contrast dark footprint!
• **Wind Gating**: False positives (calm water or algae) are automatically ruled out if 10m surface winds exceed 2.5 m/s.`;

    const textHi = `**उपग्रह रडार (SAR) द्वारा तेल रिसाव की पहचान:**

सिंथेटिक एपर्चर रडार (SAR) बादलों और अंधेरी रात में भी समुद्र की सतह पर तेल की पहचान कर सकता है। तेल की परत समुद्री सूक्ष्म लहरों को शांत कर देती है, जिससे रडार पर तेल एक स्पष्ट काले धब्बे (dark patch) के रूप में दिखाई देता है।`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'NAVIGATE',
        targetView: 'spills',
        label: isHi ? 'रिसाव पहचान विंडो खोलें' : 'Open Spill Detection',
      },
      suggestions: [
        isHi ? 'मुख्य संदिग्ध कौन है?' : 'Who is the top suspect?',
        isHi ? 'स्लिक की आयु क्या है?' : 'What is the slick age?',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 7. GUIDED TOUR / HELP
  if (
    q.includes('tour') ||
    q.includes('help') ||
    q.includes('guide') ||
    q.includes('दौरा') ||
    q.includes('मदद')
  ) {
    const textEn = `**ICG Guided Evaluator Tour:**
Would you like a step-by-step interactive walkthrough of the entire 4-stage pipeline?

1. **Satellite SAR Detection** $\\to$ 2. **RK4 Drift Hindcasting** $\\to$ 3. **AIS Correlation** $\\to$ 4. **Legal Dossier Export**.`;

    const textHi = `**मार्गदर्शित मूल्यांकन दौरा:**
क्या आप संपूर्ण 4-चरणीय पाइपलाइन का स्वचालित व संवादात्मक दौरा शुरू करना चाहते हैं?

1. **उपग्रह SAR पहचान** $\\to$ 2. **RK4 ड्रिफ्ट हिंडकास्ट** $\\to$ 3. **AIS सहसंबंध** $\\to$ 4. **विधिक डोजियर निर्यात**।`;

    return {
      text: isHi ? textHi : textEn,
      action: {
        type: 'START_TOUR',
        label: isHi ? 'मूल्यांकन दौरा शुरू करें' : 'Start Evaluator Tour',
      },
      suggestions: [
        isHi ? 'मुख्य संदिग्ध दिखाएं' : 'Show Top Suspect',
        isHi ? 'ड्रिफ्ट मॉडल समझाइए' : 'Explain Drift Physics',
      ],
      modelUsed: 'sagar-mitra-nlu-local',
    };
  }

  // 8. OPEN-ENDED CONVERSATIONAL HUMAN FALLBACK
  const defaultEn = `I hear you! As your maritime operations partner, I'm tuned to assist with real-time situational awareness, tracking down polluting vessels, explaining ocean physics, or answering general questions.

Feel free to ask me anything in plain English or Hindi—whether it's the current time and watch schedule, details on why **${topVessel?.name || 'MT ARABIAN STAR'}** is flagged as our prime suspect, or how our Lagrangian RK4 model works. What would you like to explore next?`;

  const defaultHi = `मैं आपकी बात समझ रहा हूँ! एक परिचालन सहायक के रूप में, मैं समुद्र की सुरक्षा, तेल रिसाव की पहचान, संदिग्ध जहाजों की ट्रैकिंग और कानूनी दस्तावेजों में आपकी पूरी मदद कर सकता हूँ।

आप मुझसे वर्तमान समय, तारीख, किसी विशिष्ट जहाज के इतिहास, या महासागरीय बहाव सिमुलेशन के बारे में कुछ भी पूछ सकते हैं। बताइए, आप किस विषय में विस्तार से जानना चाहते हैं?`;

  return {
    text: isHi ? defaultHi : defaultEn,
    suggestions: [
      isHi ? '🚨 मुख्य संदिग्ध कौन है?' : '🚨 Who is the prime suspect?',
      isHi ? '🕒 आज का समय और तारीख?' : "🕒 What is today's time & date?",
      isHi ? '🌊 RK4 ड्रिफ्ट मॉडल समझाइए' : '🌊 Explain RK4 Drift',
      isHi ? '📜 विधिक डोजियर खोलें' : '📜 Open Legal Dossier',
    ],
    modelUsed: 'sagar-mitra-nlu-local',
  };
}
