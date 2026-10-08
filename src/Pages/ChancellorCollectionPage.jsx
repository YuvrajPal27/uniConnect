import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { moduleConfigs, calculateBudget, calculateFacultyVacancies, calculateMouStatus } from "../config/moduleConfigs";

const configFor = {
  facultyDetails: moduleConfigs.facultyDetails,
  TnP: moduleConfigs.tnp,
  enrollment: moduleConfigs.enrollment,
  achievements: moduleConfigs.achievements,
  training: moduleConfigs.trainingPrograms,
  budget: moduleConfigs.budget,
  mou: moduleConfigs.mou,
  rankingSystemDetails: { title: "Ranking", columns: [
    { key: "studentStrength", label: "Student Strength" }, { key: "facultyStrength", label: "Faculty Strength" }, { key: "laboratoryFacilities", label: "Laboratory Facilities" }, { key: "libraryFacilities", label: "Library Facilities" }, { key: "researchPublications", label: "Research Publications" }, { key: "patentsGranted", label: "Patents Granted" }, { key: "sponsoredResearchProjects", label: "Sponsored Research Projects" }, { key: "professionalPractice", label: "Professional Practice" }, { key: "placementRecord", label: "Placement Record" }, { key: "medianSalaryOffered", label: "Median Salary Offered" }, { key: "higherStudiesAdmissions", label: "Higher Studies Admissions" }, { key: "entrepreneurshipInitiatives", label: "Entrepreneurship Initiatives" }, { key: "facilitiesForDifferentlyAbled", label: "Differently Abled Facilities" }, { key: "studentSupportServices", label: "Student Support Services" }, { key: "communityEngagementPrograms", label: "Community Engagement Programs" }, { key: "additionalComments", label: "Additional Comments" },
  ]},
};

const feedbackColumns = [{ key: "suggestion", label: "Feedback" }, { key: "timestamp", label: "Date" }];

export default function ChancellorCollectionPage({ collectionName, title, global = false }) {
  const { university } = useParams();
  const navigate = useNavigate();
  const universityName = university ? decodeURIComponent(university) : "";
  const config = configFor[collectionName];
  const columns = config?.columns || feedbackColumns;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError("");
        const ref = collection(db, collectionName);
        const snapshot = global ? await getDocs(ref) : await getDocs(query(ref, where("UniversityName", "==", universityName)));
        setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) { console.error(err); setError("Unable to load data."); }
      finally { setLoading(false); }
    };
    load();
  }, [collectionName, universityName, global]);

  const visible = useMemo(() => rows.filter((row) => columns.map((c) => row[c.key]).filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())), [rows, search, columns]);

  const formatValue = (row, column) => {
    if (column.key === "timestamp") return typeof row.timestamp?.toDate === "function" ? row.timestamp.toDate().toLocaleString() : row.timestamp?.seconds ? new Date(row.timestamp.seconds * 1000).toLocaleString() : row.timestamp || "-";
    if (collectionName === "budget") return column.type === "computed" ? calculateBudget(row)[column.key] : row[column.key];
    if (collectionName === "facultyDetails" && column.type === "computed") return calculateFacultyVacancies(row)[column.key];
    if (collectionName === "mou" && column.key === "status") return calculateMouStatus(row);
    return row[column.key] ?? "-";
  };

  const back = () => global ? navigate("/chancellor") : navigate(`/chancellor/${encodeURIComponent(universityName)}`);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white px-5 md:px-8 py-5"><div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-4"><div><button onClick={back} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors mb-4">← Back</button><h1 className="text-3xl font-black">{title}</h1>{!global && <p className="text-slate-400 mt-1">{universityName}</p>}<p className="text-slate-500 text-xs mt-2">Chancellor / Governor — Read-only View</p></div></div></header>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-7">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5"><div><h2 className="text-2xl font-black">Records</h2><p className="text-slate-500 text-sm">{visible.length} of {rows.length} record{rows.length === 1 ? "" : "s"}</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." className="w-full md:w-80 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" /></div>
        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-5">{error}</div>}
        {loading ? <div className="bg-white rounded-xl border p-10 text-center text-slate-500">Loading data...</div> : !visible.length ? <div className="bg-white rounded-xl border p-10 text-center text-slate-500">No matching data available.</div> : <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">#</th>{columns.map((c) => <th key={c.key} className="p-3 text-left whitespace-nowrap">{c.label}</th>)}</tr></thead><tbody>{visible.map((row, index) => <tr key={row.id} className="border-b align-top hover:bg-slate-50"><td className="p-3 text-slate-400">{index + 1}</td>{columns.map((column) => <td key={column.key} className="p-3 min-w-40">{formatValue(row, column)}</td>)}</tr>)}</tbody></table></div></div>}
      </main>
    </div>
  );
}
