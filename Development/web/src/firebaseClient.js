// firebaseClient.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
export const clientDB = getFirestore(firebaseApp);
