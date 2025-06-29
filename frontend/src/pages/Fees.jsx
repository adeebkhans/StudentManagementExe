import React, { useState, useEffect } from "react";
import { getNewStudentsWithNoFeeRecords, getAllFees, updateFee as updateFeeApi, exportFees } from "../api/fees";
import FeeTable from "../components/FeeTable";
import FeeForm from "../components/FeeForm";
import NewFee from "../components/NewFee";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SearchFee from "../components/SearchFee";

const sessionOptions = Array.from({ length: 10 }, (_, i) => {
    // 2024-2026 then 2025-2027 so on.. 
    const start = 2024 + i;
    const end = start + 2;
    return `${start}-${end}`;
});

const Fees = () => {
  const [view, setView] = useState(""); // "", "new", "existing"
  const [loading, setLoading] = useState(false);
  const [newStudents, setNewStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updateFee, setUpdateFee] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [feeSearchFilter, setFeeSearchFilter] = useState({});
  const navigate = useNavigate();

  // Fetch all fees when switching to "existing" view
  useEffect(() => {
    if (view === "existing") {
      setLoading(true);
      setSelectedStudent(null);
      setUpdateFee(null);
      setFeeSearchFilter({});
      getAllFees()
        .then(res => setFees(res.data || []))
        .catch(err => {
          console.error("failed to fetch fee record", err);
          toast.error("Failed to fetch fee records");
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [view]);

  // Main menu cards
  if (!view) {
    return (
      <div
        className="min-h-screen bg-gray-100 relative"
        style={{
          backgroundImage: "url('./background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for subtle effect */}
        <div className="absolute inset-0 bg-gray-100/80 pointer-events-none" />
        <div className="relative z-10">
          <Navbar />
          <div className="py-8 px-2 sm:px-6 w-full max-w-screen-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-center">Fee Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div
                className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                onClick={() => setView("new")}
              >
                <div className="text-4xl mb-3 text-white">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="text-xl font-semibold text-white mb-2">New Students - Create Fee</div>
                <div className="text-blue-100 text-center">Add fee records for new students.</div>
              </div>
              <div
                className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                onClick={() => setView("existing")}
              >
                <div className="text-4xl mb-3 text-white">
                  <i className="fas fa-edit"></i>
                </div>
                <div className="text-xl font-semibold text-white mb-2">Update/Get Existing Students Fee</div>
                <div className="text-green-100 text-center">View or update fee records for existing students.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New Students View
  const handleFetchNewStudents = async () => {
    if (!selectedSession) {
      toast.error("Please select a session first.");
      return;
    }
    setLoading(true);
    try {
      const res = await getNewStudentsWithNoFeeRecords({ session: selectedSession });
      setNewStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch new students:", err);
      toast.error("Failed to fetch new students");
    } finally {
      setLoading(false);
    }
  };

  // Download Excel
  const handleExportExcel = async (filter = {}) => {
    setExporting(true);
    try {
      // Send all filters (including session, name, enrollment, etc.)
      const response = await exportFees(filter);
      // Try to get filename from content-disposition header
      let filename = "fees.xlsx";
      const disposition = response?.headers?.["content-disposition"] || response?.headers?.get?.("content-disposition");
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      } else if (filter.session) {
        filename = `fees_${filter.session}.xlsx`;
      }
      const blob = response.data || response; // support both axios and fetch
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Exported fee data!");
    } catch (err) {
      console.error("Failed to export fee data:", err);
      toast.error("Failed to export fee data");
    } finally {
      setExporting(false);
    }
  };

  // For updating deposited fee (add new installment)
  const handleUpdateDeposited = (fee) => {
    setUpdateFee(fee);
    setSelectedStudent(null);
  };

  const handleUpdateDepositedSubmit = async (e) => {
    e.preventDefault();
    const addAmount = Number(e.target.elements.newInstallment.value);
    if (isNaN(addAmount) || addAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await updateFeeApi(updateFee._id, {
        newDeposit: addAmount,
      });
      toast.success("Installment added!");
      setUpdateFee(null);
      // Refresh fees data
      getAllFees()
        .then(res => setFees(res.data || []))
        .catch(err => {
          console.error("failed to fetch fee record", err);
          toast.error("Failed to fetch fee records");
        });
    } catch (err) {
      console.error("Failed to update fee:", err);
      toast.error("Failed to update fee");
    }
  };

  const handleUpdateDepositedCancel = () => {
    setUpdateFee(null);
  };

  // New Fee Handlers
  const handleCreateFee = (student) => {
    setSelectedStudent(student);
    setUpdateFee(null);
  };

  const handleFeeFormSuccess = () => {
    setSelectedStudent(null);
    setNewStudents([]); // Optionally refresh or clear
  };

  const handleFeeFormCancel = () => {
    setSelectedStudent(null);
  };

  // --- NEW STUDENTS VIEW ---
  if (view === "new") {
    return (
      <div
        className="min-h-screen bg-gray-100 relative"
        style={{
          backgroundImage: "url('./background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for subtle effect */}
        <div className="absolute inset-0 bg-gray-100/80 pointer-events-none" />
        <div className="relative z-10">
          <Navbar />
          <div className="w-full max-w-screen-2xl mx-auto py-10 px-4">
            <div className="flex items-center mb-6">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition mr-4"
                onClick={() => setView("")}
              >
                Back
              </button>
              <h1 className="text-2xl font-bold">New Students - Create Fee</h1>
            </div>
            <div className="flex items-end gap-2 mb-6">
              <div>
                <label className="font-semibold mb-1 block">
                  Select Session <span className="text-red-500">*</span>
                </label>
                <select
                  className="border px-3 py-2 rounded w-48 h-10" // <-- set h-10 for alignment
                  value={selectedSession}
                  onChange={e => setSelectedSession(e.target.value)}
                  required
                >
                  <option value="">Select Session</option>
                  {sessionOptions.map((session) => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold ml-2 text-sm h-10 flex items-center"
                style={{ minWidth: 120 }}
                onClick={handleFetchNewStudents}
                disabled={loading || !selectedSession}
              >
                {loading ? "Loading..." : "Fetch Students"}
              </button>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">New Students (No Fee Records)</h2>
              {selectedStudent ? (
                <FeeForm
                  student={selectedStudent}
                  session={selectedStudent.session} // Pass session as prop
                  onSuccess={handleFeeFormSuccess}
                  onCancel={handleFeeFormCancel}
                />
              ) : (
                <NewFee students={newStudents} onCreateFee={handleCreateFee} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EXISTING FEES VIEW ---
  if (view === "existing") {
    return (
      <div
        className="min-h-screen bg-gray-100 relative"
        style={{
          backgroundImage: "url('./background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for subtle effect */}
        <div className="absolute inset-0 bg-gray-100/80 pointer-events-none" />
        <div className="relative z-10">
          <Navbar />
          <div className="w-full max-w-screen-2xl mx-auto py-10 px-4">
            <div className="flex items-center mb-6">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition mr-4"
                onClick={() => setView("")}
              >
                Back
              </button>
              <h1 className="text-2xl font-bold">Existing Students Fee Records</h1>
            </div>
            <div className="flex justify-end mb-4">
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
                onClick={() => handleExportExcel(feeSearchFilter)}
                disabled={exporting}
              >
                {exporting ? "Exporting..." : "Download Excel"}
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div />
              <div className="w-full md:w-auto">
                <SearchFee
                  onSearch={async (params) => {
                    setLoading(true);
                    setFeeSearchFilter(params);
                    try {
                      const res = await getAllFees(params);
                      setFees(res.data || []);
                    } catch (err) {
                      console.log("Failed to fetch fee records:", err);
                      toast.error("Failed to fetch fee records");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded shadow p-6">
              {updateFee ? (
                <form onSubmit={handleUpdateDepositedSubmit} className="mb-6">
                  <div className="mb-2">
                    <strong>Student:</strong> {updateFee.student?.name}
                  </div>
                  <div className="mb-2">
                    <strong>Current Deposited:</strong> ₹{updateFee.deposited}
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Add New Installment</label>
                    <input
                      name="newInstallment"
                      type="number"
                      min={1}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                    >
                      Add Installment
                    </button>
                    <button
                      type="button"
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                      onClick={handleUpdateDepositedCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
              <FeeTable
                fees={fees}
                onAction={(fee) => (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      onClick={() => handleUpdateDeposited(fee)}
                    >
                      Add Installment
                    </button>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      onClick={() => navigate(`/fee/${fee._id}`)}
                    >
                      View Fee
                    </button>
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Fees;