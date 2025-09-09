
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "food-ordering-152fe.firebaseapp.com",
  projectId: "food-ordering-152fe",
  storageBucket: "food-ordering-152fe.firebasestorage.app",
  messagingSenderId: "595953383139",
  appId: "1:595953383139:web:f3c155d6e6474182b177d6"
};

const app = initializeApp(firebaseConfig);

export const db=getFirestore(app)