import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "matador-9c3a8.firebaseapp.com",
  projectId: "matador-9c3a8",
  storageBucket: "matador-9c3a8.appspot.com",
  messagingSenderId: "56384839324",
  appId: "1:56384839324:web:4ed0ce0beaa6b7cd791759",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
