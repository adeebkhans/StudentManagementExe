import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchStudents from "../components/SearchStudents";
import SearchResult from "../components/SearchResult";
import { getAllStudents } from "../api/students";
import { getAllResults, exportResults } from "../api/result";
import ResultForm from "../components/ResultForm";
import ResultTable from "../components/ResultTable";
import { toast } from "react-toastify";

const Result = () => {
  const navigate = useNavigate();
  const [view, setView] = useState(""); // "", "update", "all"
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultSearchFilter, setResultSearchFilter] = useState({});
  const [exporting, setExporting] = useState(false); // Add this state at the top of Result component

  // Handle search students
  const handleSearch = async (params) => {
    setLoading(true);
    try {
      const res = await getAllStudents(params);
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search results
  const handleSearchResults = async (params) => {
    setLoadingResults(true);
    setResultSearchFilter(params);
    try {
      const res = await getAllResults(params);
      setAllResults(res.results || []);
    } catch (err) {
      console.error("Failed to fetch results", err);
      setAllResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Handle fetch all results
  const handleFetchAllResults = async () => {
    setLoadingResults(true);
    try {
      const res = await getAllResults();
      setAllResults(res.results || []);
    } catch (err) {
      console.error("Failed to fetch all results", err);
      setAllResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Handle view result details
  const handleViewResult = (studentId) => {
    navigate(`/result/${studentId}`);
  };

  // Export Excel handler
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await exportResults(resultSearchFilter);
      let filename = "results.xlsx";
      // Axios always lowercases header keys
      const disposition = response?.headers?.['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      } else if (resultSearchFilter.session && resultSearchFilter.year) {
        filename = `results_${resultSearchFilter.session}_${resultSearchFilter.year}.xlsx`;
      }
      const blob = response.data;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Exported result data!");
    } catch (err) {
      console.error("Failed to export result data:", err);
      toast.error("Failed to export result data");
    } finally {
      setExporting(false);
    }
  };

  // Main menu card
  if (!view && !selectedStudent) {
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
          <div className="py-8 px-2 sm:px-6 w-full max-w-screen-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-center">Result Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div
                className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                onClick={() => setView("update")}
              >
                <div className="text-4xl mb-3 text-white">
                  <i className="fas fa-pen"></i>
                </div>
                <div className="text-xl font-semibold text-white mb-2">Update Result</div>
                <div className="text-purple-100 text-center">Update or add result for a student.</div>
              </div>
              <div
                className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                onClick={() => {
                  setView("all");
                  handleFetchAllResults();
                }}
              >
                <div className="text-4xl mb-3 text-white">
                  <i className="fas fa-table"></i>
                </div>
                <div className="text-xl font-semibold text-white mb-2">See All Results</div>
                <div className="text-blue-100 text-center">View all students' results in a table.</div>
              </div>
              {/* New card for subjectwise update */}
              <div
                className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/result/subjects")}
              >
                <div className="text-4xl mb-3 text-white">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div className="text-xl font-semibold text-white mb-2">Update Result Subjectwise</div>
                <div className="text-green-100 text-center">Mass update results for a subject or practical.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All Results Table view
  if (view === "all") {
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
          <div className="py-8 px-2 sm:px-6 w-full max-w-screen-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">All Students Results</h1>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                onClick={() => setView("")}
              >
                Back
              </button>
              <div className="flex flex-row gap-2 items-center">
                <SearchResult onSearch={handleSearchResults} />
                <button
                  className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
                  onClick={handleExportExcel}
                  disabled={exporting}
                >
                  {exporting ? "Exporting..." : "Download Excel"}
                </button>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 overflow-x-auto">
              {loadingResults ? (
                <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
              ) : (
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <ResultTable
                    results={allResults}
                    onView={handleViewResult}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update Result view: show student filter and table
  if (view === "update" && !selectedStudent) {
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
          <div className="py-8 px-2 sm:px-6 w-full max-w-screen-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Update Result</h1>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                onClick={() => setView("")}
              >
                Back
              </button>
              <div className="flex flex-row gap-2 items-center">
                <SearchStudents onSearch={handleSearch} />
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 overflow-x-auto">
              {loading ? (
                <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
              ) : (
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border border-gray-300 text-left">S.No.</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Name</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Father Name</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Session</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Enrollment</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((stu, index) => (
                        <tr key={stu._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
                          <td className="px-4 py-2 border border-gray-300">{stu.name}</td>
                          <td className="px-4 py-2 border border-gray-300">{stu.fathername}</td>
                          <td className="px-4 py-2 border border-gray-300">{stu.session}</td>
                          <td className="px-4 py-2 border border-gray-300">{stu.enrollment}</td>
                          <td className="px-4 py-2 border border-gray-300">
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition"
                              onClick={() => setSelectedStudent(stu)}
                            >
                              Update Result
                            </button>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-gray-500 border border-gray-300">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show ResultForm for selected student
  if (selectedStudent) {
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
          <div className="py-8 px-2 sm:px-6 w-full max-w-3xl mx-auto">
            <button
              className="mb-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => setSelectedStudent(null)}
            >
              Back
            </button>
            <h1 className="text-2xl font-bold mb-6">Update Result</h1>
            <div className="bg-white rounded shadow p-6 mb-8">
              <div className="mb-4">
                <div className="font-semibold">
                  Student Name: <span className="font-normal">{selectedStudent.name}</span>
                </div>
                <div className="font-semibold">
                  Enrollment: <span className="font-normal">{selectedStudent.enrollment}</span>
                </div>
                <div className="font-semibold">
                  Session: <span className="font-normal">{selectedStudent.session}</span>
                </div>
              </div>
              <ResultForm
                studentId={selectedStudent._id}
                session={selectedStudent.session}
                onSuccess={() => setSelectedStudent(null)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Result;