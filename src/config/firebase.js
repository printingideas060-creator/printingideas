import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxSXGuqmbxs3Ep0GJ8YPIsydGCq_Ml8ig",
  authDomain: "printing-ideas-8623f.firebaseapp.com",
  projectId: "printing-ideas-8623f",
  storageBucket: "printing-ideas-8623f.firebasestorage.app",
  messagingSenderId: "285599919705",
  appId: "1:285599919705:web:9a77ca1a8223f1c4508b48",
  measurementId: "G-Z2M0WN4QBQ",
};

export function connectFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
