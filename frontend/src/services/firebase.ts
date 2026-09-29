import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export const getEffectiveFirebaseConfig = (): FirebaseWebConfig => {
  try {
    const saved = localStorage.getItem('hackx_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId && !parsed.apiKey.includes('YOUR_')) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDjPeNNrWktZgucHmOc48dMWnam5FB-HFs',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hackx-mrcc.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hackx-mrcc',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hackx-mrcc.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '175664215000',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:175664215000:web:d0fe902e939c9069f7b8ad',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WXX5Y7SWKN',
  };
};

export const saveFirebaseConfigToStorage = (cfg: FirebaseWebConfig): void => {
  localStorage.setItem('hackx_firebase_config', JSON.stringify(cfg));
  app = null;
  auth = null;
};

export const clearStoredFirebaseConfig = (): void => {
  localStorage.removeItem('hackx_firebase_config');
  app = null;
  auth = null;
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getEffectiveFirebaseConfig();
  return Boolean(
    cfg.apiKey &&
    cfg.projectId &&
    cfg.apiKey.trim() !== '' &&
    !cfg.apiKey.includes('YOUR_')
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  const cfg = getEffectiveFirebaseConfig();
  if (!app) {
    app = getApps().length === 0 ? initializeApp(cfg) : getApp();
  }
  if (!auth) {
    auth = getAuth(app);
    auth.languageCode = 'en';
  }
  return auth;
};

// Create or reuse an invisible or visible reCAPTCHA verifier
export const createRecaptchaVerifier = (
  containerId: string = 'recaptcha-container',
  onSolved?: () => void
): RecaptchaVerifier | null => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;

  // Cleanup any existing instance on window
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      if (onSolved) onSolved();
    },
    'expired-callback': () => {
      console.warn('Firebase reCAPTCHA expired, please request OTP again.');
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
};

// Send real SMS OTP to Indian mobile number (+91)
export const sendFirebasePhoneOtp = async (
  rawPhoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase credentials are not configured in .env yet.');
  }

  // Format to E.164 standard: +91XXXXXXXXXX
  const digits = rawPhoneNumber.replace(/\D/g, '');
  const tenDigit = digits.slice(-10);
  const formattedPhone = `+91${tenDigit}`;

  const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
  return confirmationResult;
};
