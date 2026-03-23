import { useFirebase } from "../context/FirebaseContext";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export const useFirestore = (collectionName) => {
  const { db } = useFirebase();

  const fetchData = async (queryConstraints = []) => {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const addData = async (data) => {
    return await addDoc(collection(db, collectionName), data);
  };

  const updateData = async (docId, data) => {
    const docRef = doc(db, collectionName, docId);
    return await updateDoc(docRef, data);
  };

  const deleteData = async (docId) => {
    return await deleteDoc(doc(db, collectionName, docId));
  };

  return { fetchData, addData, updateData, deleteData };
};