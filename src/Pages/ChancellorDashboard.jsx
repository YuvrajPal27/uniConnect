import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";

export default function ChancellorDashboard() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.role === "university" && item.university);
      const unique = Array.from(new Map(users.map((item) => [item.university, item])).values()).sort((a, b) => a.university.localeCompare(b.university));
      setUniversities(unique);
    } catch (err) { console.error(err); setError("Unable to load universities."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => universities.filter((item) => item.university.toLowerCase().includes(search.toLowerCase())), [universities, search]);

  const logout = async () => { await signOut(auth); sessionStorage.clear(); navigate("/signin", { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white px-5 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-blue-300 font-semibold">Raj Bhawan Uttarakhand</p><h1 className="text-3xl font-black mt-1">Chancellor Dashboard</h1><p className="text-slate-400 text-sm mt-1">Centralized read-only view of university submissions</p></div>
          <div className="flex gap-2"><button onClick={load} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20">Refresh</button><button onClick={logout} className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold">Logout</button></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-7">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Universities</p><p className="text-3xl font-black mt-1">{loading ? "…" : universities.length}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">View mode</p><p className="text-lg font-bold mt-2 text-emerald-600">Read only</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-xs text-slate-500 uppercase">Search results</p><p className="text-3xl font-black mt-1">{visible.length}</p></div>
        </section>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5"><div><h2 className="text-2xl font-black">Universities</h2><p className="text-slate-500 text-sm mt-1">Select an institution to inspect every available module.</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search universities..." className="w-full md:w-80 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" /></div>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-5">{error}</div>}
        {loading && <div className="bg-white rounded-xl border p-10 text-center text-slate-500">Loading universities...</div>}
        {!loading && !visible.length && <div className="bg-white rounded-xl border p-10 text-center text-slate-500">No universities match your search.</div>}
        {!loading && visible.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{visible.map((item) => <button key={item.id} onClick={() => navigate(`/chancellor/${encodeURIComponent(item.university)}`)} className="text-left bg-white rounded-xl border p-6 shadow-sm hover:-translate-y-1 hover:shadow-sm hover:border-blue-300 transition-all"><div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">UC</div><h3 className="text-xl font-bold mt-5">{item.university}</h3><p className="text-slate-500 text-sm mt-1">Open institutional dashboard</p><span className="inline-block mt-5 text-blue-600 font-semibold">View data →</span></button>)}</div>}
      </main>
    </div>
  );
}
