import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";

const EMPTY_ROW = {
  Floor: "",
  totalClassroom: "",
  classrooms: "",
  corridor: "",
  washroomMale: "",
  washroomFemale: "",
  pwdProvision: "",
  pwdTotalSeats: "",
  pwdWashrooms: "",
  pwdRamps: "",
  lift: "",
};

const fields = [
  ["Floor", "Floor"],
  ["totalClassroom", "Total Classrooms"],
  ["classrooms", "Classrooms"],
  ["corridor", "Corridor"],
  ["washroomMale", "Male Washrooms"],
  ["washroomFemale", "Female Washrooms"],
  ["pwdProvision", "PWD Provision"],
  ["pwdTotalSeats", "PWD Seats"],
  ["pwdWashrooms", "PWD Washrooms"],
  ["pwdRamps", "PWD Ramps"],
  ["lift", "Lift"],
];

export default function Capacity() {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!university) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "capacity"), where("UniversityName", "==", university)));
      setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (error) {
      console.error(error);
      setMessage("Unable to load capacity data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [university]);

  const update = (index, key, value) => {
    setRows((current) => current.map((row, i) => i === index ? { ...row, [key]: value } : row));
  };

  const addRow = () => setRows((current) => [...current, { ...EMPTY_ROW }]);

  const saveRow = async (row) => {
    if (!row.Floor || !row.classrooms) {
      setMessage("Floor and Classrooms are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const duplicateQuery = query(
        collection(db, "capacity"),
        where("UniversityName", "==", university),
        where("Floor", "==", row.Floor),
        where("classrooms", "==", row.classrooms)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      const existing = duplicateSnapshot.docs.find((item) => item.id !== row.id);

      const data = { ...row, UniversityName: university };
      delete data.id;

      if (row.id) await setDoc(doc(db, "capacity", row.id), data, { merge: true });
      else if (existing) await setDoc(doc(db, "capacity", existing.id), data, { merge: true });
      else await addDoc(collection(db, "capacity"), data);

      await load();
      setMessage("Capacity data saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save capacity data.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this capacity record?")) return;
    try {
      if (row.id) await deleteDoc(doc(db, "capacity", row.id));
      setRows((current) => current.filter((item) => item !== row));
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete the record.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-slate-950 text-white px-5 py-3 flex justify-between text-sm"><span className="font-semibold">University Data Management</span><span className="text-slate-400">{university}</span></div>
      <main className="max-w-[98%] mx-auto py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <header className="p-6 border-b bg-white flex flex-col xl:flex-row xl:justify-between gap-5">
            <div>
              <button onClick={() => navigate("/home")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">← Back to Dashboard</button>
              <h1 className="text-3xl font-black">Capacity</h1>
              <p className="text-blue-600 font-bold text-sm mt-1">{university}</p>
              <p className="text-slate-500 text-sm mt-2">Floor-wise classroom and accessibility capacity.</p>
            </div>
            <div className="flex gap-2 items-end">
              <button onClick={addRow} className="px-4 py-2 rounded-lg bg-slate-900 text-white">+ Add Row</button>
            </div>
          </header>
          {message && <div className="m-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">{message}</div>}
          {loading ? <p className="p-8 text-slate-500">Loading capacity data...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-sm">
                <thead className="bg-slate-900 text-white"><tr><th className="p-3">#</th>{fields.map(([, label]) => <th key={label} className="p-3 text-left">{label}</th>)}<th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={fields.length + 2} className="p-10 text-center text-slate-500">No capacity records. Add the first row.</td></tr>}
                  {rows.map((row, index) => <tr key={row.id || index} className="border-b align-top hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-400">{index + 1}</td>
                    {fields.map(([key]) => <td key={key} className="p-2 min-w-36">
                      {key === "Floor" ? <select value={row[key] || ""} onChange={(e) => update(index, key, e.target.value)} className="border rounded-lg p-2 w-full"><option value="">Select</option><option value="ground">Ground</option><option value="first">First</option><option value="second">Second</option><option value="third">Third</option></select> : key === "lift" ? <select value={row[key] || ""} onChange={(e) => update(index, key, e.target.value)} className="border rounded-lg p-2 w-full"><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select> : <input type={key === "classrooms" || key === "pwdTotalSeats" ? "text" : "number"} min={key === "classrooms" || key === "pwdTotalSeats" ? undefined : "0"} value={row[key] ?? ""} onChange={(e) => update(index, key, e.target.value)} className="border rounded-lg p-2 w-full" />}
                    </td>)}
                    <td className="p-2 whitespace-nowrap"><button disabled={saving} onClick={() => saveRow(row)} className="px-3 py-2 mr-2 rounded-lg bg-blue-600 text-white">{saving ? "Saving..." : "Save"}</button><button onClick={() => remove(row)} className="px-3 py-2 rounded-lg bg-red-600 text-white">Delete</button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
