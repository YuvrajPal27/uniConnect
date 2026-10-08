import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, setDoc, doc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";
import Banner from "../Banner";

const fields = [
  ["Campus Wall", "campusWall", "select"], ["Campus Wall Height", "campusWallHeight", "text"],
  ["Number of Entry Gates", "numberOfEntryGates", "number"], ["CCTV at Entry Gates", "cctvAtEntryGates", "select"],
  ["Conference Halls", "numberOfConferenceHalls", "number"], ["Smart Classrooms", "numberOfSmartClassroom", "number"],
  ["Auditoriums", "auditoriums", "number"], ["Electricity Backup", "electricityBackup", "select"],
  ["Grounds", "grounds", "text"], ["Lecture Theatre", "lectureTheatre", "number"], ["Computer Labs", "computerLabs", "number"],
  ["Medical Clinic", "medicalClinic", "select"], ["Indoor Sports", "indoorSports", "select"], ["Outdoor Sports", "outdoorSports", "select"],
  ["Cafeterias", "cafeterias", "number"], ["Drinking Water", "drinkingWater", "select"], ["Student Clubs", "studentClubs", "select"],
  ["Innovation Center", "innovationCenter", "select"], ["Incubation Centre", "incubationCentre", "select"], ["Laboratories", "laboratories", "number"],
  ["Gym", "gym", "select"], ["General Shops", "generalShops", "number"], ["Swimming Pool", "swimmingPool", "number"],
  ["Total Books", "totalNumberOfBooks", "number"], ["Journals", "journals", "number"], ["E-Library", "eLibrary", "select"],
  ["Reading Hall Capacity", "readingHallCapacity", "number"], ["Female Staff", "femaleStaff", "number"], ["Male Staff", "maleStaff", "number"],
  ["Female MTS", "femaleMTS", "number"], ["Male MTS", "maleMTS", "number"], ["Female Guard", "femaleGuard", "number"], ["Male Guard", "maleGuard", "number"],
  ["Photocopier", "photocopier", "number"], ["Printer", "printer", "number"], ["Internet Connectivity", "internetConnectivity", "select"], ["Total Computers", "totalNumberOfComputers", "number"],
];

const sports = [
  ["Chess", "chess"], ["Football", "football"], ["Table Tennis", "tableTennis"], ["Cricket", "cricket"], ["Carrom", "carrom"],
  ["Outdoor Badminton", "outdoorBadminton"], ["Squash", "squash"], ["Athletics", "athletics"], ["Snooker", "snooker"], ["Basketball", "basketball"],
  ["Table Football", "tableFootball"], ["Tennis", "tennis"], ["Indoor Basketball", "indoorBasketball"], ["Hockey", "hockey"],
];

const initial = Object.fromEntries([...fields.map(([, key, type]) => [key, type === "number" ? "" : ""]), ...sports.map(([, key]) => [key, "No"])]);

export default function Infrastructure() {
  const { university } = useFirebase();
  const [data, setData] = useState(initial);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!university) return;
      setLoading(true);
      try {
        const q = query(collection(db, "infrastructureDetails"), where("UniversityName", "==", university));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setDocId(snap.docs[0].id);
          setData((prev) => ({ ...prev, ...snap.docs[0].data() }));
        }
      } catch (err) {
        console.error(err);
        setMessage("Unable to load infrastructure data.");
      } finally { setLoading(false); }
    };
    load();
  }, [university]);

  const change = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!university) return;
    setSaving(true); setMessage("");
    try {
      const payload = { ...data, UniversityName: university };
      if (docId) await setDoc(doc(db, "infrastructureDetails", docId), payload, { merge: true });
      else {
        const ref = await addDoc(collection(db, "infrastructureDetails"), payload);
        setDocId(ref.id);
      }
      setMessage("Infrastructure data saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Unable to save infrastructure data.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Banner />
      <div className="max-w-[98%] mx-auto my-6 bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-black">Infrastructure</h1>
        <p className="text-sm text-blue-600 font-bold uppercase mt-1">{university}</p>
        {loading ? <p className="mt-8 text-slate-500">Loading...</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {fields.map(([label, key, type]) => (
                <label key={key} className="text-sm font-semibold">
                  <span className="block mb-1">{label}</span>
                  {type === "select" ? (
                    <select value={data[key] || "No"} onChange={(e) => change(key, e.target.value)} className="w-full border rounded-lg p-2 bg-white">
                      <option value="Yes">Yes</option><option value="No">No</option>
                    </select>
                  ) : (
                    <input type={type} value={data[key] ?? ""} onChange={(e) => change(key, e.target.value)} className="w-full border rounded-lg p-2" />
                  )}
                </label>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Sports Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {sports.map(([label, key]) => (
                <label key={key} className="border rounded-lg p-3 flex items-center gap-2">
                  <input type="checkbox" checked={data[key] === "Yes"} onChange={(e) => change(key, e.target.checked ? "Yes" : "No")} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {message && <div className="mt-6 p-4 rounded-lg bg-slate-100">{message}</div>}
            <button onClick={save} disabled={saving} className="mt-6 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Infrastructure Data"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
