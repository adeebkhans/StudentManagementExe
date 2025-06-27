const { cloudinary, getSignedAadhaarUrl } = require('../Utils/Cloudinary');
const Student = require('../Schemas/StudentSchema');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { name, fathername, mothername, studentMob, parentsMob, session } = req.body;

        // Basic validation
        if (!name || !fathername || !mothername || !studentMob || !parentsMob || !session) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                data: null
            });
        }

        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student
        });
    } catch (err) {
        console.error("Create student error:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Failed to create student",
            data: null
        });
    }
};

// Get all students with filter options
exports.getAllStudents = async (req, res) => {
    try {
        const filter = {};
        const { name, fathername, mothername, studentMob, parentsMob, session, enrollment, course, aadharcard } = req.query;

        if (name) filter.name = { $regex: name, $options: 'i' };
        if (fathername) filter.fathername = { $regex: fathername, $options: 'i' };
        if (mothername) filter.mothername = { $regex: mothername, $options: 'i' };
        if (studentMob) filter.studentMob = { $regex: studentMob, $options: 'i' };
        if (parentsMob) filter.parentsMob = { $regex: parentsMob, $options: 'i' };
        if (session) filter.session = session;
        if (enrollment) filter.enrollment = { $regex: enrollment, $options: 'i' };
        if (course) filter.course = { $regex: course, $options: 'i' };
        if (aadharcard) filter.aadharcard = { $regex: aadharcard, $options: 'i' };

        const students = await Student.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            data: students
        });
    } catch (err) {
        console.error("Get all students error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch students",
            data: null
        });
    }
};

// Get a student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID format",
                data: null
            });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
                data: null
            });
        }

        // // Generate Aadhaar signed URL if Aadhaar image exists
        // let aadhaarSignedUrl = null;
        // if (student.aadharImage && student.aadharImage.public_id) {
        //     aadhaarSignedUrl = await getSignedAadhaarUrl(student.aadharImage.public_id);
        // }

        res.status(200).json({
            success: true,
            message: "Student fetched successfully",
            data: {
                ...student.toObject(),
                // aadhaarSignedUrl
            }
        });
    } catch (err) {
        console.error("Get student by ID error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch student",
            data: null
        });
    }
};

// Update a student by ID
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID format",
                data: null
            });
        }

        // Prevent updating aadharImage field
        const updateData = { ...req.body };
        delete updateData.aadharImage;

        const student = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student
        });
    } catch (err) {
        console.error("Update student error:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Failed to update student",
            data: null
        });
    }
};

// Delete a student by ID
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID format",
                data: null
            });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
                data: null
            });
        }

        // Delete Aadhaar image from Cloudinary if exists
        if (student.aadharImage && student.aadharImage.public_id) {
            try {
                await cloudinary.uploader.destroy(student.aadharImage.public_id, {
                    resource_type: "image",
                    type: "authenticated"
                });
            } catch (cloudErr) {
                console.error("Cloudinary delete error:", cloudErr);
            }
        }

        await Student.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Student and associated Aadhaar image deleted successfully",
            data: null
        });
    } catch (err) {
        console.error("Delete student error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to delete student",
            data: null
        });
    }
};

// Aadhaar image upload
exports.uploadAadhaar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded", data: null });
        }

        const { id } = req.params;

        // Check if student already has an Aadhaar image
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found", data: null });
        }
        if (student.aadharImage && student.aadharImage.public_id) {
            return res.status(400).json({ success: false, message: "Aadhaar image already uploaded", data: null });
        }

        // Upload to Cloudinary using upload_stream
        const streamUpload = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "aadhaar",
                        access_mode: "authenticated",
                        resource_type: "image"
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await streamUpload();

        // Save public_id and secure_url in student record
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
                aadharImage: {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Aadhaar image uploaded successfully",
            data: {
                public_id: result.public_id,
                secure_url: result.secure_url,
                student: updatedStudent
            }
        });
    } catch (err) {
        console.error("Aadhaar upload error:", err);
        res.status(500).json({ success: false, message: err.message, data: null });
    }
};

// Export all students to Excel
exports.exportStudents = async (req, res) => {
    try {
        // Optional session filter
        const { session } = req.query;
        const filter = {};
        if (session) filter.session = session;

        // Sort students alphabetically by name
        const students = await Student.find(filter).sort({ name: 1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students');

        // Define columns with S.No.
        worksheet.columns = [
            { header: 'S.No.', key: 'sno', width: 8 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Father Name', key: 'fathername', width: 20 },
            { header: 'Mother Name', key: 'mothername', width: 20 },
            { header: 'Student Mobile', key: 'studentMob', width: 15 },
            { header: 'Parents Mobile', key: 'parentsMob', width: 15 },
            { header: 'Enrollment', key: 'enrollment', width: 20 },
            { header: 'Aadhar Card', key: 'aadharcard', width: 20 },
            { header: 'Aadhaar Image', key: 'aadharImage', width: 30 },
            { header: 'Course', key: 'course', width: 20 },
        ];

        // Add rows with S.No.
        students.forEach((student, idx) => {
            const aadhaarUrl = student.aadharImage && student.aadharImage.secure_url
                ? student.aadharImage.secure_url
                : null;
            const row = worksheet.addRow({
                sno: idx + 1,
                name: student.name,
                fathername: student.fathername,
                mothername: student.mothername,
                studentMob: student.studentMob,
                parentsMob: student.parentsMob,
                aadharcard: student.aadharcard,
                enrollment: student.enrollment || 'N/A',
                aadharImage: aadhaarUrl ? 'View Aadhaar' : 'N/A',
                course: student.course || 'N/A'
            });

            // If Aadhaar URL exists, set hyperlink
            if (aadhaarUrl) {
                row.getCell('aadharImage').value = {
                    text: 'View Aadhaar',
                    hyperlink: aadhaarUrl
                };
                row.getCell('aadharImage').font = { color: { argb: 'FF0000FF' }, underline: true };
            }
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=students${session ? '-' + session : ''}.xlsx`
        );

        // Write workbook to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Export students error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to export students",
            data: null
        });
    }
};
