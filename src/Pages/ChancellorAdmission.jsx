import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/config";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTotal = (row) => toNumber(row.totalAdmission ?? row.total);

const getFilled = (row) =>
  toNumber(row.admissionOpen ?? row.open) +
  toNumber(row.admissionSc ?? row.sc) +
  toNumber(row.admissionSt ?? row.st) +
  toNumber(row.admissionObc ?? row.obc) +
  toNumber(row.admissionEws ?? row.ews) +
  toNumber(row.admissionOthers ?? row.other);

const getCourse = (row) => row.courseProgram ?? row.course ?? "-";
const getDepartment = (row) => row.department ?? row.dept ?? "-";
const getMode = (row) => row.admissionMode ?? row.mode ?? "-";

const normalizeRow = (row) => {
  const total = getTotal(row);
  const filled = getFilled(row);
  const vacant = Math.max(total - filled, 0);
  const percentage = total > 0 ? (filled / total) * 100 : 0;

  return {
    ...row,
    total,
    filled,
    vacant,
    percentage,
    course: getCourse(row),
    department: getDepartment(row),
    mode: getMode(row),
  };
};

const ChancellorAdmission = () => {
  const { university } = useParams();
  const navigate = useNavigate();
  const universityName = decodeURIComponent(university);

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [rows, setRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      setError("");

      const sessionsRef = collection(
        db,
        "Universities",
        universityName,
        "Sections",
        "Admission",
        "Sessions"
      );

      const snapshot = await getDocs(sessionsRef);
      const sessionNames = snapshot.docs.map((item) => item.id).sort().reverse();

      setSessions(sessionNames);
      setSelectedSession((current) =>
        current && sessionNames.includes(current) ? current : sessionNames[0] || ""
      );
    } catch (err) {
      console.error("Error loading admission sessions:", err);
      setError("Unable to load admission sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, [universityName]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const loadAdmissionData = async () => {
      if (!selectedSession) {
        setRows([]);
        setLastUpdated("");
        return;
      }

      try {
        setLoadingData(true);
        setError("");

        const sessionRef = doc(
          db,
          "Universities",
          universityName,
          "Sections",
          "Admission",
          "Sessions",
          selectedSession
        );

        const snapshot = await getDoc(sessionRef);

        if (!snapshot.exists()) {
          setRows([]);
          setLastUpdated("");
          return;
        }

        const data = snapshot.data();
        setRows(Array.isArray(data.admissionData) ? data.admissionData : []);
        setLastUpdated(data.lastUpdated || "");
      } catch (err) {
        console.error("Error loading admission data:", err);
        setError("Unable to load admission data.");
      } finally {
        setLoadingData(false);
      }
    };

    loadAdmissionData();
  }, [universityName, selectedSession]);

  const normalizedRows = useMemo(() => rows.map(normalizeRow), [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return normalizedRows;

    return normalizedRows.filter((row) =>
      [row.course, row.department, row.mode, row.total, row.filled, row.vacant]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [normalizedRows, search]);

  const summary = useMemo(
    () =>
      normalizedRows.reduce(
        (accumulator, row) => {
          accumulator.programs += 1;
          accumulator.seats += row.total;
          accumulator.filled += row.filled;
          accumulator.vacant += row.vacant;
          return accumulator;
        },
        { programs: 0, seats: 0, filled: 0, vacant: 0 }
      ),
    [normalizedRows]
  );

  const fillRate = summary.seats > 0 ? (summary.filled / summary.seats) * 100 : 0;

  const formatUpdated = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white ">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <button
                onClick={() => navigate(`/chancellor/${encodeURIComponent(universityName)}`)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors mb-4"
              >
                ← Back to {universityName}
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">Admission</h1>
                  <p className="text-slate-300 mt-1">{universityName}</p>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Chancellor / Governor · Read-only
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadSessions}
                className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 font-semibold"
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-7">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
            {error}
          </div>
        )}

        <section className="bg-white rounded-xl border shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic session</p>
              {loadingSessions ? (
                <p className="mt-2 text-slate-500">Loading sessions...</p>
              ) : sessions.length ? (
                <select
                  value={selectedSession}
                  onChange={(event) => setSelectedSession(event.target.value)}
                  className="mt-2 min-w-52 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {sessions.map((session) => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              ) : (
                <p className="mt-2 text-slate-500">No academic sessions found.</p>
              )}
            </div>

            <div className="text-sm text-slate-500">
              Last updated: <span className="font-semibold text-slate-700">{formatUpdated(lastUpdated)}</span>
            </div>
          </div>
        </section>

        {!loadingData && normalizedRows.length > 0 && (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                ["Programs", summary.programs, "Courses / programmes"],
                ["Total Seats", summary.seats, "Approved seats"],
                ["Filled", summary.filled, `${fillRate.toFixed(1)}% overall fill rate`],
                ["Vacant", summary.vacant, "Seats remaining"],
              ].map(([label, value, note]) => (
                <div key={label} className="bg-white rounded-xl border shadow-sm p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-3xl font-black mt-2 text-slate-900">{value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{note}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Admission Records</h2>
                  <p className="text-sm text-slate-500 mt-1">{filteredRows.length} of {normalizedRows.length} programmes shown</p>
                </div>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search course, department or mode..."
                  className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="hidden p-5 border-b">
                <h2 className="text-xl font-black">Admission Records — {selectedSession}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      {[
                        "#", "Course / Program", "Department", "Seats", "Open", "SC", "ST", "OBC", "EWS", "Other", "Filled", "Vacant", "Filled %", "Mode"
                      ].map((heading, index) => (
                        <th key={heading} className={`p-3 whitespace-nowrap ${index < 3 ? "text-left" : "text-center"}`}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row, index) => (
                      <tr key={`${row.course}-${row.department}-${index}`} className="hover:bg-slate-50 align-top">
                        <td className="p-3 text-center text-slate-400 font-semibold">{index + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{row.course}</td>
                        <td className="p-3 text-slate-600">{row.department}</td>
                        <td className="p-3 text-center font-black">{row.total}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionOpen ?? row.open)}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionSc ?? row.sc)}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionSt ?? row.st)}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionObc ?? row.obc)}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionEws ?? row.ews)}</td>
                        <td className="p-3 text-center">{toNumber(row.admissionOthers ?? row.other)}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{row.filled}</td>
                        <td className="p-3 text-center font-bold text-blue-700">{row.vacant}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${row.percentage >= 75 ? "bg-emerald-50 text-emerald-700" : row.percentage >= 40 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                            {row.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">{row.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!filteredRows.length && (
                <div className="p-10 text-center text-slate-500">
                  No admission records match your search.
                </div>
              )}
            </section>
          </>
        )}

        {loadingData && (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-slate-500">
            <div className="font-semibold">Loading admission data...</div>
          </div>
        )}

        {!loadingSessions && !loadingData && !sessions.length && !error && (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-xl font-black">No admission data available</h2>
            <p className="text-slate-500 mt-2">This university has not published an admission session yet.</p>
          </div>
        )}

        {!loadingData && selectedSession && !normalizedRows.length && sessions.length > 0 && !error && (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-xl font-black">No records in {selectedSession}</h2>
            <p className="text-slate-500 mt-2">The session exists, but no admission rows have been saved.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChancellorAdmission;
