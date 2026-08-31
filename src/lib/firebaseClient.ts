import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBwAzo5Q5zF-3jLlUI1EplKluK18Jc7kFw",
  authDomain: "cake-urban-275a8.firebaseapp.com",
  databaseURL: "https://cake-urban-275a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cake-urban-275a8",
  storageBucket: "cake-urban-275a8.firebasestorage.app",
  messagingSenderId: "768195606370",
  appId: "1:768195606370:web:8591c3fb6fcbcbe7319e3b",
  measurementId: "G-61TJ7RYSZ1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
