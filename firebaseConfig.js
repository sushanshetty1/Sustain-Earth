import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, increment,where,query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBv7k3_r05x8CdecvF3jRpWuO7H8YwrA_g",
  authDomain: "sustain-earth-2.firebaseapp.com",
  projectId: "sustain-earth-2",
  storageBucket: "sustain-earth-2.firebasestorage.app",
  messagingSenderId: "1060845954082",
  appId: "1:1060845954082:web:a287f7fd507bf88646d67b",
  measurementId: "G-YD8LRRX3JE"
};

let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase app:", error);
}

let db;
try {
  db = getFirestore(firebaseApp);
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

let analytics = null;
const initializeAnalytics = async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(firebaseApp);
      } else {
        console.warn("Firebase Analytics is not supported in this environment.");
      }
    } catch (error) {
      console.error("Error checking Analytics support:", error);
    }
  }
};

initializeAnalytics();

export { firebaseApp, db, analytics, auth, storage, collection, addDoc, getDocs, updateDoc, doc, increment, where ,query};
