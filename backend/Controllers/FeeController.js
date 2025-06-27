const Fee = require('../Schemas/FeeSchema');
const StudentSchema = require('../Schemas/StudentSchema');
const ExcelJS = require('exceljs');

// Create a new fee record
exports.createFee = async (req, res) => {
    try {
        const { student, code, fee, deposited, session } = req.body;

        // Check for required fields including session
        if (!student || !code || fee == null || deposited == null || !session) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                data: null
            });
        }

        // Check if fee already exists for the same student and session
        const existingFee = await Fee.findOne({ student });
        if (existingFee) {
            return res.status(409).json({
                success: false,
                message: "Fee record already exists for this student and session. Please Use Update Endpoint",
                data: null
            });
        }

        // Calculate remaining internally
        const remaining = fee - deposited;

        const newFee = new Fee({ student, code, fee, deposited, remaining, session });
        await newFee.save();

        res.status(201).json({
            success: true,
            message: "Fee record created successfully",
            data: newFee
        });
    } catch (err) {
        console.error("Create fee error:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Failed to create fee record",
            data: null
        });
    }
};

// Get all fee records with filter options
exports.getAllFees = async (req, res) => {
    try {
        const { name, enrollment, session } = req.query;
        const feeFilter = {};
        const studentFilter = {};

        // Filter by session if provided
        if (session) feeFilter.session = session;

        // Build student filter if name or enrollment provided
        if (name) studentFilter.name = { $regex: name, $options: "i" };
        if (enrollment) studentFilter.enrollment = { $regex: enrollment, $options: "i" };

        let fees;
        if (Object.keys(studentFilter).length > 0) {
            // If filtering by student fields, find matching students first
            const students = await require('../Schemas/StudentSchema').find(studentFilter).select('_id');
            const studentIds = students.map(s => s._id);
            if (studentIds.length === 0) {
                // No students match, return empty result
                return res.status(200).json({
                    success: true,
                    message: "Fee records fetched successfully. No matching students found.",
                    data: []
                });
            }
            feeFilter.student = { $in: studentIds };
        }

        fees = await Fee.find(feeFilter).populate('student');
        res.status(200).json({
            success: true,
            message: "Fee records fetched successfully",
            data: fees
        });
    } catch (err) {
        console.error("Get all fees error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch fee records",
            data: null
        });
    }
};

// Get a fee record by ID
exports.getFeeById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fee ID format",
                data: null
            });
        }
        const fee = await Fee.findById(id).populate('student');
        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found",
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: "Fee record fetched successfully",
            data: fee
        });
    } catch (err) {
        console.error("Get fee by ID error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch fee record",
            data: null
        });
    }
};

exports.getFeesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID format",
                data: null
            });
        }
        const fees = await Fee.find({ student: studentId }).populate('student');
        res.status(200).json({
            success: true,
            message: "Fee records fetched successfully for student",
            data: fees
        });
    } catch (err) {
        console.error("Get fees by student ID error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch fee records for student",
            data: null
        });
    }
};

exports.getNewStudentsWithNoFeeRecords = async (req, res) => {
    try {
        const { session } = req.query;
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Session is required",
                data: null
            });
        }

        // Find students who belong to the session
        const studentsInSession = await StudentSchema.find({ session });

        // Get all student IDs with a fee record for this session
        const fees = await Fee.find({ session }).select('student').lean();
        const feeStudentIds = new Set(fees.map(fee => fee.student.toString()));

        // Filter students who do not have a fee record for this session
        const studentsWithoutFee = studentsInSession.filter(
            student => !feeStudentIds.has(student._id.toString())
        );

        res.status(200).json({
            success: true,
            message: "Students with no fee records for the session fetched successfully",
            data: studentsWithoutFee
        });
    } catch (err) {
        console.error("Get new students with no fee records error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch new students with no fee records",
            data: null
        });
    }
};

// Update a fee record by ID
exports.updateFee = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fee ID format",
                data: null
            });
        }

        // Fetch the existing record
        const existingFee = await Fee.findById(id);
        if (!existingFee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found",
                data: null
            });
        }

        // Only allow updating deposited by adding newDeposit
        const { newDeposit } = req.body;

        // Add newDeposit to previous deposited value
        let updatedDeposited = existingFee.deposited;
        if (typeof newDeposit === "number" && !isNaN(newDeposit)) {
            updatedDeposited += newDeposit;
        }

        // Calculate remaining internally
        const remaining = existingFee.fee - updatedDeposited;

        existingFee.deposited = updatedDeposited;
        existingFee.remaining = remaining;

        await existingFee.save();

        res.status(200).json({
            success: true,
            message: "Fee record updated successfully",
            data: existingFee
        });
    } catch (err) {
        console.error("Update fee error:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Failed to update fee record",
            data: null
        });
    }
};

// Delete a fee record by ID
exports.deleteFee = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fee ID format",
                data: null
            });
        }
        const fee = await Fee.findByIdAndDelete(id);
        if (!fee) {
            return res.status(404).json({
                success: false,
                message: "Fee record not found",
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: "Fee record deleted successfully",
            data: null
        });
    } catch (err) {
        console.error("Delete fee error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to delete fee record",
            data: null
        });
    }
};

// Export all fee records to Excel
exports.exportFees = async (req, res) => {
    try {
        const { session } = req.query;
        const filter = {};
        if (session) filter.session = session;

        // Fetch and sort fees by student name (case-insensitive)
        const fees = await Fee.find(filter)
            .populate('student')
            .lean();

        // Sort fees by student name alphabetically
        fees.sort((a, b) => {
            const nameA = (a.student?.name || "").toLowerCase();
            const nameB = (b.student?.name || "").toLowerCase();
            return nameA.localeCompare(nameB);
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Fees');

        // Define columns with S.No and Session
        worksheet.columns = [
            { header: "S.No", key: "sno", width: 8 },
            { header: "Student Name", key: "studentName", width: 20 },
            { header: "Father's Name", key: "fatherName", width: 20 },
            { header: "Enrollment", key: "enrollment", width: 18 },
            { header: "Fee Code", key: "code", width: 12 },
            { header: "Session", key: "session", width: 14 },
            { header: "Total Fee", key: "fee", width: 14 },
            { header: "Deposited", key: "deposited", width: 14 },
            { header: "Remaining", key: "remaining", width: 14 },
            { header: "updatedAt", key: "updatedAt", width: 22 },
        ];

        // Add rows with S.No and Session
        fees.forEach((fee, idx) => {
            worksheet.addRow({
                sno: idx + 1,
                studentName: fee.student?.name || "N/A",
                fatherName: fee.student?.fathername || "N/A",
                enrollment: fee.student?.enrollment || "N/A",
                code: fee.code,
                session: fee.session || "N/A",
                fee: fee.fee,
                deposited: fee.deposited,
                remaining: fee.remaining,
                updatedAt: fee.updatedAt ? new Date(fee.updatedAt).toLocaleString() : "",
            });
        });

        // Set response headers with session in filename if provided
        const fileName = session ? `fees_${session}.xlsx` : 'fees.xlsx';
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${fileName}`
        );

        // Write workbook to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Export fees error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to export fees",
            data: null
        });
    }
};