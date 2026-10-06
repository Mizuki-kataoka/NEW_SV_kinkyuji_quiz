// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA717rnpIsQmfPjrW61vnf60O4g27pKBlo",
  authDomain: "sv-kinkyuji-a388d.firebaseapp.com",
  projectId: "sv-kinkyuji-a388d",
  storageBucket: "sv-kinkyuji-a388d.firebasestorage.app",
  messagingSenderId: "1066034767751",
  appId: "1:1066034767751:web:30faa4af97ef7b6bc71522",
  measurementId: "G-HREWCVTZ9N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc, onSnapshot };
