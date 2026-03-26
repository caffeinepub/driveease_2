import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDosJWyRjTFNGknJzQ6KLbddr666RPRBS0",
  authDomain: "driveease-66a6b.firebaseapp.com",
  projectId: "driveease-66a6b",
  storageBucket: "driveease-66a6b.firebasestorage.app",
  messagingSenderId: "213456611432",
  appId: "1:213456611432:web:534de13199e9e5824533dd",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
