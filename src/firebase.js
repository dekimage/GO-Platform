import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCs6RuCihqIh3TQvASOdaiBzAeO3KCR9Sw",
  authDomain: "raffles-a9de5.firebaseapp.com",
  projectId: "raffles-a9de5",
  storageBucket: "raffles-a9de5.appspot.com",
  messagingSenderId: "624989785233",
  appId: "1:624989785233:web:7efcc9a3db1c4afda30330",
  measurementId: "G-Z7M6C40W4V",
  databaseURL:
    "https://raffles-a9de5-default-rtdb.europe-west1.firebasedatabase.app",
};
// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const auth = getAuth(app);

export { db, realtimeDb, auth };
