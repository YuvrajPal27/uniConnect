import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCqvWdFNVPH4HQledZ1db508LTCzXW-Pyc",
  authDomain: "uni-connect-clone.firebaseapp.com",
  projectId: "uni-connect-clone",
  storageBucket: "uni-connect-clone.firebasestorage.app",
  messagingSenderId: "133605608795",
  appId: "1:133605608795:web:ade97424f70e9c58b45e7e"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


export default app;