import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";
import Banner from "../Banner";

export default function FeedbackViewer({ collectionName, title }) {
  const { university, role } = useFirebase();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (role !== "university" || !university) {
          setRows([]);
          return;
        }
        const feedbackQuery = query(
          collection(db, collectionName),
          where("UniversityName", "==", university)
        );
        const snap = await getDocs(feedbackQuery);
        setRows(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) {
        console.error(err);
        setError("Unable to load feedback.");
      } finally { setLoading(false); }
    };
    load();
  }, [collectionName, university, role]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No timestamp";
    if (typeof timestamp?.toDate === "function") return timestamp.toDate().toLocaleString();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    return String(timestamp);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Banner />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-2">Feedback submitted through the separate feedback website.</p>
        {loading && <p className="mt-8 text-gray-300">Loading feedback...</p>}
        {error && <div className="mt-6 p-4 rounded-lg bg-red-500/10 text-red-300">{error}</div>}
        {!loading && !error && rows.length === 0 && <p className="mt-8 text-gray-400">No feedback available.</p>}
        <div className="grid gap-5 mt-8">
          {rows.map((row) => (
            <div key={row.id} className="bg-white/10 border border-white/10 rounded-xl p-5">
              <p className="text-lg">{row.suggestion || "No suggestion provided"}</p>
              <p className="text-sm text-gray-400 mt-4">{formatTimestamp(row.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
