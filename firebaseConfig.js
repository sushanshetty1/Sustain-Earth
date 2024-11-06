import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyBv7k3_r05x8CdecvF3jRpWuO7H8YwrA_g",
  authDomain: "sustain-earth-2.firebaseapp.com",
  projectId: "sustain-earth-2",
  storageBucket: "sustain-earth-2.firebasestorage.app",
  messagingSenderId: "1060845954082",
  appId: "1:1060845954082:web:a287f7fd507bf88646d67b",
  measurementId: "G-YD8LRRX3JE"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Analytics (conditionally)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);  // Async initialization
    } else {
      console.warn("Firebase Analytics is not supported in this environment.");
    }
  }).catch(error => {
    console.error("Error checking Analytics support:", error);
  });
}

export { app, db, analytics, auth };
