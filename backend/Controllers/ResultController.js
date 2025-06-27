const Result = require("../Schemas/ResultSchema");
const ExcelJS = require('exceljs');

/**
 * Create or update a student's result for a session and year.
 * - If result doc for student+session+year exists, update it.
 * - If not, create a new doc.
 * - If subject/practical exists, update marks; else add new.
 * - Handles partial updates (ct1/ct2/ other marks).
 */
async function CreateUpdateResult(req, res) {
    try {
        const { student, session, year, subjects = [], practicals = [] } = req.body;

        if (!student || !session || !year) {
            return res.status(400).json({ message: "student, session, and year are required." });
        }
        if (!["first", "second"].includes(year)) {
            return res.status(400).json({ message: "year must be 'first' or 'second'." });
        }

        // Find existing result for this student, session, and year
        let result = await Result.findOne({ student, session, year });

        if (!result) {
            // Create new result document
            result = new Result({
                student,
                session,
                year,
                subjects: [],
                practicals: []
            });
        }

        // --- Subjects ---
        if (Array.isArray(subjects)) {
            subjects.forEach(sub => {
                if (!sub.name) return; // skip if no subject name
                let existing = result.subjects.find(s => s.name === sub.name);
                if (existing) {
                    // Update ct1/ct2 if provided
                    if (sub.marks && sub.marks.ct1) {
                        existing.marks.ct1 = {
                            ...existing.marks.ct1,
                            ...sub.marks.ct1
                        };
                    }
                    if (sub.marks && sub.marks.ct2) {
                        existing.marks.ct2 = {
                            ...existing.marks.ct2,
                            ...sub.marks.ct2
                        };
                    }
                    // Update otherMarks if provided
                    if (sub.marks && sub.marks.otherMarks) {
                        existing.marks.otherMarks = {
                            ...existing.marks.otherMarks,
                            ...sub.marks.otherMarks
                        };
                    }
                } else {
                    // Add new subject
                    result.subjects.push({
                        name: sub.name,
                        marks: {
                            ct1: sub.marks?.ct1 || {},
                            ct2: sub.marks?.ct2 || {},
                            otherMarks: sub.marks?.otherMarks || {}
                        }
                    });
                }
            });
        }

        // --- Practicals ---
        if (Array.isArray(practicals)) {
            practicals.forEach(prac => {
                if (!prac.name) return;
                let existing = result.practicals.find(p => p.name === prac.name);
                if (existing) {
                    if (typeof prac.marks === "number") existing.marks = prac.marks;
                } else {
                    result.practicals.push({
                        name: prac.name,
                        marks: prac.marks
                    });
                }
            });
        }

        await result.save();
        return res.status(200).json({ message: "Result saved successfully", result });
    } catch (err) {
        console.error("CreateUpdateResult error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

/**
 * Get all results with populated student name and enrollment.
 * Supports query filters: session, year, enrollment, name
 */
async function getAllResults(req, res) {
    try {
        const { session, year, enrollment, name } = req.query;
        
        // Build the query object
        let query = {};
        
        // Direct filters on Result model
        if (session) {
            query.session = { $regex: session, $options: 'i' }; // Case-insensitive partial match
        }
        if (year) {
            query.year = year; // Exact match for year (first/second)
        }

        // For student-related filters, we'll use populate with match
        let populateOptions = {
            path: "student",
            select: "name enrollment"
        };

        // If we have student-related filters, add match condition
        if (enrollment || name) {
            populateOptions.match = {};
            if (enrollment) {
                populateOptions.match.enrollment = { $regex: enrollment, $options: 'i' };
            }
            if (name) {
                populateOptions.match.name = { $regex: name, $options: 'i' };
            }
        }

        let results = await Result.find(query).populate(populateOptions);
        
        // Filter out results where student didn't match the populate criteria
        if (enrollment || name) {
            results = results.filter(result => result.student !== null);
        }

        return res.status(200).json({ results });
    } catch (err) {
        console.error("getAllResults error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

// Get all results for a student (by student ObjectId)
async function getResultsByStudentId(req, res) {
    try {
        const { studentId } = req.params;
        const { year } = req.query;

        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        const query = { student: studentId };
        if (year) {
            query.year = year;
        }

        const results = await Result.find(query);
        return res.status(200).json({ results });
    } catch (err) {
        console.error("GetResultsByStudentId error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

// Get a result by its document id
async function getResultById(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Result id is required" });
        }
        const result = await Result.findById(id)
            .populate({
                path: "student",
                select: "name enrollment"
            })
            .lean(); 
        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }
        return res.status(200).json({ result });
    } catch (err) {
        console.error("GetResultById error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

/**
 * Delete a result by its document id
 */
async function deleteResultById(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Result id is required" });
        }
        const deleted = await Result.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Result not found" });
        }
        return res.status(200).json({ message: "Result deleted successfully" });
    } catch (err) {
        console.error("DeleteResultById error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

/**
 * Export all results to Excel with the same format as ResultTable
 * Supports query filters: session, year only
 */
async function exportResults(req, res) {
    try {
        const { session, year } = req.query;

        // Build the query object
        let query = {};
        if (session) query.session = session;
        if (year) query.year = year;

        const results = await Result.find(query).populate({
            path: "student",
            select: "name enrollment"
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Results');

        // Define column headers
        const headers = [
            'S.No.',
            'Student Name',
            'Enrollment',
            'Session',
            'Year',
            'Subject/Practical Name',
            'CT1/75',
            'CT1/5',
            'CT2/75',
            'CT2/5',
            'Assignment',
            'Extra Curricular',
            'Attendance',
            'Max Marks',
            'Total Marks'
        ];

        worksheet.addRow(headers);

        // Style header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; 
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        let rowIndex = 2;

        results.forEach((result, resultIdx) => {
            const allItems = [
                ...(result.subjects || []).map(subject => ({
                    type: 'subject',
                    data: subject
                })),
                ...(result.practicals || []).map(practical => ({
                    type: 'practical',
                    data: practical
                }))
            ];

            const startRow = rowIndex;

            allItems.forEach((item, itemIdx) => {
                const rowData = [];

                if (itemIdx === 0) {
                    rowData.push(
                        resultIdx + 1,
                        result.student?.name || '',
                        result.student?.enrollment || '',
                        result.session || '',
                        result.year || ''
                    );
                } else {
                    rowData.push('', '', '', '', '');
                }

                rowData.push(item.data?.name || '');

                if (item.type === 'subject') {
                    const ct1_75 = item.data?.marks?.ct1?.outOf75 ?? '';
                    const ct1_5 = item.data?.marks?.ct1?.outOf5 ?? '';
                    const ct2_75 = item.data?.marks?.ct2?.outOf75 ?? '';
                    const ct2_5 = item.data?.marks?.ct2?.outOf5 ?? '';
                    const assignment = item.data?.marks?.otherMarks?.assignment ?? '';
                    const extraCurricular = item.data?.marks?.otherMarks?.extraCurricular ?? '';
                    const attendance = item.data?.marks?.otherMarks?.attendance ?? '';

                    const totalMarks =
                        (ct1_5 || 0) +
                        (ct2_5 || 0) +
                        (assignment || 0) +
                        (extraCurricular || 0) +
                        (attendance || 0);

                    rowData.push(
                        ct1_75,
                        ct1_5,
                        ct2_75,
                        ct2_5,
                        assignment,
                        extraCurricular,
                        attendance,
                        25,
                        totalMarks
                    );
                } else if (item.type === 'practical') {
                    rowData.push(
                        '', '', '', '', '', '', '', // subject fields
                        100,
                        item.data?.marks ?? ''
                    );
                }

                const row = worksheet.addRow(rowData);
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    // Vertically center for S.No., Student Name, Enrollment, Session, Year columns (1-5)
                    if (colNumber >= 1 && colNumber <= 5) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    }
                });

                rowIndex++;
            });

            // Merge cells after all rows for this result are added
            if (allItems.length > 1) {
                const endRow = rowIndex - 1;
                worksheet.mergeCells(`A${startRow}:A${endRow}`);
                worksheet.mergeCells(`B${startRow}:B${endRow}`);
                worksheet.mergeCells(`C${startRow}:C${endRow}`);
                worksheet.mergeCells(`D${startRow}:D${endRow}`);
                worksheet.mergeCells(`E${startRow}:E${endRow}`);
            }
        });

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = Math.min(maxLength + 2, 50);
            // Set alignment only for columns after CT1/75 (i.e., columns 7 and onward)
            if (column.number >= 7) {
                column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        // Set filename dynamically based on filters
        let filename = 'results';
        if (session) filename += `_${session}`;
        if (year) filename += `_${year}`;
        filename += '.xlsx';

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("exportResults error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

/**
 * Mass update or create results by subject/practical for multiple students.
 * Expects an array of objects:
 * [
 *   {
 *     student, session, year,
 *     subject: { name, marks: { ct1, ct2, otherMarks } }
 *     // or
 *     practical: { name, marks }
 *   },
 *   ...
 * ]
 */
async function updateResultBySubject(req, res) {
    try {
        const updates = req.body;
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: "Request body must be a non-empty array." });
        }

        const results = [];

        for (const item of updates) {
            const { student, session, year, subject, practical } = item;
            if (!student || !session || !year || (!subject && !practical)) {
                continue; // skip invalid entries
            }

            // Find or create the result doc
            let result = await Result.findOne({ student, session, year });
            if (!result) {
                result = new Result({
                    student,
                    session,
                    year,
                    subjects: [],
                    practicals: []
                });
            }

            // Update or add subject
            if (subject && subject.name) {
                let existing = result.subjects.find(s => s.name === subject.name);
                if (existing) {
                    if (subject.marks?.ct1) {
                        existing.marks.ct1 = {
                            ...existing.marks.ct1,
                            ...subject.marks.ct1
                        };
                    }
                    if (subject.marks?.ct2) {
                        existing.marks.ct2 = {
                            ...existing.marks.ct2,
                            ...subject.marks.ct2
                        };
                    }
                    if (subject.marks?.otherMarks) {
                        existing.marks.otherMarks = {
                            ...existing.marks.otherMarks,
                            ...subject.marks.otherMarks
                        };
                    }
                } else {
                    result.subjects.push({
                        name: subject.name,
                        marks: {
                            ct1: subject.marks?.ct1 || {},
                            ct2: subject.marks?.ct2 || {},
                            otherMarks: subject.marks?.otherMarks || {}
                        }
                    });
                }
            }

            // Update or add practical
            if (practical && practical.name) {
                let existing = result.practicals.find(p => p.name === practical.name);
                if (existing) {
                    if (typeof practical.marks === "number") existing.marks = practical.marks;
                } else {
                    result.practicals.push({
                        name: practical.name,
                        marks: practical.marks
                    });
                }
            }

            await result.save();
            results.push(result);
        }

        return res.status(200).json({ message: "Results updated successfully" });
    } catch (err) {
        console.error("updateResultBySubject error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    CreateUpdateResult,
    getResultsByStudentId,
    getResultById,
    getAllResults,
    deleteResultById,
    exportResults,
    updateResultBySubject,
};