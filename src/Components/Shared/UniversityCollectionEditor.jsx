import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useFirebase } from "../../context/FirebaseContext";
import { calculateBudget, calculateFacultyVacancies, calculateMouStatus } from "../../config/moduleConfigs";

const emptyRow = (columns) =>
  Object.fromEntries(
    columns
      .filter((column) => column.type !== "computed")
      .map((column) => [column.key, column.type === "number" ? "" : ""])
  );



const UniversityCollectionEditor = ({ config }) => {
  const navigate = useNavigate();
  const { university } = useFirebase();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(new Set());

  const blank = useMemo(() => emptyRow(config.columns), [config.columns]);

  const load = async () => {
    if (!university) return;
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, config.collection),
        where("UniversityName", "==", university)
      );
      const snapshot = await getDocs(q);
      setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setDirty(new Set());
    } catch (err) {
      console.error(err);
      setError("Unable to load data. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [university, config.collection]);

  const updateRow = (index, key, value, type) => {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          [key]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        };
      })
    );

    setDirty((current) => new Set(current).add(rows[index]?.id || `new-${index}`));
  };

  const validateRow = (row) => {
    const required = config.columns.filter(
      (column) => column.required !== false && column.type !== "computed"
    );

    for (const column of required) {
      const value = row[column.key];
      if (value === "" || value === null || value === undefined) {
        return `${column.label} is required.`;
      }
    }

    if (config.collection === "mou" && row.executionDate && row.expiryDate) {
      if (new Date(row.expiryDate) < new Date(row.executionDate)) {
        return "Expiry Date cannot be before Execution Date.";
      }
    }

    return "";
  };

  const saveRow = async (row, index) => {
    if (!university) return;

    const validation = validateRow(row);
    if (validation) {
      setError(validation);
      return;
    }

    const data = { ...row };
    delete data.id;
    data.UniversityName = university;

    if (config.collection === "budget") Object.assign(data, calculateBudget(data));
    if (config.collection === "facultyDetails") Object.assign(data, calculateFacultyVacancies(data));
    if (config.collection === "mou") data.status = calculateMouStatus(data);

    setSavingId(row.id || `new-${index}`);
    setError("");

    try {
      if (row.id) {
        await setDoc(doc(db, config.collection, row.id), data, { merge: true });
      } else {
        let duplicateQuery = null;
        if (config.collection === "enrollment" && row.courseProgram) {
          duplicateQuery = query(collection(db, config.collection), where("UniversityName", "==", university), where("courseProgram", "==", row.courseProgram));
        } else if (config.collection === "achievements" && row.name && row.category) {
          duplicateQuery = query(collection(db, config.collection), where("UniversityName", "==", university), where("name", "==", row.name), where("category", "==", row.category), where("number", "==", row.number));
        } else if (config.collection === "mou" && row.organizationName) {
          duplicateQuery = query(collection(db, config.collection), where("UniversityName", "==", university), where("organizationName", "==", row.organizationName));
        }
        if (duplicateQuery) {
          const duplicate = await getDocs(duplicateQuery);
          if (!duplicate.empty) {
            setError("A matching record already exists. Edit the existing record instead of creating a duplicate.");
            return;
          }
        }
        await addDoc(collection(db, config.collection), data);
      }
      await load();
    } catch (err) {
      console.error(err);
      setError("Unable to save this row.");
    } finally {
      setSavingId("");
    }
  };

  const removeRow = async (row) => {
    if (!window.confirm("Delete this record permanently?")) return;

    try {
      if (row.id) await deleteDoc(doc(db, config.collection, row.id));
      setRows((current) => current.filter((item) => item !== row));
    } catch (err) {
      console.error(err);
      setError("Unable to delete this record.");
    }
  };

  const addRow = () => setRows((current) => [...current, { ...blank }]);

  const visibleRows = rows.filter((row) => {
    const text = config.columns
      .map((column) => row[column.key])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className=" bg-slate-950 text-white px-5 py-3 flex flex-col sm:flex-row justify-between gap-2 text-sm">
        <span className="font-semibold">University Data Management</span>
        <span className="text-slate-400">{university}</span>
      </div>

      <main className="max-w-[98%] mx-auto py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <header className="p-6 border-b bg-white">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/home")}
                    className=" inline-flex items-center gap-2 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">{config.title}</h1>
                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mt-1">{university}</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-3">Manage, validate and securely sync your university's official records.</p>
              </div>

              <div className=" flex flex-wrap gap-2">
                <button onClick={addRow} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">+ Add Row</button>
                <button onClick={load} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Refresh</button>
              </div>
            </div>

            <div className=" mt-5 flex flex-col md:flex-row gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="w-full md:max-w-md rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                {visibleRows.length} record{visibleRows.length === 1 ? "" : "s"} shown
              </div>
            </div>
          </header>

          {error && <div className="m-5 rounded-xl bg-red-50 border border-red-200 text-red-700 p-4">{error}</div>}
          {loading && <p className="p-8 text-slate-500">Loading records...</p>}

          {!loading && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h2 className="font-bold text-lg">No records yet</h2>
              <p className="text-slate-500 mt-1">Add your first record to start building the official dataset.</p>
              <button onClick={addRow} className="mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">+ Add First Row</button>
            </div>
          )}

          {!loading && rows.length > 0 && visibleRows.length === 0 && (
            <div className="p-10 text-center text-slate-500">No records match your search.</div>
          )}

          {!loading && visibleRows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-max">
                <thead className="bg-slate-900 text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    {config.columns.map((column) => (
                      <th key={column.key} className="p-3 text-left whitespace-nowrap">{column.label}</th>
                    ))}
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, visibleIndex) => {
                    const realIndex = rows.indexOf(row);
                    const budget = config.collection === "budget" ? calculateBudget(row) : {};
                    const facultyVacancies = config.collection === "facultyDetails" ? calculateFacultyVacancies(row) : {};
                    const mouStatus = config.collection === "mou" ? calculateMouStatus(row) : row.status;
                    const rowKey = row.id || `new-${realIndex}`;
                    const isDirty = dirty.has(rowKey);

                    return (
                      <tr key={rowKey} className={`border-b align-top ${isDirty ? "bg-amber-50" : "hover:bg-slate-50"}`}>
                        <td className="p-3 font-semibold text-slate-400">{visibleIndex + 1}</td>
                        {config.columns.map((column) => {
                          if (column.type === "computed") {
                            const value = column.key === "status" ? mouStatus : config.collection === "facultyDetails" ? facultyVacancies[column.key] : budget[column.key];
                            return (
                              <td key={column.key} className="p-2 min-w-32 font-bold whitespace-nowrap">
                                {column.key === "status" ? (
                                  <span className={`inline-flex px-3 py-1 rounded-full text-xs ${value === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{value || "-"}</span>
                                ) : value ?? "-"}
                              </td>
                            );
                          }

                          return (
                            <td key={column.key} className="p-2 min-w-44">
                              {column.type === "select" ? (
                                <select value={row[column.key] ?? ""} onChange={(e) => updateRow(realIndex, column.key, e.target.value, column.type)} className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
                                  <option value="">Select</option>
                                  {column.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={column.type}
                                  min={column.type === "number" ? "0" : undefined}
                                  value={row[column.key] ?? ""}
                                  onChange={(e) => updateRow(realIndex, column.key, e.target.value, column.type)}
                                  className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-200"
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2 whitespace-nowrap">
                          <button disabled={savingId === rowKey} onClick={() => saveRow(row, realIndex)} className="px-3 py-2 mr-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                            {savingId === rowKey ? "Saving..." : "Save"}
                          </button>
                          <button onClick={() => removeRow(row)} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UniversityCollectionEditor;
