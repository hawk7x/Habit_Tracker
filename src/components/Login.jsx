import React, { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore"; // adding
import { db } from "../firebase"; // adding
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Function creates a profile in Firestore, if there is no 
  async function ensureUserProfile(user) {
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await ensureUserProfile(user); // creating a profile
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Email login / register
  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const userCredential = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      await ensureUserProfile(user); // creating a profile
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="login-subtitle">
          {isRegister ? "Join the journey of habits 💪" : "Track your habits daily 🌱"}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleEmailLogin} disabled={loading}>
          {loading ? "Loading..." : isRegister ? "Sign Up" : "Login"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <p
          className="toggle-text"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}
