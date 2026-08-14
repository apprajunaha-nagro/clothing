import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  Auth
} from "firebase/auth";

// Your Firebase web app configuration loaded securely from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App singleton safely inside try/catch
let appInstance: any = null;
try {
  if (firebaseConfig.apiKey) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
} catch (err) {
  console.error("Firebase init failed gracefully:", err);
}

export const app = appInstance;
export const auth: Auth | null = app ? getAuth(app) : null;

// Helper to set up unseen / invisible Recaptcha Verifier
export const setupRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier | null => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized. Please set VITE_FIREBASE_API_KEY in .env");
    return null;
  }

  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Could not clear existing recaptcha verifier:", e);
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with submit
    },
    'expired-callback': () => {
      console.warn("Recaptcha expired");
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Send OTP to phone number using Firebase Auth
 * @param phoneNumber Phone number in E.164 format e.g. "+919876543210"
 * @param recaptchaVerifier RecaptchaVerifier instance
 */
export const sendPhoneOtp = async (
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier | null
): Promise<ConfirmationResult | null> => {
  if (!auth || !recaptchaVerifier) {
    throw new Error("Firebase Auth is not configured. Please add your fresh Firebase API key to .env");
  }

  // Ensure phone number starts with +91 if user only entered 10 digits
  let formattedPhone = phoneNumber.trim();
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`;
    } else {
      formattedPhone = `+${formattedPhone}`;
    }
  }

  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
  return confirmationResult;
};
