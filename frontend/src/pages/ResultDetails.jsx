import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResultsByStudentId } from "../api/result";
import { getStudentById } from "../api/students";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const ResultDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        navigate('/students');
        return;
      }

      setLoading(true);
      try {
        // Fetch student details and results
        const [studentRes, resultsRes] = await Promise.all([
          getStudentById(studentId),
          getResultsByStudentId(studentId)
        ]);

        setStudent(studentRes.student);
        setResults(resultsRes.results || []);
      } catch (error) {
        toast.error("Failed to fetch result details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

  // Filter results by selected year
  const filteredResults = selectedYear === "all" 
    ? results 
    : results.filter(result => result.year === selectedYear);

  const renderResultCard = (result) => (
    <div key={result._id} className="bg-white rounded shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {result.year === "first" ? "First Year" : "Second Year"} Results
        </h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Session: {result.session}
        </span>
      </div>

      {/* Theory Subjects */}
      {result.subjects && result.subjects.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">Theory Subjects</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 border text-left">Subject</th>
                  <th className="px-3 py-2 border">CT1/75</th>
                  <th className="px-3 py-2 border">CT1/5</th>
                  <th className="px-3 py-2 border">CT2/75</th>
                  <th className="px-3 py-2 border">CT2/5</th>
                  <th className="px-3 py-2 border">Assignment</th>
                  <th className="px-3 py-2 border">Extra Curricular</th>
                  <th className="px-3 py-2 border">Attendance</th>
                  <th className="px-3 py-2 border">Total/25</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((subject, idx) => (
                  <tr key={subject._id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-3 py-2 border font-medium">{subject.name}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.ct1?.outOf75 ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.ct1?.outOf5 ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.ct2?.outOf75 ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.ct2?.outOf5 ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.otherMarks?.assignment ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.otherMarks?.extraCurricular ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{subject.marks?.otherMarks?.attendance ?? "-"}</td>
                    <td className="px-3 py-2 border text-center font-semibold">{subject.marks?.totalOutOf25 ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practicals */}
      {result.practicals && result.practicals.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">Practicals</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 border text-left">Practical</th>
                  <th className="px-3 py-2 border">Viva/50</th>
                  <th className="px-3 py-2 border">File/25</th>
                  <th className="px-3 py-2 border">Lab Attendance/25</th>
                  <th className="px-3 py-2 border">Total/100</th>
                </tr>
              </thead>
              <tbody>
                {result.practicals.map((practical, idx) => (
                  <tr key={practical._id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-3 py-2 border font-medium">{practical.name}</td>
                    <td className="px-3 py-2 border text-center">{practical.marks?.viva ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{practical.marks?.file ?? "-"}</td>
                    <td className="px-3 py-2 border text-center">{practical.marks?.labAttendence ?? "-"}</td>
                    <td className="px-3 py-2 border text-center font-semibold">{practical.marks?.totalOutOf100 ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-4">
        Created: {new Date(result.createdAt).toLocaleDateString()}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: "url('./background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gray-100/90 pointer-events-none" />
      <div className="relative z-10">
        <Navbar />
        <div className="py-8 px-4 sm:px-6 w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            
            {student && (
              <div className="bg-white rounded shadow p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">Student Result Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-semibold">Student Name:</span>
                    <p className="text-gray-700">{student.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Enrollment:</span>
                    <p className="text-gray-700">{student.enrollment}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Father's Name:</span>
                    <p className="text-gray-700">{student.fathername}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Year Filter */}
            <div className="bg-white rounded shadow p-4 mb-6">
              <label className="block font-semibold mb-2">Filter by Year:</label>
              <select
                className="border px-3 py-2 rounded"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">All Years</option>
                <option value="first">First Year</option>
                <option value="second">Second Year</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded shadow p-8 text-center">
              <p className="text-gray-600 text-lg">
                {selectedYear === "all" 
                  ? "No results found for this student." 
                  : `No results found for ${selectedYear} year.`}
              </p>
            </div>
          ) : (
            <div>
              {filteredResults.map(renderResultCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetails;