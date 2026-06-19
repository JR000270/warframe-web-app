// Import the needed functions from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
//the web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  //apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  apiKey: "AIzaSyDLgfkKYhZb91fFl5m1CqbkYvdyj7lvoMY",
  authDomain: "warframe-world-data.firebaseapp.com",
  projectId: "warframe-world-data",
  storageBucket: "warframe-world-data.firebasestorage.app",
  messagingSenderId: "907961499205",
  appId: "1:907961499205:web:de04e3182340bf3a512d2c",
  measurementId: "G-PK4WBHGKHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// This creates the 'db' variable and makes it available to Dashboard.jsx
export const db = getFirestore(app);
// user authentication
export const auth = getAuth(app);