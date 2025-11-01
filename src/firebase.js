// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFudztlUbWGo25dafq4OP9zMfapuiCNKE",
  authDomain: "habit-tracker-e6226.firebaseapp.com",
  projectId: "habit-tracker-e6226",
  storageBucket: "habit-tracker-e6226.appspot.com", // ✅ исправлено!
  messagingSenderId: "731050282853",
  appId: "1:731050282853:web:68113875d1f2753e45db8c",
  measurementId: "G-LMQB1W4SVH",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, signInWithPopup, signOut, db };
