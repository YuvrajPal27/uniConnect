// src/context/FirebaseContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const FirebaseContext = createContext();

const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [university, setUniversity] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch university name from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUniversity(userDoc.data().university || "");
        }
      } else {
        setUniversity("");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ db, user, university, setUniversity }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within FirebaseProvider");
  }
  return context;
};

export default FirebaseProvider;