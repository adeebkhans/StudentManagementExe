import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFeeById, deleteFee } from "../api/fees";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const FeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchFee = async () => {
      setLoading(true);
      try {
        const res = await getFeeById(id);
        setFee(res.data);
      } catch (err) {
        console.error("Failed to fetch fee details:", err);
        toast.error("Failed to fetch fee details");
      } finally {
        setLoading(false);
      }
    };
    fetchFee();
  }, [id]);

  const handleDelete = async () => {
    if (deleteInput !== "delete") {
      toast.error('Please type "delete" to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await deleteFee(id);
      toast.success("Fee record deleted!");
      navigate("/fees");
    } catch (err) {
        console.error("Failed to delete fee record:", err);
      toast.error("Failed to delete fee record");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Fee Details</h1>
        {loading ? (
          <div>Loading...</div>
        ) : fee ? (
          <div className="bg-white rounded shadow p-6">
            <div className="mb-2"><strong>Student Name:</strong> {fee.student?.name || "N/A"}</div>
            <div className="mb-2"><strong>Father's Name:</strong> {fee.student?.fathername || "N/A"}</div>
            <div className="mb-2"><strong>Enrollment:</strong> {fee.student?.enrollment || "N/A"}</div>
            <div className="mb-2"><strong>Fee Code:</strong> {fee.code}</div>
            <div className="mb-2"><strong>Total Fee:</strong> ₹{fee.fee}</div>
            <div className="mb-2"><strong>Deposited:</strong> ₹{fee.deposited}</div>
            <div className="mb-2"><strong>Remaining:</strong> ₹{fee.fee - fee.deposited}</div>
            <div className="mb-2"><strong>Last Updated:</strong> {fee.updatedAt ? new Date(fee.updatedAt).toLocaleString() : "N/A"}</div>
            <div className="mt-6">
              <label className="block mb-2 font-medium text-red-600">
                Type <b>delete</b> to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-2"
                disabled={deleting}
              />
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
                onClick={handleDelete}
                disabled={deleting || deleteInput !== "delete"}
              >
                {deleting ? "Deleting..." : "Delete Fee Record"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-red-600">Fee record not found.</div>
        )}
        <button
          className="mt-6 text-blue-600 underline"
          onClick={() => navigate("/fees")}
        >
          Back to Fees
        </button>
      </div>
    </div>
  );
};

export default FeeDetails;