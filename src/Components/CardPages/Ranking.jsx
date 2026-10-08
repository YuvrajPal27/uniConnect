import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";

const EMPTY = {
  studentStrength: "",
  facultyStrength: "",
  laboratoryFacilities: "",
  libraryFacilities: "",
  researchPublications: "",
  patentsGranted: "",
  sponsoredResearchProjects: "",
  professionalPractice: "",
  placementRecord: "",
  medianSalaryOffered: "",
  higherStudiesAdmissions: "",
  entrepreneurshipInitiatives: "",
  facilitiesForDifferentlyAbled: "",
  studentSupportServices: "",
  communityEngagementPrograms: "",
  additionalComments: "",
};

const fields = [
  ["studentStrength", "Student Strength"], ["facultyStrength", "Faculty Strength"],
  ["laboratoryFacilities", "Laboratory Facilities"], ["libraryFacilities", "Library Facilities"],
  ["researchPublications", "Research Publications"], ["patentsGranted", "Patents Granted"],
  ["sponsoredResearchProjects", "Sponsored Research Projects"], ["professionalPractice", "Professional Practice"],
  ["placementRecord", "Placement Record"], ["medianSalaryOffered", "Median Salary Offered"],
  ["higherStudiesAdmissions", "Higher Studies Admissions"], ["entrepreneurshipInitiatives", "Entrepreneurship Initiatives"],
  ["facilitiesForDifferentlyAbled", "Facilities for Differently Abled"], ["studentSupportServices", "Student Support Services"],
  ["communityEngagementPrograms", "Community Engagement Programs"], ["additionalComments", "Additional Comments"],
];

export default function Ranking() {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const [row, setRow] = useState({ ...EMPTY });
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!university) return;
      try {
        const snapshot = await getDocs(query(collection(db, "rankingSystemDetails"), where("UniversityName", "==", university)));
        if (!snapshot.empty) {
          const first = snapshot.docs[0];
          setDocId(first.id);
          setRow({ ...EMPTY, ...first.data() });
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load ranking information.");
      } finally { setLoading(false); }
    };
    load();
  }, [university]);

  const save = async () => {
    const missing = fields.find(([key]) => !String(row[key] || "").trim());
    if (missing) { setMessage(`${missing[1]} is required.`); return; }
    setSaving(true); setMessage("");
    try {
      const data = { ...row, UniversityName: university };
      if (docId) {
        await updateDoc(doc(db, "rankingSystemDetails", docId), data);
      } else {
        const ref = await addDoc(collection(db, "rankingSystemDetails"), data);
        setDocId(ref.id);
      }
      setMessage("Ranking information saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save ranking information.");
    } finally { setSaving(false); }
  };

  const reset = async () => {
    if (!docId || !window.confirm("Delete the saved ranking information?")) return;
    await deleteDoc(doc(db, "rankingSystemDetails", docId));
    setDocId(""); setRow({ ...EMPTY }); setMessage("Ranking information deleted.");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-slate-950 text-white px-5 py-3 flex justify-between text-sm"><span className="font-semibold">University Data Management</span><span className="text-slate-400">{university}</span></div>
      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <header className="p-6 border-b bg-white flex flex-col md:flex-row md:justify-between gap-4">
            <div><button onClick={() => navigate("/home")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">← Back to Dashboard</button><h1 className="text-3xl font-black">Ranking Information</h1><p className="text-blue-600 font-bold text-sm mt-1">{university}</p><p className="text-slate-500 text-sm mt-2">Maintain the institutional information used by the ranking workflow.</p></div>
            <div className="flex gap-2 items-end">{docId && <button onClick={reset} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button>}</div>
          </header>
          {message && <div className="m-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">{message}</div>}
          {loading ? <p className="p-8 text-slate-500">Loading...</p> : <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input value={row[key] || ""} onChange={(e) => setRow((current) => ({ ...current, [key]: e.target.value }))} className="mt-2 w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-200" /></label>)}
            <div className="md:col-span-2 flex justify-end"><button onClick={save} disabled={saving} className="px-7 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Ranking Information"}</button></div>
          </div>}
        </div>
      </main>
    </div>
  );
}
