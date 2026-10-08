import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";
import { calculateFacultyVacancies } from "../../config/moduleConfigs";

const EMPTY = { department: "", ugcAssistantProfessorP: 0, ugcAssociateProfessorP: 0, ugcProfessorP: 0, sanctionedAssistantProfessorP: 0, sanctionedAssistantProfessorT: 0, sanctionedAssociateProfessorP: 0, sanctionedAssociateProfessorT: 0, sanctionedProfessorP: 0, sanctionedProfessorT: 0, filledAssistantProfessorP: 0, filledAssistantProfessorT: 0, filledAssociateProfessorP: 0, filledAssociateProfessorT: 0, filledProfessorP: 0, filledProfessorT: 0, recruitmentStatus: "", remarks: "" };
const fields = [
  ["department", "Department", "text"], ["ugcAssistantProfessorP", "UGC Asst. P", "number"], ["ugcAssociateProfessorP", "UGC Assoc. P", "number"], ["ugcProfessorP", "UGC Prof. P", "number"],
  ["sanctionedAssistantProfessorP", "Sanctioned Asst. P", "number"], ["sanctionedAssistantProfessorT", "Sanctioned Asst. T", "number"], ["sanctionedAssociateProfessorP", "Sanctioned Assoc. P", "number"], ["sanctionedAssociateProfessorT", "Sanctioned Assoc. T", "number"], ["sanctionedProfessorP", "Sanctioned Prof. P", "number"], ["sanctionedProfessorT", "Sanctioned Prof. T", "number"],
  ["filledAssistantProfessorP", "Filled Asst. P", "number"], ["filledAssistantProfessorT", "Filled Asst. T", "number"], ["filledAssociateProfessorP", "Filled Assoc. P", "number"], ["filledAssociateProfessorT", "Filled Assoc. T", "number"], ["filledProfessorP", "Filled Prof. P", "number"], ["filledProfessorT", "Filled Prof. T", "number"],
];
const vacancyFields = [["vacantAssistantProfessorP", "Vacant Asst. P"], ["vacantAssistantProfessorT", "Vacant Asst. T"], ["vacantAssociateProfessorP", "Vacant Assoc. P"], ["vacantAssociateProfessorT", "Vacant Assoc. T"], ["vacantProfessorP", "Vacant Prof. P"], ["vacantProfessorT", "Vacant Prof. T"]];

