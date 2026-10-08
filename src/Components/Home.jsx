import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Data } from "./Data/data";
import SectionCards from "./sectionCards";
import Banner from "./Banner";
import { useFirebase } from "../context/FirebaseContext";

const collectionMap = {
  facultyDetails: "facultyDetails", tnp: "TnP", infrastructure: "infrastructureDetails",
  capacity: "capacity", enrollment: "enrollment", achievements: "achievements",
  trainingPrograms: "training", budget: "budget", mou: "mou",
};

export default function Home() {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const [search, setSearch] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      if (!university) return;
      try {
        const entries = Object.entries(collectionMap);
        const results = await Promise.all(entries.map(async ([key, collectionName]) => {
          const snapshot = await getDocs(query(collection(db, collectionName), where("UniversityName", "==", university)));
          return [key, snapshot.size];
        }));
        setCounts(Object.fromEntries(results));
      } catch (error) {
        console.error("Dashboard summary error:", error);
      } finally { setLoadingCounts(false); }
    };
    loadCounts();
  }, [university]);

  const visibleModules = useMemo(() => Data.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const totalRecords = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.clear();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Banner />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <section className="rounded-xl bg-slate-900 text-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">University Administrator</p>
              <h2 className="text-3xl md:text-4xl font-black mt-2">{university || "University Dashboard"}</h2>
              <p className="text-slate-300 mt-2 max-w-2xl">Enter and maintain your institution's official data. Changes are stored in Firebase Firestore and are available to authorized Chancellor users.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowHelp(true)} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20">Help & Guide</button>
              <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100">Logout</button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Modules</p><p className="text-3xl font-black mt-1">{Data.length}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Stored records</p><p className="text-3xl font-black mt-1">{loadingCounts ? "…" : totalRecords}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Data owner</p><p className="text-lg font-bold mt-2 truncate">{university || "—"}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Access</p><p className="text-lg font-bold mt-2 text-emerald-600">University Admin</p></div>
        </section>

        <section className="mt-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div><h2 className="text-2xl font-black">Data Modules</h2><p className="text-sm text-slate-500">Choose a module to enter or manage official information.</p></div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="md:w-80 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleModules.map((item) => <SectionCards key={item.id} {...item} onClick={() => navigate(`/${item.id}`)} />)}
          </div>
        </section>
      </main>

      {showHelp && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-sm" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start"><div><h2 className="text-2xl font-black">University Admin Guide</h2><p className="text-slate-500 mt-1">Recommended workflow for accurate submissions.</p></div><button onClick={() => setShowHelp(false)} className="text-2xl text-slate-400">×</button></div>
          <ol className="mt-6 space-y-4 text-sm text-slate-700 list-decimal pl-5"><li>Open a module and review existing records before adding new ones.</li><li>Use the Save button for each row after completing required fields.</li><li>Use academic sessions in Admission to keep historical data separated.</li><li>Review calculated values such as vacancy, budget totals and MoU status before saving.</li><li>Student and parent feedback is displayed from the separate feedback system and is not entered here.</li></ol>
          <div className="mt-6 p-4 rounded-xl bg-blue-50 text-blue-800 text-sm">Tip: avoid duplicate records. Existing records are loaded automatically when the module opens.</div>
        </div>
      </div>}
    </div>
  );
}
