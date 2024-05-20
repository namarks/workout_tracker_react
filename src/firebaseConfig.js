import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwaQqwlODdrtpRFnwuX1QpQc8YPx1sL0s",
  authDomain: "nicks-training.firebaseapp.com",
  projectId: "nicks-training",
  storageBucket: "nicks-training.appspot.com",
  messagingSenderId: "587481127491",
  appId: "1:587481127491:web:ecb4743c767270fb2752f6",
  measurementId: "G-LCJ339QFBN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };