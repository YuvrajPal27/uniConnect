import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../firebase/config";

const ChancellorEnrollment = () => {
  const { university } = useParams();
  const navigate = useNavigate();

  const universityName = decodeURIComponent(university);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollment = async () => {
      try {
        setLoading(true);
        setError("");

        const q = query(
          collection(db, "enrollment"),
          where("UniversityName", "==", universityName)
        );

        const snapshot = await getDocs(q);

        setRows(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      } catch (error) {
        console.error("Error loading enrollment:", error);
        setError("Unable to load enrollment data.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollment();
  }, [universityName]);

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="border-b border-white/10 p-6">
        <button
          onClick={() =>
            navigate(
              `/chancellor/${encodeURIComponent(universityName)}`
            )
          }
          className="mb-5 text-blue-300 hover:text-blue-200"
        >
          ← Back to {universityName}
        </button>

        <h1 className="text-3xl font-bold">
          Enrollment
        </h1>

        <p className="text-gray-300 mt-1">
          {universityName}
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Chancellor / Governor — Read-only View
        </p>
      </div>

      <div className="p-6">
        {loading && (
          <p className="text-gray-300">
            Loading enrollment data...
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-white/10 border border-white/10 rounded-xl p-6">
            <p className="text-gray-300">
              No enrollment data found for {universityName}.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-center text-gray-800">
                <thead className="bg-gray-900 text-white uppercase text-xs">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4 text-left">
                      Course / Program
                    </th>
                    <th className="p-4">
                      Total Students
                    </th>
                    <th className="p-4">
                      Male
                    </th>
                    <th className="p-4">
                      Female
                    </th>
                    <th className="p-4">
                      Other
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="p-4">
                        {index + 1}
                      </td>

                      <td className="p-4 text-left font-semibold">
                        {row.courseProgram || "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {row.totalStudents ?? "-"}
                      </td>

                      <td className="p-4">
                        {row.maleStudents ?? "-"}
                      </td>

                      <td className="p-4">
                        {row.femaleStudents ?? "-"}
                      </td>

                      <td className="p-4">
                        {row.otherStudents ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChancellorEnrollment;