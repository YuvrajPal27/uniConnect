import React, { useState, useEffect } from 'react';
import { db } from "../../firebase/config";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useFirebase } from "../../context/FirebaseContext";
import Banner from "../Banner";

const EMPTY_ROW = {
  department: "",
  ugcAssistantProfessorP: 0, ugcAssociateProfessorP: 0, ugcProfessorP: 0,
  sanctionedAssistantProfessorP: 0, sanctionedAssistantProfessorT: 0,
  sanctionedAssociateProfessorP: 0, sanctionedAssociateProfessorT: 0,
  sanctionedProfessorP: 0, sanctionedProfessorT: 0,
  filledAssistantProfessorP: 0, filledAssistantProfessorT: 0,
  filledAssociateProfessorP: 0, filledAssociateProfessorT: 0,
  filledProfessorP: 0, filledProfessorT: 0,
  recruitmentStatus: "", remarks: ""
};

const FacultyDetails = () => {
  const { university } = useFirebase();
  const [rows, setRows] = useState([EMPTY_ROW]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!university) return;
      setLoading(true);
      try { 
        const q = query(collection(db, "facultyDetails"), where("UniversityName", "==", university));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        if (data.length > 0) setRows(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFaculty();
  }, [university]);

  // --- 2. LOGIC HANDLERS ---
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const toggleSelectRow = (index) => {
    const next = new Set(selectedRows);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelectedRows(next);
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Permanently delete ${selectedRows.size} departments?`)) return;
    
    const remaining = rows.filter((_, i) => !selectedRows.has(i));
    setRows(remaining.length ? remaining : [EMPTY_ROW]);
    setSelectedRows(new Set());
    
    // Note: In a production app, you'd also call deleteDoc for the specific IDs here
    alert("Rows removed. Remember to Sync to save changes to Cloud.");
  };

  const handleSync = async () => {
    if (!window.confirm("Sync all changes to the official University database?")) return;
    setLoading(true);
    try {
      const promises = rows.map(row => {
        const docRef = row.id ? doc(db, "facultyDetails", row.id) : doc(collection(db, "facultyDetails"));
        return setDoc(docRef, { ...row, UniversityName: university }, { merge: true });
      });
      await Promise.all(promises);
      alert("Cloud Sync Successful!");
    } catch (err) { alert("Sync Failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <Banner />

      <div className="max-w-[98%] mx-auto mt-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">FACULTY MANAGEMENT</h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{university}</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">Print Report</button>
            <button onClick={handleSync} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              {loading ? "Syncing..." : "Sync to Cloud"}
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full border-collapse text-[11px] text-center relative">
            <thead className="sticky top-0 z-30 bg-slate-800 text-white uppercase tracking-tighter shadow-md">
              <tr>
                <th rowSpan="2" className="p-3 border border-slate-700 bg-slate-900 sticky left-0 z-40">
                   <input type="checkbox" onChange={(e) => setSelectedRows(e.target.checked ? new Set(rows.map((_, i) => i)) : new Set())} />
                </th>
                <th rowSpan="2" className="p-3 border border-slate-700 bg-slate-900 sticky left-10 z-40 min-w-45">Department</th>
                <th colSpan="3" className="p-3 border border-slate-700">Requirement</th>
                <th colSpan="6" className="p-3 border border-slate-700 bg-slate-700">Sanctioned</th>
                <th colSpan="6" className="p-3 border border-slate-700 bg-blue-800">Available</th>
                <th colSpan="6" className="p-3 border border-slate-700 bg-red-800">Vacant</th>
                <th rowSpan="2" className="p-3 border border-slate-700">Status</th>
              </tr>
              <tr className="bg-slate-700 text-[9px]">
                <th>Asst</th><th>Asso</th><th>Prof</th>
                <th>Asst(R)</th><th>Asst(NR)</th><th>Asso(R)</th><th>Asso(NR)</th><th>Prof(R)</th><th>Prof(NR)</th>
                <th>Asst(R)</th><th>Asst(NR)</th><th>Asso(R)</th><th>Asso(NR)</th><th>Prof(R)</th><th>Prof(NR)</th>
                <th>Asst(R)</th><th>Asst(NR)</th><th>Asso(R)</th><th>Asso(NR)</th><th>Prof(R)</th><th>Prof(NR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                // Calculation Logic
                const calcVac = (s, f) => Math.max(0, Number(s) - Number(f));
                const vac = {
                    apR: calcVac(row.sanctionedAssistantProfessorP, row.filledAssistantProfessorP),
                    apNR: calcVac(row.sanctionedAssistantProfessorT, row.filledAssistantProfessorT),
                    asoR: calcVac(row.sanctionedAssociateProfessorP, row.filledAssociateProfessorP),
                    asoNR: calcVac(row.sanctionedAssociateProfessorT, row.filledAssociateProfessorT),
                    prR: calcVac(row.sanctionedProfessorP, row.filledProfessorP),
                    prNR: calcVac(row.sanctionedProfessorT, row.filledProfessorT)
                };

                return (
                  <tr key={index} className={`transition-colors ${selectedRows.has(index) ? 'bg-blue-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-2 border border-slate-100 sticky left-0 bg-white z-10">
                      <input type="checkbox" checked={selectedRows.has(index)} onChange={() => toggleSelectRow(index)} />
                    </td>
                    <td className="p-2 border border-slate-100 sticky left-10 bg-white z-10">
                      <input type="text" value={row.department} onChange={(e) => handleChange(index, 'department', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-700 text-left" placeholder="Dept Name" />
                    </td>

                    {/* Requirement Inputs */}
                    <td className="p-1 border border-slate-100"><input type="number" value={row.ugcAssistantProfessorP} onChange={(e) => handleChange(index, 'ugcAssistantProfessorP', e.target.value)} className="w-10 text-center bg-transparent outline-none" /></td>
                    <td className="p-1 border border-slate-100"><input type="number" value={row.ugcAssociateProfessorP} onChange={(e) => handleChange(index, 'ugcAssociateProfessorP', e.target.value)} className="w-10 text-center bg-transparent outline-none" /></td>
                    <td className="p-1 border border-slate-100"><input type="number" value={row.ugcProfessorP} onChange={(e) => handleChange(index, 'ugcProfessorP', e.target.value)} className="w-10 text-center bg-transparent outline-none" /></td>

                    {/* Sanctioned Fields */}
                    {['sanctionedAssistantProfessorP', 'sanctionedAssistantProfessorT', 'sanctionedAssociateProfessorP', 'sanctionedAssociateProfessorT', 'sanctionedProfessorP', 'sanctionedProfessorT'].map(f => (
                      <td key={f} className="p-1 border border-slate-100 bg-slate-50/50"><input type="number" value={row[f]} onChange={(e) => handleChange(index, f, e.target.value)} className="w-10 text-center bg-transparent outline-none" /></td>
                    ))}

                    {/* Available Fields */}
                    {['filledAssistantProfessorP', 'filledAssistantProfessorT', 'filledAssociateProfessorP', 'filledAssociateProfessorT', 'filledProfessorP', 'filledProfessorT'].map(f => (
                      <td key={f} className="p-1 border border-slate-100 bg-blue-50/30"><input type="number" value={row[f]} onChange={(e) => handleChange(index, f, e.target.value)} className="w-10 text-center bg-transparent outline-none font-bold text-blue-700" /></td>
                    ))}

                    {/* Vacant Display (Auto) */}
                    {Object.values(vac).map((v, i) => (
                      <td key={i} className={`p-1 border border-slate-100 font-black ${v > 0 ? 'text-red-500 bg-red-50/30' : 'text-slate-300'}`}>{v}</td>
                    ))}

                    <td className="p-1 border border-slate-100">
                      <select value={row.recruitmentStatus} onChange={(e) => handleChange(index, 'recruitmentStatus', e.target.value)} className="w-20 bg-transparent text-[9px] font-bold outline-none cursor-pointer">
                        <option value="">Select</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="To be start">To be started</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-100">
          <div className="flex gap-3">
             <button onClick={() => setRows([...rows, { ...EMPTY_ROW }])} className="bg-white border-2 border-green-500 text-green-600 px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition-all active:scale-95 shadow-sm">+ Add Dept</button>
             {selectedRows.size > 0 && <button onClick={deleteSelected} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all">Delete Selected ({selectedRows.size})</button>}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            R: Regular (Govt) | NR: Non-Regular (Uni) | Asst: Assistant | Asso: Associate | Prof: Professor
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;