export default function FacultyDetails() {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!university) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "facultyDetails"), where("UniversityName", "==", university)));
      setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (error) { console.error(error); setMessage("Unable to load faculty data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [university]);

  const update = (index, key, value) => setRows((current) => current.map((row, i) => i === index ? { ...row, [key]: value === "" ? "" : fields.find((f) => f[0] === key)?.[2] === "number" ? Math.max(0, Number(value)) : value } : row));
  const addRow = () => setRows((current) => [...current, { ...EMPTY }]);
  const save = async (row) => {
    if (!row.department?.trim()) { setMessage("Department is required."); return; }
    setSaving(true); setMessage("");
    try {
      const data = { ...row, ...calculateFacultyVacancies(row), UniversityName: university };
      delete data.id;
      if (row.id) await setDoc(doc(db, "facultyDetails", row.id), data, { merge: true });
      else await addDoc(collection(db, "facultyDetails"), data);
      await load(); setMessage("Faculty data saved successfully.");
    } catch (error) { console.error(error); setMessage("Unable to save faculty data."); }
    finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this department's faculty record?")) return;
    try { if (row.id) await deleteDoc(doc(db, "facultyDetails", row.id)); setRows((current) => current.filter((item) => item !== row)); }
    catch (error) { console.error(error); setMessage("Unable to delete the record."); }
  };

  const visible = useMemo(() => rows.filter((row) => `${row.department} ${row.recruitmentStatus} ${row.remarks}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const totals = visible.reduce((acc, row) => {
    Object.assign(acc, Object.fromEntries(vacancyFields.map(([key]) => [key, (acc[key] || 0) + Number(calculateFacultyVacancies(row)[key] || 0)])));
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-slate-950 text-white px-5 py-3 flex justify-between text-sm"><span className="font-semibold">University Data Management</span><span className="text-slate-400">{university}</span></div>
      <main className="max-w-[98%] mx-auto py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <header className="p-6 border-b bg-white"><div className="flex flex-col xl:flex-row xl:justify-between gap-5"><div><button onClick={() => navigate("/home")} className="mb-4 px-3 py-2 rounded-lg border hover:bg-slate-100">← Back to Dashboard</button><h1 className="text-3xl font-black">Faculty Details</h1><p className="text-blue-600 font-bold text-sm mt-1">{university}</p><p className="text-slate-500 text-sm mt-2">Sanctioned, filled and automatically calculated vacant positions by department.</p></div><div className="flex flex-wrap gap-2 items-end"><button onClick={addRow} className="px-4 py-2 rounded-lg bg-slate-900 text-white">+ Add Department</button><button onClick={() => setShowSummary(true)} className="px-4 py-2 rounded-lg border">Vacancy Summary</button></div></div><div className="mt-5 flex flex-col md:flex-row gap-3"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search department..." className="w-full md:w-80 border rounded-xl px-4 py-3"/><div className="px-4 py-3 rounded-xl bg-blue-50 text-blue-800 text-sm">{visible.length} department{visible.length === 1 ? "" : "s"}</div></div></header>
          {message && <div className="m-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">{message}</div>}
          {loading ? <p className="p-8 text-slate-500">Loading faculty data...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[2500px] text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 sticky left-0 bg-slate-900">#</th>{fields.map(([, label]) => <th key={label} className="p-3 text-left whitespace-nowrap">{label}</th>)}{vacancyFields.map(([, label]) => <th key={label} className="p-3 bg-blue-900 whitespace-nowrap">{label}</th>)}<th className="p-3">Recruitment</th><th className="p-3">Remarks</th><th className="p-3">Actions</th></tr></thead><tbody>{visible.length === 0 ? <tr><td colSpan={fields.length + vacancyFields.length + 4} className="p-10 text-center text-slate-500">No faculty records. Add a department to begin.</td></tr> : visible.map((row, index) => { const vacancy = calculateFacultyVacancies(row); const realIndex = rows.indexOf(row); return <tr key={row.id || index} className="border-b align-top hover:bg-slate-50"><td className="p-3 font-semibold text-slate-400 sticky left-0 bg-white">{index + 1}</td>{fields.map(([key, , type]) => <td key={key} className="p-2 min-w-32"><input type={type} min={type === "number" ? 0 : undefined} value={row[key] ?? ""} onChange={(e) => update(realIndex, key, e.target.value)} className="w-full border rounded-lg p-2" /></td>)}{vacancyFields.map(([key]) => <td key={key} className="p-3 text-center font-black bg-blue-50 text-blue-800">{vacancy[key]}</td>)}<td className="p-2 min-w-36"><select value={row.recruitmentStatus || ""} onChange={(e) => update(realIndex, "recruitmentStatus", e.target.value)} className="border rounded-lg p-2 w-full"><option value="">Select</option><option value="Ongoing">Ongoing</option><option value="To be start">To be started</option><option value="Subjudiced">Subjudiced/Withheld</option></select></td><td className="p-2 min-w-48"><input value={row.remarks || ""} onChange={(e) => update(realIndex, "remarks", e.target.value)} className="border rounded-lg p-2 w-full" /></td><td className="p-2 whitespace-nowrap"><button disabled={saving} onClick={() => save(row)} className="px-3 py-2 mr-2 rounded-lg bg-blue-600 text-white">{saving ? "Saving..." : "Save"}</button><button onClick={() => remove(row)} className="px-3 py-2 rounded-lg bg-red-600 text-white">Delete</button></td></tr>; })}</tbody></table></div>}
        </div>
      </main>
      {showSummary && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" onClick={() => setShowSummary(false)}><div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-sm" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><div><h2 className="text-2xl font-black">Vacancy Summary</h2><p className="text-slate-500 text-sm mt-1">Automatically calculated from sanctioned minus filled positions.</p></div><button onClick={() => setShowSummary(false)} className="text-2xl text-slate-400">×</button></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">{vacancyFields.map(([key, label]) => <div key={key} className="rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700">{label}</p><p className="text-3xl font-black text-blue-900 mt-1">{totals[key] || 0}</p></div>)}</div></div></div>}
    </div>
  );
}
