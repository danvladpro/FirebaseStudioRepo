"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqREgOLG1leZY8ffJpTiQWTqkybVYfzYE",
  authDomain: "studio-7892987648-351fe.firebaseapp.com",
  projectId: "studio-7892987648-351fe",
  storageBucket: "studio-7892987648-351fe.appspot.com",
  messagingSenderId: "477632953392",
  appId: "1:477632953392:web:35f17d200d4a3cb5bfc1f5",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
