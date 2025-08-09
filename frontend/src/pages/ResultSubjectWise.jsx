import React, { useState } from "react";
import { getAllStudents } from "../api/students";
import { getAllResults } from "../api/result";
import { updateResultSubjectwise } from "../api/result";
import SubjectsData from "../data/Subjects.json";
import { toast } from "react-toastify";
import SearchStudents from "../components/SearchStudents";
import Navbar from "../components/Navbar";

const yearOptions = [
    { value: "first", label: "First Year" },
    { value: "second", label: "Second Year" },
];

const ResultSubjectWise = () => {
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState({});
    const [year, setYear] = useState("first");
    const [subjectType, setSubjectType] = useState("subject"); // "subject" or "practical"
    const [subjectName, setSubjectName] = useState("");
    const [marksData, setMarksData] = useState({});
    const [inputErrors, setInputErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Fetch students and prefill marks from results
    const fetchStudents = async (searchParams = filter) => {
        setLoading(true);
        try {
            const res = await getAllStudents(searchParams);
            const studentsList = res.data || [];
            setStudents(studentsList);
            setSearched(true);

            // Prefill marks using getAllResults
            if (searchParams.session && year) {
                const resultsRes = await getAllResults({
                    session: searchParams.session,
                    year,
                });
                const resultsArr = resultsRes.results || [];
                // Build a map: studentId -> result
                const resultMap = {};
                resultsArr.forEach(r => {
                    if (r.student && r.student._id) {
                        resultMap[r.student._id] = r;
                    }
                });

                // Prefill marksData
                const newMarksData = {};
                studentsList.forEach(stu => {
                    const result = resultMap[stu._id];
                    if (result) {
                        if (subjectType === "subject" && subjectName) {
                            const subj = (result.subjects || []).find(s => s.name === subjectName);
                            if (subj && subj.marks) {
                                newMarksData[stu._id] = {
                                    ct1: subj.marks.ct1 ? { ...subj.marks.ct1 } : {},
                                    ct2: subj.marks.ct2 ? { ...subj.marks.ct2 } : {},
                                    otherMarks: subj.marks.otherMarks ? { ...subj.marks.otherMarks } : {},
                                };
                            }
                        } else if (subjectType === "practical" && subjectName) {
                            const prac = (result.practicals || []).find(p => p.name === subjectName);
                            if (prac && prac.marks) {
                                newMarksData[stu._id] = {
                                    viva: prac.marks.viva || "",
                                    file: prac.marks.file || "",
                                    labAttendence: prac.marks.labAttendence || ""
                                };
                            }
                        }
                    }
                });
                setMarksData(newMarksData);
            } else {
                setMarksData({});
            }
        } catch (err) {
            console.log("Failed to fetch students", err)
            toast.error("Failed to fetch students");
            setStudents([]);
            setSearched(true);
            setMarksData({});
        } finally {
            setLoading(false);
        }
    };

    // Clamp helper for error
    const clampWithError = (value, min, max) => {
        if (value === "") return { value: "", error: false };
        const num = Number(value);
        if (isNaN(num)) return { value: min, error: true };
        if (num < min) return { value: min, error: true };
        if (num > max) return { value: max, error: true };
        return { value: num, error: false };
    };

    // Update marks for a student
    const handleMarksChange = (studentId, field, value, subfield, min, max, errorKey) => {
        const { value: clamped, error } = clampWithError(value, min, max);
        setMarksData(prev => {
            const prevMarks = prev[studentId] || {};
            let updated = { ...prevMarks };
            
            if (subjectType === "subject") {
                updated = {
                    ...updated,
                    [field]: subfield
                        ? { ...updated[field], [subfield]: clamped }
                        : clamped,
                };
            } else {
                // For practicals, update individual fields directly
                updated = {
                    ...updated,
                    [field]: clamped
                };
            }
            return { ...prev, [studentId]: updated };
        });
        setInputErrors(prev => ({
            ...prev,
            [`${errorKey}-${studentId}`]: error
        }));
    };

    // Prepare and submit the payload
    const handleSubmit = async e => {
        e.preventDefault();
        if (!subjectName) {
            toast.error("Please select a subject/practical");
            return;
        }
        // Prevent submit if any error
        if (Object.values(inputErrors).some(Boolean)) {
            toast.error("Please fix errors before submitting.");
            return;
        }
        
        const payload = students.map(stu => {
            const base = {
                student: stu._id,
                session: stu.session,
                year,
            };
            
            if (subjectType === "subject") {
                return {
                    ...base,
                    subject: {
                        name: subjectName,
                        marks: marksData[stu._id] || {},
                    },
                };
            } else {
                // For practicals with new structure
                const practicalMarks = marksData[stu._id] || {};
                return {
                    ...base,
                    practical: {
                        name: subjectName,
                        marks: {
                            viva: practicalMarks.viva || 0,
                            file: practicalMarks.file || 0,
                            labAttendence: practicalMarks.labAttendence || 0
                        }
                    },
                };
            }
        });
        
        try {
            await updateResultSubjectwise(payload);
            toast.success("Results updated successfully!");
        } catch (err) {
            console.log("Failed to update results", err)
            toast.error("Failed to update results");
        }
    };

    // Get subject/practical options for the selected year
    const subjectOptions = SubjectsData[year]?.subjects || [];
    const practicalOptions = SubjectsData[year]?.practicals || [];

    // When subjectType or subjectName or year changes, re-prefill if students are already loaded
    React.useEffect(() => {
        if (searched && students.length > 0 && filter.session && year) {
            fetchStudents(filter);
        }
        // eslint-disable-next-line
    }, [subjectType, subjectName, year]);

    // Disable all mark inputs if subject/practical is not selected
    const isSubjectSelected = !!subjectName;

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
                    <h1 className="text-2xl font-bold mb-8 text-center">Update Result Subjectwise</h1>
                    {/* Aligned filters */}
                    <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <button
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
                            onClick={() => window.history.back()}
                        >
                            Back
                        </button>
                        <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="border px-3 py-2 rounded w-full md:w-auto"
                                    value={year}
                                    onChange={e => {
                                        setYear(e.target.value);
                                        setSubjectName("");
                                    }}
                                >
                                    {yearOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <select
                                    className="border px-3 py-2 rounded w-full md:w-auto"
                                    value={subjectType}
                                    onChange={e => {
                                        setSubjectType(e.target.value);
                                        setSubjectName("");
                                    }}
                                >
                                    <option value="subject">Subject</option>
                                    <option value="practical">Practical</option>
                                </select>
                                <select
                                    className="border px-3 py-2 rounded w-full md:w-auto whitespace-normal break-words"
                                    style={{ maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word" }}
                                    value={subjectName}
                                    onChange={e => setSubjectName(e.target.value)}
                                >
                                    <option value="">Select {subjectType === "subject" ? "Subject" : "Practical"}</option>
                                    {(subjectType === "subject" ? subjectOptions : practicalOptions).map(opt => (
                                        <option
                                            key={opt.name}
                                            value={opt.name}
                                            style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                                        >
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-auto">
                                <SearchStudents
                                    onSearch={params => {
                                        setFilter(params);
                                        fetchStudents(params);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4 overflow-x-auto">
                        {!isSubjectSelected && (
                            <div className="mb-4 text-red-600 font-semibold text-center">
                                Please select {subjectType === "subject" ? "a subject" : "a practical"} before entering marks.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <table className="min-w-full border text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 border">S.No.</th>
                                            <th className="px-3 py-2 border">Name</th>
                                            <th className="px-3 py-2 border">Enrollment</th>
                                            <th className="px-3 py-2 border">Session</th>
                                            {subjectType === "subject" ? (
                                                <>
                                                    <th className="px-3 py-2 border">CT1 (out of 75)</th>
                                                    <th className="px-3 py-2 border">CT2 (out of 75)</th>
                                                    <th className="px-3 py-2 border">Assignment (out of 5)</th>
                                                    <th className="px-3 py-2 border">Extra Curricular (out of 5)</th>
                                                    <th className="px-3 py-2 border">Attendance (out of 5)</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-3 py-2 border">Viva (out of 50)</th>
                                                    <th className="px-3 py-2 border">File (out of 25)</th>
                                                    <th className="px-3 py-2 border">lab Attendance (out of 25)</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length > 0 ? students.map((stu, idx) => (
                                            <tr key={stu._id}>
                                                <td className="border px-3 py-2">{idx + 1}</td>
                                                <td className="border px-3 py-2">{stu.name}</td>
                                                <td className="border px-3 py-2">{stu.enrollment}</td>
                                                <td className="border px-3 py-2">{stu.session}</td>
                                                {subjectType === "subject" ? (
                                                    <>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={75}
                                                                className={`border px-2 py-1 rounded w-20 ${inputErrors[`ct1-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.ct1?.outOf75 ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "ct1",
                                                                            e.target.value,
                                                                            "outOf75",
                                                                            0,
                                                                            75,
                                                                            "ct1"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`ct1-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 75</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={75}
                                                                className={`border px-2 py-1 rounded w-20 ${inputErrors[`ct2-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.ct2?.outOf75 ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "ct2",
                                                                            e.target.value,
                                                                            "outOf75",
                                                                            0,
                                                                            75,
                                                                            "ct2"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`ct2-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 75</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                className={`border px-2 py-1 rounded w-16 ${inputErrors[`assignment-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.otherMarks?.assignment ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "otherMarks",
                                                                            e.target.value,
                                                                            "assignment",
                                                                            0,
                                                                            5,
                                                                            "assignment"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`assignment-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                className={`border px-2 py-1 rounded w-16 ${inputErrors[`extraCurricular-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.otherMarks?.extraCurricular ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "otherMarks",
                                                                            e.target.value,
                                                                            "extraCurricular",
                                                                            0,
                                                                            5,
                                                                            "extraCurricular"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`extraCurricular-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                className={`border px-2 py-1 rounded w-16 ${inputErrors[`attendance-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.otherMarks?.attendance ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "otherMarks",
                                                                            e.target.value,
                                                                            "attendance",
                                                                            0,
                                                                            5,
                                                                            "attendance"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`attendance-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={50}
                                                                className={`border px-2 py-1 rounded w-20 ${inputErrors[`viva-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.viva ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "viva",
                                                                            e.target.value,
                                                                            null,
                                                                            0,
                                                                            50,
                                                                            "viva"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`viva-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 50</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={25}
                                                                className={`border px-2 py-1 rounded w-20 ${inputErrors[`file-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.file ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "file",
                                                                            e.target.value,
                                                                            null,
                                                                            0,
                                                                            25,
                                                                            "file"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`file-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 25</div>
                                                            )}
                                                        </td>
                                                        <td className="border px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={25}
                                                                className={`border px-2 py-1 rounded w-20 ${inputErrors[`practical-${stu._id}`] ? "border-red-500" : ""}`}
                                                                value={marksData[stu._id]?.practical ?? ""}
                                                                onChange={e =>
                                                                    isSubjectSelected
                                                                        ? handleMarksChange(
                                                                            stu._id,
                                                                            "practical",
                                                                            e.target.value,
                                                                            null,
                                                                            0,
                                                                            25,
                                                                            "practical"
                                                                        )
                                                                        : toast.error("Please select a subject/practical")
                                                                }
                                                                disabled={!isSubjectSelected}
                                                            />
                                                            {inputErrors[`practical-${stu._id}`] && (
                                                                <div className="text-xs text-red-500 mt-1">Value must be between 0 and 25</div>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        )) : searched && (
                                            <tr>
                                                <td colSpan={subjectType === "subject" ? 9 : 7} className="text-center py-4 text-gray-500 border">
                                                    No students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                type="submit"
                                className="mt-6 bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
                                disabled={loading || students.length === 0 || !isSubjectSelected}
                            >
                                {loading ? "Saving..." : "Save All"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultSubjectWise;