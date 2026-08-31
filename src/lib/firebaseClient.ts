import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, set, get, onValue, push, child } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyANt3E9SexxCVds0TYIaCd_UzAE0oIiDPY",
  authDomain: "cake-urban-new.firebaseapp.com",
  databaseURL: "https://cake-urban-new-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cake-urban-new",
  storageBucket: "cake-urban-new.firebasestorage.app",
  messagingSenderId: "2787213759",
  appId: "1:2787213759:web:610939f1915852a873a10a",
  measurementId: "G-5BT5TG2GVH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize Firebase App Check for verified requests
if (typeof window !== "undefined") {
  if (!(window as any).FIREBASE_APPCHECK_DEBUG_TOKEN) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6Lc2S2gqAAAAAL_placeholder_site_key'),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("App Check init info:", e);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);
export const googleProvider = new GoogleAuthProvider();

export function rtdbRef(dbInst: any, path?: string): any {
  return path ? (ref as any)(dbInst, path) : (ref as any)(dbInst);
}
export { ref, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, set, get, onValue, push, child };

