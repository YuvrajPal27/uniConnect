import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { useFirebase } from "../../context/FirebaseContext";
import Banner from "../Banner";

// Template for a fresh row
const EMPTY_ROW = {
  course: "",
  dept: "",
  total: 0,
  open: 0,
  sc: 0,
  st: 0,
  obc: 0,
  ews: 0,
  other: 0,
  mode: "",
};

const Admission = () => {
  const { university } = useFirebase();
  const [session, setSession] = useState("");
  const [sessionList, setSessionList] = useState([]);
  const [rows, setRows] = useState([EMPTY_ROW]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH ALL SESSIONS FOR DROPDOWN ---
  const fetchAvailableSessions = async () => {
    if (!university) return;
    try {
      const sessionsRef = collection(
        db,
        "Universities",
        university,
        "Sections",
        "Admission",
        "Sessions",
      );
      const querySnapshot = await getDocs(sessionsRef);
      setSessionList(querySnapshot.docs.map((doc) => doc.id));
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  useEffect(() => {
    fetchAvailableSessions();
  }, [university]);

  // --- 2. FETCH DATA WHEN SESSION CHANGES ---
  useEffect(() => {
    const fetchTableData = async () => {
      if (!university || !session) {
        setRows([EMPTY_ROW]);
        setSelectedRows(new Set());
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(
          db,
          "Universities",
          university,
          "Sections",
          "Admission",
          "Sessions",
          session,
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRows(docSnap.data().admissionData || [EMPTY_ROW]);
        } else {
          setRows([EMPTY_ROW]);
        }
        setSelectedRows(new Set());
      } catch (err) {
        console.error("Error loading table:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, [university, session]);

  // --- 3. SELECTION LOGIC (INDIVIDUAL CHECKBOXES) ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIndices = new Set(rows.map((_, i) => i));
      setSelectedRows(allIndices);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (index) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  // --- 4. DATA ACTIONS ---
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleCreateNewSession = () => {
    const newName = prompt("Enter New Session Name (e.g., 2026-27):");
    if (!newName) return;
    if (sessionList.includes(newName)) {
      setSession(newName);
    } else {
      setSession(newName);
      setRows([EMPTY_ROW]);
      setSessionList((prev) => [...prev, newName]);
    }
  };

  // --- 5. DELETE & AUTO-SYNC ---
  const deleteSelectedRows = async () => {
    if (!session) return alert("Select a session first.");
    if (
      window.confirm(
        `Permanently delete ${selectedRows.size} rows from the Database?`,
      )
    ) {
      const finalRows = rows.filter((_, index) => !selectedRows.has(index));
      const validatedRows = finalRows.length > 0 ? finalRows : [EMPTY_ROW];

      // Update UI
      setRows(validatedRows);
      setSelectedRows(new Set());

      // Update Database immediately
      try {
        const sessionRef = doc(
          db,
          "Universities",
          university,
          "Sections",
          "Admission",
          "Sessions",
          session,
        );
        await setDoc(sessionRef, {
          sessionName: session,
          admissionData: validatedRows,
          lastUpdated: new Date().toISOString(),
        });
        console.log("Deleted and Synced.");
      } catch (err) {
        alert("Deletion failed in cloud. Please hit Sync manually.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return alert("Please select or create a session first.");

    try {
      const sessionRef = doc(
        db,
        "Universities",
        university,
        "Sections",
        "Admission",
        "Sessions",
        session,
      );
      await setDoc(sessionRef, {
        sessionName: session,
        admissionData: rows,
        lastUpdated: new Date().toISOString(),
      });
      alert(`Cloud Sync Successful for ${session}!`);
      fetchAvailableSessions();
    } catch (err) {
      alert("Cloud Sync Failed.");
    }
  };

  return (
    <div>
      <Banner />

      <div className="bg-white p-6 rounded-2xl shadow-xl mt-6 border border-gray-100 max-w-[98%] mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b pb-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
              Admission Portal
            </h1>
            <p className="text-xs text-blue-600 font-bold uppercase">
              {university}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 mb-1 uppercase">
                Academic Session
              </span>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="bg-white border-2 border-gray-200 p-2 rounded-lg w-48 font-bold text-gray-700 outline-none"
              >
                <option value="">-- Choose --</option>
                {sessionList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCreateNewSession}
              className="bg-blue-600 text-white h-11 px-6 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            >
              + New
            </button>
          </div>
        </div>

        {/* Table Form */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full border-collapse text-sm text-center">
              <thead className="bg-gray-900 text-white uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedRows.size === rows.length && rows.length > 0
                      }
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-left">Course / Program</th>
                  <th className="p-4 text-left">Dept</th>
                  <th className="p-4">Seats</th>
                  {["Open", "SC", "ST", "OBC", "EWS", "Other"].map((cat) => (
                    <th key={cat} className="p-4 bg-gray-800">
                      {cat}
                    </th>
                  ))}
                  <th className="p-4 bg-blue-900 font-bold">Vacant</th>
                  <th className="p-4 bg-blue-900 font-bold">%</th>
                  <th className="p-4">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, index) => {
                  const filled =
                    Number(row.open) +
                    Number(row.sc) +
                    Number(row.st) +
                    Number(row.obc) +
                    Number(row.ews) +
                    Number(row.other);
                  const vacant = row.total - filled;
                  const percent =
                    row.total > 0 ? ((filled / row.total) * 100).toFixed(1) : 0;

                  return (
                    <tr
                      key={index}
                      className={`transition-all ${selectedRows.has(index) ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleRowSelect(index)}
                          className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-left">
                        <input
                          type="text"
                          value={row.course}
                          onChange={(e) =>
                            handleChange(index, "course", e.target.value)
                          }
                          className="w-full p-2 bg-transparent outline-none font-semibold"
                        />
                      </td>
                      <td className="p-1 text-left">
                        <input
                          type="text"
                          value={row.dept}
                          onChange={(e) =>
                            handleChange(index, "dept", e.target.value)
                          }
                          className="w-full p-2 bg-transparent outline-none text-gray-500"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.total}
                          onChange={(e) =>
                            handleChange(index, "total", e.target.value)
                          }
                          className="w-16 mx-auto block text-center bg-gray-100 rounded-md p-1 font-black"
                        />
                      </td>

                      {["open", "sc", "st", "obc", "ews", "other"].map(
                        (cat) => (
                          <td key={cat} className="p-1">
                            <input
                              type="number"
                              value={row[cat] || 0}
                              onChange={(e) =>
                                handleChange(index, cat, e.target.value)
                              }
                              className="w-10 mx-auto block text-center bg-transparent outline-none"
                            />
                          </td>
                        ),
                      )}

                      <td
                        className={`p-1 font-black ${vacant < 0 ? "text-red-500" : "text-blue-600"}`}
                      >
                        {vacant}
                      </td>
                      <td className="p-1 font-mono text-gray-400">
                        {percent}%
                      </td>
                      <td className="p-1">
                        <select
                          value={row.mode}
                          onChange={(e) =>
                            handleChange(index, "mode", e.target.value)
                          }
                          className="w-full bg-transparent outline-none font-bold text-gray-500 text-xs"
                        >
                          <option value="">Select</option>
                          <option value="Direct">Direct</option>
                          <option value="Counselling">Counselling</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRows([...rows, { ...EMPTY_ROW }])}
                className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95"
              >
                + Add New Row
              </button>
              {selectedRows.size > 0 && (
                <button
                  type="button"
                  onClick={deleteSelectedRows}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all"
                >
                  Confirm Delete ({selectedRows.size})
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-12 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              SYNC DATA TO CLOUD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admission;
