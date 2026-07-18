import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTj3H2F_LST8E1tPFzXGILMtXYkFKl8sA",
  authDomain: "studynova-8120d.firebaseapp.com",
  projectId: "studynova-8120d",
  storageBucket: "studynova-8120d.firebasestorage.app",
  messagingSenderId: "729632875242",
  appId: "1:729632875242:web:c541277ef3a265b2bbad93",
  measurementId: "G-KFRVMNS0LH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);