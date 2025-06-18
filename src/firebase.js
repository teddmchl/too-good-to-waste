import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQDvt_3eFTcD7e4XoSWz_UIFqo3xs3Rag",
  authDomain: "food-redistribution-plat-116ef.firebaseapp.com",
  projectId: "food-redistribution-plat-116ef",
  storageBucket: "food-redistribution-plat-116ef.firebasestorage.app",
  messagingSenderId: "811509281826",
  appId: "1:811509281826:web:37c85f355376840f1f467b",
  measurementId: "G-QZG0MFK817",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };
export const db = getFirestore(app);
