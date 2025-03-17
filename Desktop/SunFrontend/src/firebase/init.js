import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBinNYoP9TruPmfzOeQtM7ajhdMv00lZfk",
  authDomain: "mindwell-f5a26.firebaseapp.com",
  projectId: "mindwell-f5a26",
  storageBucket: "mindwell-f5a26.appspot.com",
  messagingSenderId: "571613946691",
  appId: "1:571613946691:web:5678d09ee6e7d14c9145f6",
  measurementId: "G-437WL0G5Q4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export app, db, and auth for use in other files
export { app, db, auth };
