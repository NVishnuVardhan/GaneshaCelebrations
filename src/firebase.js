import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDztQfH6SITDuMYYH5pxGZEA1PA19XAaQo",
  authDomain: "ganeshaliberty-d6b4f.firebaseapp.com",
  projectId: "ganeshaliberty-d6b4f",
  storageBucket: "ganeshaliberty-d6b4f.firebasestorage.app",
  messagingSenderId: "734478968038",
  appId: "1:734478968038:web:d53bfb063e2144ab87c727",
  measurementId: "G-PCV7ZH8S2K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
