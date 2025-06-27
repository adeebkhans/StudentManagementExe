const express = require('express');
const router = express.Router();
const StudentController = require('../Controllers/StudentController');
const AuthMiddleware = require('../Middlewares/Auth');
const upload = require('../Middlewares/Multer');

// Create a new student
router.post('/', AuthMiddleware, StudentController.createStudent);

// Get all students
router.get('/', AuthMiddleware, StudentController.getAllStudents);

// Export students to Excel
router.get('/export', AuthMiddleware, StudentController.exportStudents);

// Get a student by ID
router.get('/:id', AuthMiddleware, StudentController.getStudentById);

// Update a student by ID
router.put('/:id', AuthMiddleware, StudentController.updateStudent);

// Delete a student by ID
router.delete('/:id', AuthMiddleware, StudentController.deleteStudent);

// Aadhaar image upload (POST /:id/aadhaar)
router.post('/:id/aadhar', AuthMiddleware, upload.single('aadhar'), StudentController.uploadAadhaar);


module.exports = router;