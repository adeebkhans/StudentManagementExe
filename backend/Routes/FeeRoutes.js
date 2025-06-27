const express = require('express');
const router = express.Router();
const FeeController = require('../Controllers/FeeController');
const AuthMiddleware = require('../Middlewares/Auth');

// Create a new fee record
router.post('/', AuthMiddleware, FeeController.createFee);

// Get all fee records
router.get('/', AuthMiddleware, FeeController.getAllFees);

// Get all students with no fee records
router.get('/newstudents', AuthMiddleware, FeeController.getNewStudentsWithNoFeeRecords);

// Get all fee records for a specific student
router.get('/student/:studentId', AuthMiddleware, FeeController.getFeesByStudentId);

// Export all fee records to Excel
router.get('/export', AuthMiddleware, FeeController.exportFees);

// Get a fee record by ID
router.get('/:id', AuthMiddleware, FeeController.getFeeById);

// Update a fee record by ID
router.put('/:id', AuthMiddleware, FeeController.updateFee);

// Delete a fee record by ID
router.delete('/:id', AuthMiddleware, FeeController.deleteFee);

module.exports = router;