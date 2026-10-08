import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";
import Banner from "../Banner";

const EMPTY_ROW = {
  courseProgram: "",
  department: "",
  totalAdmission: 0,
  admissionOpen: 0,
  admissionSc: 0,
  admissionSt: 0,
  admissionObc: 0,
  admissionEws: 0,
  admissionOthers: 0,
  vacantSeats: 0,
  percentageFilled: 0,
  admissionMode: "",
};

const number = (value) => Number(value || 0);

const calculateRow = (row) => {
  const total = number(row.totalAdmission);
  const filled =
    number(row.admissionOpen) +
    number(row.admissionSc) +
    number(row.admissionSt) +
    number(row.admissionObc) +
    number(row.admissionEws) +
    number(row.admissionOthers);

  return {
    ...row,
    vacantSeats: Math.max(total - filled, 0),
    percentageFilled: total > 0 ? Number(((filled / total) * 100).toFixed(2)) : 0,
  };
};

export default function Admission() {
  const { university } = useFirebase();
  const [sessions, setSessions] = useState([]);
  const [session, setSession] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSessions = async () => {
    if (!university) return;

    try {
      const ref = collection(
        db,
        "Universities",
        university,
        "Sections",
        "Admission",
        "Sessions"
      );
      const snapshot = await getDocs(ref);
      const names = snapshot.docs.map((item) => item.id);
      setSessions(names);

      if (!session && names.length) setSession(names[0]);
      if (!names.length) setRows([]);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load admission sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [university]);

  useEffect(() => {
    const load = async () => {
      if (!university || !session) return;

      try {
        setLoading(true);
        const ref = doc(
          db,
          "Universities",
          university,
          "Sections",
          "Admission",
          "Sessions",
          session
        );
        const snapshot = await getDoc(ref);
        setRows(snapshot.exists() ? snapshot.data().admissionData || [] : []);
      } catch (error) {
        console.error(error);
        setMessage("Unable to load admission data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [university, session]);

  const addRow = () => setRows((current) => [...current, { ...EMPTY_ROW }]);

  const updateRow = (index, key, value) => {
    setRows((current) =>
      current.map((row, i) =>
        i === index
          ? { ...row, [key]: [
              "totalAdmission", "admissionOpen", "admissionSc", "admissionSt",
              "admissionObc", "admissionEws", "admissionOthers"
            ].includes(key) ? (value === "" ? "" : Number(value)) : value }
          : row
      )
    );
  };

  const removeRow = (index) => {
    if (!window.confirm("Delete this admission row?")) return;
    setRows((current) => current.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!university || !session) {
      setMessage("Select an academic session first.");
      return;
    }

    if (!window.confirm(`Save admission data for ${session}?`)) return;

    setSaving(true);
    setMessage("");

    try {
      const finalRows = rows.map(calculateRow);
      const ref = doc(
        db,
        "Universities",
        university,
        "Sections",
        "Admission",
        "Sessions",
        session
      );

      await setDoc(ref, {
        sessionName: session,
        admissionData: finalRows,
        lastUpdated: new Date().toISOString(),
      });

      setRows(finalRows);
      await loadSessions();
      setMessage(`Admission data saved for ${session}.`);
    } catch (error) {
      console.error(error);
      setMessage("Unable to save admission data.");
    } finally {
      setSaving(false);
    }
  };

  const createSession = () => {
    const newSession = window.prompt("Enter academic session, e.g. 2026-27");
    if (!newSession?.trim()) return;
    setSession(newSession.trim());
    if (!sessions.includes(newSession.trim())) {
      setSessions((current) => [...current, newSession.trim()]);
      setRows([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Banner />
      <div className="max-w-[98%] mx-auto my-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Admission</h1>
            <p className="text-sm text-blue-600 font-bold uppercase mt-1">{university}</p>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm font-semibold">
              Academic Session
              <select value={session} onChange={(e) => setSession(e.target.value)} className="block mt-1 border rounded-lg p-2 bg-white min-w-36">
                <option value="">Select Session</option>
                {sessions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <button onClick={createSession} className="px-4 py-2 rounded-lg bg-slate-800 text-white">+ New Session</button>
            <button onClick={addRow} disabled={!session} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-40">+ Add Row</button>
            <button onClick={save} disabled={saving || !session} className="px-5 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>

        {message && <div className="m-5 p-4 rounded-lg bg-slate-100 border">{message}</div>}

        {loading ? <p className="p-6 text-slate-500">Loading...</p> : !session ? (
          <p className="p-8 text-center text-slate-500">Select or create an academic session.</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No rows yet. Click <b>+ Add Row</b>.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1500px]">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-3">Course / Program</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Total Admission</th>
                  <th className="p-3">Open</th>
                  <th className="p-3">SC</th>
                  <th className="p-3">ST</th>
                  <th className="p-3">OBC</th>
                  <th className="p-3">EWS</th>
                  <th className="p-3">Others</th>
                  <th className="p-3">Vacant</th>
                  <th className="p-3">Filled %</th>
                  <th className="p-3">Admission Mode</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const calculated = calculateRow(row);
                  const numeric = [
                    ["totalAdmission", "Total Admission"], ["admissionOpen", "Open"], ["admissionSc", "SC"],
                    ["admissionSt", "ST"], ["admissionObc", "OBC"], ["admissionEws", "EWS"], ["admissionOthers", "Others"],
                  ];
                  return (
                    <tr key={index} className="border-b align-top">
                      <td className="p-2"><input value={row.courseProgram || ""} onChange={(e) => updateRow(index, "courseProgram", e.target.value)} className="border rounded p-2 w-48" /></td>
                      <td className="p-2"><input value={row.department || ""} onChange={(e) => updateRow(index, "department", e.target.value)} className="border rounded p-2 w-40" /></td>
                      {numeric.map(([key, label]) => <td key={key} className="p-2"><input aria-label={label} type="number" min="0" value={row[key] ?? ""} onChange={(e) => updateRow(index, key, e.target.value)} className="border rounded p-2 w-24" /></td>)}
                      <td className="p-3 font-bold">{calculated.vacantSeats}</td>
                      <td className="p-3 font-bold">{calculated.percentageFilled}%</td>
                      <td className="p-2"><select value={row.admissionMode || ""} onChange={(e) => updateRow(index, "admissionMode", e.target.value)} className="border rounded p-2"><option value="">Select</option><option value="Direct">Direct</option><option value="Councilling">Counselling</option></select></td>
                      <td className="p-2"><button onClick={() => removeRow(index)} className="px-3 py-2 rounded bg-red-600 text-white">Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
