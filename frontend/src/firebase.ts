// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "mentorship-matching-a2654.firebaseapp.com",
  projectId: "mentorship-matching-a2654",
  storageBucket: "mentorship-matching-a2654.firebasestorage.app",
  messagingSenderId: "30047532584",
  appId: "1:30047532584:web:67afe91c3581417059671d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);