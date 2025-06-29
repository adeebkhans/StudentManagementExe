import React, { useEffect, useState } from "react";
import { getAllStudents, addStudent, updateStudent, exportStudents } from "../api/students";
import Navbar from "../components/Navbar";
import StudentTable from "../components/StudentTable";
import StudentForm from "../components/StudentForm";
import SearchStudents from "../components/SearchStudents";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [mode, setMode] = useState(""); // "create", "update", "get"
    const [exporting, setExporting] = useState(false);
    const [studentSearchFilter, setStudentSearchFilter] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "update" || mode === "get") {
            fetchStudents();
        }
    }, [mode]);

    const fetchStudents = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getAllStudents();
            setStudents(res.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch students");
            toast.error(err?.response?.data?.message || "Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        try {
            if (editingStudent) {
                await updateStudent(editingStudent._id, formData);
                setEditingStudent(null);
                setMode(""); // Go back to main menu
                toast.success("Student updated successfully!");
            } else {
                // Add student and redirect to Aadhaar upload
                const res = await addStudent(formData);
                const studentId = res.data?._id || res.data?.student?._id;
                toast.success("Student created successfully! Please upload Aadhaar.");
                if (studentId) {
                    navigate(`/aadhaar-upload/${studentId}`);
                }
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save student");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = (student) => {
        setEditingStudent(student);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFormCancel = () => {
        setEditingStudent(null);
        setMode(""); // Go back to main menu
    };

    const handleExport = async (filter = {}) => {
        setExporting(true);
        try {
            const response = await exportStudents(filter);
            // Try to get filename from content-disposition header
            let filename = "students.xlsx";
            const disposition = response?.headers?.["content-disposition"] || response?.headers?.get?.("content-disposition");
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1]);
                }
            } else if (filter.session) {
                filename = `students_${filter.session}.xlsx`;
            }
            const blob = response.data || response;
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success(`Exported student data as "${filename}"!`);
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Failed to export students");
        } finally {
            setExporting(false);
        }
    };

    // Card UI for main menu
    if (!mode && !editingStudent) {
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
                {/* Overlay for subtle effect */}
                <div className="absolute inset-0 bg-gray-100/90 pointer-events-none" />
                <div className="relative z-10">
                    <Navbar />
                    <div className="py-8 px-2 sm:px-6 w-full max-w-screen-2xl mx-auto">
                        <h1 className="text-2xl font-bold mb-8 text-center">Student Management</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            <div
                                className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={() => setMode("create")}
                            >
                                <div className="text-4xl mb-3 text-white">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div className="text-xl font-semibold text-white mb-2">Create Student</div>
                                <div className="text-blue-100 text-center">Add a new student and upload Aadhaar.</div>
                            </div>
                            <div
                                className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={() => setMode("update")}
                            >
                                <div className="text-4xl mb-3 text-white">
                                    <i className="fas fa-edit"></i>
                                </div>
                                <div className="text-xl font-semibold text-white mb-2">Update Student</div>
                                <div className="text-yellow-100 text-center">Edit existing student details.</div>
                            </div>
                            <div
                                className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={() => setMode("get")}
                            >
                                <div className="text-4xl mb-3 text-white">
                                    <i className="fas fa-list"></i>
                                </div>
                                <div className="text-xl font-semibold text-white mb-2">Get Students</div>
                                <div className="text-green-100 text-center">View all students (read-only).</div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-8">
                            <button
                                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
                                onClick={handleExport}
                                disabled={exporting}
                            >
                                {exporting ? "Exporting..." : "Export All Student Data"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Create mode
    if (mode === "create" && !editingStudent) {
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
                    <div className="py-8 px-2 sm:px-6 w-full max-w-2xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">Create Student</h1>
                        <div className="bg-white rounded shadow p-6 mb-8">
                            <StudentForm
                                onSubmit={handleFormSubmit}
                                loading={formLoading}
                                readOnly
                            />
                            <button
                                className="mt-4 text-sm text-blue-600 underline"
                                onClick={() => setMode("")}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Update mode
    if ((mode === "update" || editingStudent) && !(!mode && !editingStudent)) {
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
                        <h1 className="text-2xl font-bold mb-6">
                            {editingStudent ? "Update Student" : "Update Students"}
                        </h1>
                        <div className="bg-white rounded shadow p-6 mb-8">
                            {editingStudent ? (
                                <>
                                    <StudentForm
                                        onSubmit={handleFormSubmit}
                                        initialData={editingStudent}
                                        loading={formLoading}
                                    />
                                    <button
                                        className="mt-2 text-sm text-blue-600 underline"
                                        onClick={handleFormCancel}
                                    >
                                        Cancel Edit
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                        <button
                                            className="bg-gray-300 text-gray-800  items-center px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                                            onClick={() => setMode("")}
                                        >
                                            Back
                                        </button>
                                        <div className="flex flex-row gap-2 items-center">
                                            <SearchStudents
                                                onSearch={async (params) => {
                                                    setLoading(true);
                                                    setError("");
                                                    setStudentSearchFilter(params);
                                                    try {
                                                        const res = await getAllStudents(params);
                                                        setStudents(res.data || []);
                                                    } catch (err) {
                                                        setError(err?.response?.data?.message || "Failed to fetch students");
                                                        toast.error(err?.response?.data?.message || "Failed to fetch students");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                        </div>
                                            <button
                                                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                                                style={{ minWidth: 100 }}
                                                onClick={() => handleExport(studentSearchFilter)}
                                                disabled={exporting}
                                            >
                                                {exporting ? "Exporting..." : "Export"}
                                            </button>
                                    </div>
                                    <div className="bg-white rounded shadow p-4 overflow-x-auto">
                                        <h2 className="text-xl font-semibold mb-4">All Students</h2>
                                        {error && <div className="text-red-600 mb-4">{error}</div>}
                                        {loading ? (
                                            <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
                                        ) : (
                                            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                                <StudentTable students={students} onUpdate={handleUpdate} />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Get mode (read-only)
    if (mode === "get") {
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
                        <h1 className="text-2xl font-bold mb-6">All Students</h1>
                        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                                onClick={() => setMode("")}
                            >
                                Back
                            </button>
                            <div className="flex flex-row gap-2 items-center md:w-auto">
                                <SearchStudents
                                    onSearch={async (params) => {
                                        setLoading(true);
                                        setError("");
                                        setStudentSearchFilter(params); // Track filter for export
                                        try {
                                            const res = await getAllStudents(params);
                                            setStudents(res.data || []);
                                        } catch (err) {
                                            setError(err?.response?.data?.message || "Failed to fetch students");
                                            toast.error(err?.response?.data?.message || "Failed to fetch students");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </div>
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                                    style={{ minWidth: 100 }}
                                    onClick={() => handleExport(studentSearchFilter)}
                                    disabled={exporting}
                                >
                                    {exporting ? "Exporting..." : "Export"}
                                </button>
                        </div>
                        <div className="bg-white rounded shadow p-4 overflow-x-auto">
                            {error && <div className="text-red-600 mb-4">{error}</div>}
                            {loading ? (
                                <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
                            ) : (
                                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                    <StudentTable students={students} readOnly />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Students;