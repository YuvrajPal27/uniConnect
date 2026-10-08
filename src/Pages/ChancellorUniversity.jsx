import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/config";

const modules = [
  ["Achievements", "achievements", "/chancellor/achievements"],
  ["Admission", "admission", "/chancellor/admission"],
  ["Budget", "budget", "/chancellor/budget"],
  ["Capacity", "capacity", "/chancellor/capacity"],
  ["Enrollment", "enrollment", "/chancellor/enrollment"],
  ["Faculty Details", "facultyDetails", "/chancellor/facultyDetails"],
  ["Infrastructure", "infrastructureDetails", "/chancellor/infrastructure"],
  ["MoU", "mou", "/chancellor/mou"],
  ["Parent Feedback", "parentFeedback", "/chancellor/parentFeedback"],
  ["Ranking", "rankingSystemDetails", "/chancellor/ranking"],
  ["Student Feedback", "studentFeedback", "/chancellor/studentFeedback"],
  ["Training & Placement", "TnP", "/chancellor/tnp"],
  ["Training Programs", "training", "/chancellor/training"],
];

export default function ChancellorUniversity() {
  const { university } = useParams();
  const navigate = useNavigate();
  const universityName = decodeURIComponent(university);
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError("");
        const results = await Promise.all(modules.map(async ([, collectionName]) => {
          if (collectionName === "admission") {
            const ref = collection(db, "Universities", universityName, "Sections", "Admission", "Sessions");
            const snapshot = await getDocs(ref);
            return [collectionName, snapshot.size];
          }
          const snapshot = await getDocs(query(collection(db, collectionName), where("UniversityName", "==", universityName)));
          return [collectionName, snapshot.size];
        }));
        setCounts(Object.fromEntries(results));
      } catch (err) { console.error(err); setError("Unable to load university summary."); }
      finally { setLoading(false); }
    };
    load();
  }, [universityName]);

  const visible = useMemo(() => modules.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white px-5 md:px-8 py-5"><div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-4"><div><button onClick={() => navigate("/chancellor")} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors mb-4">← Back to Universities</button><p className="text-xs uppercase tracking-[0.2em] text-blue-300 font-semibold">Institutional Overview</p><h1 className="text-3xl md:text-4xl font-black mt-1">{universityName}</h1><p className="text-slate-400 mt-1">Chancellor / Governor — Read-only</p></div></div></header>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-7">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5"><div><h2 className="text-2xl font-black">University Modules</h2><p className="text-slate-500 text-sm mt-1">Inspect submitted records without changing university data.</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="w-full md:w-80 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" /></div>
        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-5">{error}</div>}
        {loading ? <div className="bg-white rounded-xl border p-10 text-center text-slate-500">Loading university data...</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{visible.map(([name, key, path]) => <button key={key} onClick={() => navigate(`${path}/${encodeURIComponent(universityName)}`)} className="text-left bg-white rounded-xl border p-5 hover:border-blue-300 transition-colors"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-lg">{name}</h3><span className={`text-xs px-2.5 py-1 rounded-full ${counts[key] > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{counts[key] > 0 ? "Available" : "No data"}</span></div><p className="text-slate-500 text-sm mt-2">{counts[key] || 0} record{counts[key] === 1 ? "" : "s"}</p><p className="text-blue-600 text-sm font-semibold mt-5">View module →</p></button>)}</div>}
      </main>
    </div>
  );
}
