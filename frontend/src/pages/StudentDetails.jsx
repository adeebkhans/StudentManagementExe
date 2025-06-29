import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentById, deleteStudent } from "../api/students";
import Navbar from "../components/Navbar";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await getStudentById(id);
        setStudent(res.data);
      } catch (err) {
        console.error("Failed to fetch student details:", err);
        setError("Failed to fetch student details");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (deleteInput !== "delete") {
      setError('Please type "delete" to confirm.');
      return;
    }
    setDeleteLoading(true);
    setError("");
    try {
      await deleteStudent(id);
      navigate("/students");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Student Details</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : student ? (
          <div className="bg-white rounded shadow p-6">
            <div className="mb-2"><strong>Name:</strong> {student.name}</div>
            <div className="mb-2"><strong>Father Name:</strong> {student.fathername}</div>
            <div className="mb-2"><strong>Mother Name:</strong> {student.mothername}</div>
            <div className="mb-2"><strong>Student Mobile:</strong> {student.studentMob}</div>
            <div className="mb-2"><strong>Parents Mobile:</strong> {student.parentsMob}</div>
            <div className="mb-2"><strong>Enrollment:</strong> {student.enrollment || "N/A"}</div>
            <div className="mb-2"><strong>Course:</strong> {student.course || "N/A"}</div>
            <div className="mb-2"><strong>Aadhaar No.:</strong> {student.aadharcard || "N/A"}</div>
            <div className="mb-4">
              <strong>Aadhaar Image:</strong><br />
              {student.aadharImage && student.aadharImage.secure_url ? (
                <img
                  src={student.aadharImage.secure_url}
                  alt="Aadhaar"
                  className="mt-2 rounded shadow max-w-xs"
                  style={{ maxHeight: 200 }}
                />
              ) : (
                <button
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                  onClick={() => navigate(`/aadhaar-upload/${student._id}`)}
                >
                  Upload Aadhaar
                </button>
              )}
            </div>
            <div className="mt-6">
              <label className="block mb-2 font-medium text-red-700">
                Type <span className="font-mono bg-gray-200 px-1">delete</span> to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-2"
                disabled={deleteLoading}
              />
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Student"}
              </button>
            </div>
          </div>
        ) : (
          <div>No student found.</div>
        )}
        <button
          className="mt-6 text-blue-600 underline"
          onClick={() => navigate("/students")}
        >
          Back to Students
        </button>
      </div>
    </div>
  );
};

export default StudentDetails;