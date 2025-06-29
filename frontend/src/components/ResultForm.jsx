import React, { useState, useEffect } from "react";
import SubjectsData from "../data/Subjects.json";
import { createOrUpdateResult, getResultsByStudentId } from "../api/result";
import { toast } from "react-toastify";

// yearOptions for dropdown
const yearOptions = [
  { value: "first", label: "First Year" },
  { value: "second", label: "Second Year" }
];

// assessment types
const assessmentTypes = [
  { value: "theory", label: "Theory" },
  { value: "practical", label: "Practical" }
];

const ResultForm = ({ studentId, session, onSuccess }) => {
  const [year, setYear] = useState("first");
  const [assessment, setAssessment] = useState("theory");
  const [formSubjects, setFormSubjects] = useState([]);
  const [formPracticals, setFormPracticals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});

  // Fetch and prefill result data when year changes
  useEffect(() => {
    const fetchResult = async () => {
      if (!studentId || !session || !year) return;
      try {
        const res = await getResultsByStudentId(studentId, { year });
        if (res.results && res.results.length > 0) {
          const result = res.results[0];
          const yearSubjects = SubjectsData[year]?.subjects || [];
          const yearPracticals = SubjectsData[year]?.practicals || [];

          setFormSubjects(
            yearSubjects.map(sub => {
              const existing = result.subjects?.find(s => s.name === sub.name);
              return {
                name: sub.name,
                marks: {
                  ct1: { outOf75: existing?.marks?.ct1?.outOf75 ?? "" },
                  ct2: { outOf75: existing?.marks?.ct2?.outOf75 ?? "" },
                  otherMarks: {
                    assignment: existing?.marks?.otherMarks?.assignment ?? "",
                    extraCurricular: existing?.marks?.otherMarks?.extraCurricular ?? "",
                    attendance: existing?.marks?.otherMarks?.attendance ?? ""
                  }
                }
              };
            })
          );

          setFormPracticals(
            yearPracticals.map(prac => {
              const existing = result.practicals?.find(p => p.name === prac.name);
              return {
                name: prac.name,
                marks: existing?.marks ?? ""
              };
            })
          );

          if (result.subjects && result.subjects.length > 0) {
            setAssessment("theory");
          } else if (result.practicals && result.practicals.length > 0) {
            setAssessment("practical");
          }
        } else {
          // No result found, load empty forms
          const yearSubjects = SubjectsData[year]?.subjects || [];
          const yearPracticals = SubjectsData[year]?.practicals || [];
          setFormSubjects(
            yearSubjects.map(sub => ({
              name: sub.name,
              marks: {
                ct1: { outOf75: "" },
                ct2: { outOf75: "" },
                otherMarks: { assignment: "", extraCurricular: "", attendance: "" }
              }
            }))
          );
          setFormPracticals(
            yearPracticals.map(prac => ({
              name: prac.name,
              marks: ""
            }))
          );
        }
      } catch (err) {
        console.log("Error fetching result:", err);
        // On error, load empty forms
        const yearSubjects = SubjectsData[year]?.subjects || [];
        const yearPracticals = SubjectsData[year]?.practicals || [];
        setFormSubjects(
          yearSubjects.map(sub => ({
            name: sub.name,
            marks: {
              ct1: { outOf75: "" },
              ct2: { outOf75: "" },
              otherMarks: { assignment: "", extraCurricular: "", attendance: "" }
            }
          }))
        );
        setFormPracticals(
          yearPracticals.map(prac => ({
            name: prac.name,
            marks: ""
          }))
        );
      }
    };
    fetchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, session, year]);

  // Handle subject marks change
  const handleSubjectMarksChange = (idx, field, value, subfield) => {
    setFormSubjects(prev =>
      prev.map((sub, i) =>
        i === idx
          ? {
              ...sub,
              marks: {
                ...sub.marks,
                [field]: subfield
                  ? { ...sub.marks[field], [subfield]: value }
                  : value
              }
            }
          : sub
      )
    );
  };

  // Handle practical marks change
  const handlePracticalMarksChange = (idx, value) => {
    setFormPracticals(prev =>
      prev.map((prac, i) =>
        i === idx
          ? { ...prac, marks: value }
          : prac
      )
    );
  };

  // Prepare data for API
  const prepareData = () => {
    const data = {
      student: studentId,
      session,
      year,
    };
    if (assessment === "theory") {
      data.subjects = formSubjects
        .filter(sub =>
          (sub.marks.ct1.outOf75 !== "" && sub.marks.ct1.outOf75 !== undefined) ||
          (sub.marks.ct2.outOf75 !== "" && sub.marks.ct2.outOf75 !== undefined)
        )
        .map(sub => ({
          name: sub.name,
          marks: {
            ...(sub.marks.ct1.outOf75 !== "" && { ct1: { outOf75: Number(sub.marks.ct1.outOf75) } }),
            ...(sub.marks.ct2.outOf75 !== "" && { ct2: { outOf75: Number(sub.marks.ct2.outOf75) } }),
            otherMarks: {
              assignment: sub.marks.otherMarks.assignment !== "" ? Number(sub.marks.otherMarks.assignment) : undefined,
              extraCurricular: sub.marks.otherMarks.extraCurricular !== "" ? Number(sub.marks.otherMarks.extraCurricular) : undefined,
              attendance: sub.marks.otherMarks.attendance !== "" ? Number(sub.marks.otherMarks.attendance) : undefined
            }
          }
        }));
    }
    if (assessment === "practical") {
      data.practicals = formPracticals
        .filter(prac => prac.marks !== "" && prac.marks !== undefined)
        .map(prac => ({
          name: prac.name,
          marks: Number(prac.marks)
        }));
    }
    return data;
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    const data = prepareData();
    setLoading(true);
    try {
      await createOrUpdateResult(data);
      toast.success("Result saved successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  // Clamp helper
  const clampWithError = (value, min, max) => {
    if (value === "") return { value: "", error: false };
    const num = Number(value);
    if (isNaN(num)) return { value: min, error: true };
    if (num < min) return { value: min, error: true };
    if (num > max) return { value: max, error: true };
    return { value: num, error: false };
  };

  return (
    <form
      className="bg-white rounded shadow p-6 max-w-2xl mx-auto"
      onSubmit={handleSubmit}
      onKeyDown={e => {
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
          // Prevent form submit on Enter in input, move to next field
          e.preventDefault();
          const form = e.target.form;
          const index = Array.prototype.indexOf.call(form, e.target);
          // Find next input (skip disabled/hidden)
          for (let i = index + 1; i < form.elements.length; i++) {
            const next = form.elements[i];
            if (
              next.tagName === "INPUT" &&
              !next.disabled &&
              next.type !== "hidden" &&
              next.offsetParent !== null
            ) {
              next.focus();
              break;
            }
          }
        }
      }}
    >
      <div className="mb-4">
        <label className="block font-semibold mb-1">Year</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          {yearOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Assessment Type</label>
        <div className="flex gap-4">
          {assessmentTypes.map(opt => (
            <label key={opt.value} className="flex items-center gap-1">
              <input
                type="radio"
                name="assessment"
                value={opt.value}
                checked={assessment === opt.value}
                onChange={e => setAssessment(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Theory Subjects - vertical layout */}
      {assessment === "theory" && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Theory Subjects</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">Subject</th>
                  <th className="px-3 py-2 border">CT1 (out of 75)</th>
                  <th className="px-3 py-2 border">CT2 (out of 75)</th>
                  <th className="px-3 py-2 border">Assignment (out of 5)</th>
                  <th className="px-3 py-2 border">Extra Curricular (out of 5)</th>
                  <th className="px-3 py-2 border">Attendance (out of 5)</th>
                </tr>
              </thead>
              <tbody>
                {formSubjects.map((sub, idx) => (
                  <tr key={sub.name}>
                    <td className="border px-3 py-2 font-medium">{sub.name}</td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={75}
                        className={`border px-2 py-1 rounded w-20 ${inputErrors[`ct1-${idx}`] ? "border-red-500" : ""}`}
                        value={sub.marks.ct1.outOf75}
                        onChange={e => {
                          const { value, error } = clampWithError(e.target.value, 0, 75);
                          handleSubjectMarksChange(idx, "ct1", value, "outOf75");
                          setInputErrors(prev => ({
                            ...prev,
                            [`ct1-${idx}`]: error
                          }));
                        }}
                      />
                      {inputErrors[`ct1-${idx}`] && (
                        <div className="text-xs text-red-500 mt-1">Value must be between 0 and 75</div>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={75}
                        className={`border px-2 py-1 rounded w-20 ${inputErrors[`ct2-${idx}`] ? "border-red-500" : ""}`}
                        value={sub.marks.ct2.outOf75}
                        onChange={e => {
                          const { value, error } = clampWithError(e.target.value, 0, 75);
                          handleSubjectMarksChange(idx, "ct2", value, "outOf75");
                          setInputErrors(prev => ({
                            ...prev,
                            [`ct2-${idx}`]: error
                          }));
                        }}
                      />
                      {inputErrors[`ct2-${idx}`] && (
                        <div className="text-xs text-red-500 mt-1">Value must be between 0 and 75</div>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        className={`border px-2 py-1 rounded w-16 ${inputErrors[`assignment-${idx}`] ? "border-red-500" : ""}`}
                        value={sub.marks.otherMarks.assignment}
                        onChange={e => {
                          const { value, error } = clampWithError(e.target.value, 0, 5);
                          handleSubjectMarksChange(idx, "otherMarks", {
                            ...sub.marks.otherMarks,
                            assignment: value,
                          });
                          setInputErrors(prev => ({
                            ...prev,
                            [`assignment-${idx}`]: error
                          }));
                        }}
                      />
                      {inputErrors[`assignment-${idx}`] && (
                        <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        className={`border px-2 py-1 rounded w-16 ${inputErrors[`extraCurricular-${idx}`] ? "border-red-500" : ""}`}
                        value={sub.marks.otherMarks.extraCurricular}
                        onChange={e => {
                          const { value, error } = clampWithError(e.target.value, 0, 5);
                          handleSubjectMarksChange(idx, "otherMarks", {
                            ...sub.marks.otherMarks,
                            extraCurricular: value,
                          });
                          setInputErrors(prev => ({
                            ...prev,
                            [`extraCurricular-${idx}`]: error
                          }));
                        }}
                      />
                      {inputErrors[`extraCurricular-${idx}`] && (
                        <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        className={`border px-2 py-1 rounded w-16 ${inputErrors[`attendance-${idx}`] ? "border-red-500" : ""}`}
                        value={sub.marks.otherMarks.attendance}
                        onChange={e => {
                          const { value, error } = clampWithError(e.target.value, 0, 5);
                          handleSubjectMarksChange(idx, "otherMarks", {
                            ...sub.marks.otherMarks,
                            attendance: value,
                          });
                          setInputErrors(prev => ({
                            ...prev,
                            [`attendance-${idx}`]: error
                          }));
                        }}
                      />
                      {inputErrors[`attendance-${idx}`] && (
                        <div className="text-xs text-red-500 mt-1">Value must be between 0 and 5</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practicals - vertical layout */}
      {assessment === "practical" && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Practicals</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">Practical</th>
                  <th className="px-3 py-2 border">Marks (out of 100)</th>
                </tr>
              </thead>
              <tbody>
                {formPracticals.map((prac, idx) => (
                  <tr key={prac.name}>
                    <td className="border px-3 py-2 font-medium">{prac.name}</td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="border px-2 py-1 rounded w-24"
                        value={prac.marks}
                        onChange={e =>
                          handlePracticalMarksChange(
                            idx,
                            clampWithError(e.target.value, 0, 100).value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Result"}
      </button>
    </form>
  );
};

export default ResultForm;