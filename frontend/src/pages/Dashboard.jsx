import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { exportStudents } from "../api/students";
import { exportFees } from "../api/fees";
import { toast } from "react-toastify";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleExportStudents = async () => {
        try {
            const blob = await exportStudents();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "students.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Exported student data!");
        } catch (err) {
            console.error("Failed to export students", err)
            toast.error("Failed to export students");
        }
    };

    const handleExportFees = async () => {
        try {
            const blob = await exportFees();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "fees.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Exported fee data!");
        } catch (err) {
            console.error("Failed to export fees", err)
            toast.error("Failed to export fees");
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-100 relative"
            style={{
                backgroundImage:
                    "url('./background.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Overlay for subtle effect */}
            <div className="absolute inset-0 bg-gray-100/80 pointer-events-none" />
            <div className="relative z-10">
                <Navbar />
                <div className="max-w-5xl mx-auto py-10 px-4">
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="./logo.png"
                            alt="Logo"
                            className="h-34 w-34 object-contain mb-2"
                        />
                        <h1 className="text-3xl font-bold text-center">
                            SHAIL SUBHASH INSTITUTE OF PARA MEDICAL SCEINCE
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Students Card */}
                        <div
                            className="relative rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer overflow-hidden group"
                            style={{
                                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                            }}
                            onClick={() => navigate("/students")}
                        >
                            {/* Decorative shapes */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow mb-4">
                                <svg
                                    className="w-12 h-12 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-white mb-2 drop-shadow">
                                Students
                            </div>
                            <div className="text-blue-100 mb-4 text-center">
                                Manage student records, add, update and export student data
                            </div>
                            <button
                                className="bg-white text-blue-700 px-5 py-2 rounded font-semibold shadow hover:bg-blue-50 transition"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportStudents();
                                }}
                            >
                                Export Students
                            </button>
                        </div>
                        {/* Fees Card */}
                        <div
                            className="relative rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer overflow-hidden group"
                            style={{
                                background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
                            }}
                            onClick={() => navigate("/fees")}
                        >
                            {/* Decorative shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow mb-4">
                                <svg
                                    className="w-12 h-12 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-white mb-2 drop-shadow">
                                Fees
                            </div>
                            <div className="text-green-100 mb-4 text-center">
                                Manage fee records, create, add installments and export fee data
                            </div>
                            <button
                                className="bg-white text-green-700 px-5 py-2 rounded font-semibold shadow hover:bg-green-50 transition"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportFees();
                                }}
                            >
                                Export Fees
                            </button>
                        </div>
                        {/* Results Card */}
                        <div
                            className="relative rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer overflow-hidden group md:col-span-2"
                            style={{
                                background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
                            }}
                            onClick={() => navigate("/result")}
                        >
                            {/* Decorative shapes */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow mb-4">
                                <svg
                                    className="w-12 h-12 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-white mb-2 drop-shadow">
                                Results
                            </div>
                            <div className="text-purple-100 mb-4 text-center">
                                Manage student results, add marks, view reports and track academic performance
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="bg-white text-purple-700 px-5 py-2 rounded font-semibold shadow hover:bg-purple-50 transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/result");
                                    }}
                                >
                                    Manage Results
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Help Footer */}
            <footer className="absolute bottom-0 left-0 w-full p-4 text-center z-20">
                <div className="group inline-block bg-gray-700/50 text-white/70 text-xs font-mono px-3 py-1 rounded-full cursor-pointer backdrop-blur-sm transition-all hover:bg-gray-800/60 hover:text-white">
                    <span className="group-hover:hidden">Having a problem?</span>
                    <span className="hidden group-hover:inline">Contact the developer: +91 </span>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;