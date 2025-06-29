import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadAadhaar, getStudentById } from "../api/students";
import Navbar from "../components/Navbar";

const AadhaarUpload = () => {
  const { id } = useParams(); // student id from route
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudentById(id);
        setStudent(res.data);
      } catch (err) {
        console.error("Failed to fetch student info:", err);
        setError("Failed to fetch student info");
      }
    };
    fetchStudent();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess("");
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      await uploadAadhaar(id, file);
      setSuccess("Aadhaar uploaded successfully!");
      setFile(null);
      // Optionally, refetch student info to show new Aadhaar
      const res = await getStudentById(id);
      setStudent(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Aadhaar Upload</h1>
        {student ? (
          <div className="bg-white rounded shadow p-6 mb-6">
            <div className="mb-2"><strong>Name:</strong> {student.name}</div>
            <div className="mb-2"><strong>Enrollment:</strong> {student.enrollment || "N/A"}</div>
            <div className="mb-2"><strong>Aadhaar No.:</strong> {student.aadharcard || "N/A"}</div>
            <div className="mb-2">
              <strong>Aadhaar:</strong>{" "}
              {student.aadharImage && student.aadharImage.secure_url ? (
                <a
                  href={student.aadharImage.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Aadhaar
                </a>
              ) : (
                <span className="text-yellow-600 font-semibold">Not Uploaded</span>
              )}
            </div>
          </div>
        ) : (
          <div>Loading student info...</div>
        )}

        {/* Show upload form if Aadhaar not uploaded */}
        {student && !(student.aadharImage && student.aadharImage.secure_url) && (
          <form onSubmit={handleUpload} className="bg-white rounded shadow p-6 flex flex-col items-center">
            <label className="block mb-2 font-medium w-full text-center">Upload Aadhaar Image</label>
            <div className="flex items-center gap-3 mb-4 w-full justify-center">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold cursor-pointer transition shadow">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-gray-700 text-sm truncate max-w-xs">
                {file ? file.name : <span className="text-gray-400">No file chosen</span>}
              </span>
            </div>
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition flex items-center justify-center ${
                uploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Upload Aadhaar
                </>
              )}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </form>
        )}

        {/* If Aadhaar is already uploaded, show only the info */}
        {student && student.aadharImage && student.aadharImage.secure_url && (
          <div className="text-green-700 font-semibold mt-4">
            Aadhaar already uploaded.
          </div>
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

export default AadhaarUpload;