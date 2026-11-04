import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, set, get, onValue, push, child } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyANt3E9SexxCVds0TYIaCd_UzAE0oIiDPY",
  authDomain: "cake-urban-new.firebaseapp.com",
  databaseURL: "https://cake-urban-new-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cake-urban-new",
  storageBucket: "cake-urban-new.firebasestorage.app",
  messagingSenderId: "2787213759",
  appId: "1:2787213759:web:610939f1915852a873a10a",
  measurementId: "G-5BT5TG2GVH",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const auth = getAuth(app);
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export const db = getFirestore(app);
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);
export const googleProvider = new GoogleAuthProvider();

export function rtdbRef(dbInst: any, path?: string): any {
  return path ? (ref as any)(dbInst, path) : (ref as any)(dbInst);
}
export {
  ref,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  set,
  get,
  onValue,
  push,
  child,
};


