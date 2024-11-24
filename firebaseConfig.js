import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, increment,where,query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFB7b842PYfaEgfhvfRHIO1kofVjXEkiQ",
  authDomain: "sustain-earth-temp.firebaseapp.com",
  projectId: "sustain-earth-temp",
  storageBucket: "sustain-earth-temp.firebasestorage.app",
  messagingSenderId: "784005346829",
  appId: "1:784005346829:web:390f25484bffe20a4b8744",
  measurementId: "G-8K7C4XKEPT"
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
