// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3iUXzJOIPkvh9wccK6Uj5dACgujsSgFM",
  authDomain: "darb-6ba2b.firebaseapp.com",
  projectId: "darb-6ba2b",
  storageBucket: "darb-6ba2b.appspot.com",
  messagingSenderId: "958668176380",
  appId: "1:958668176380:web:264a214711a7bc1722d079"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;