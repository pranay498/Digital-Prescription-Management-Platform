const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/prescriptions (Doctor only)
router.post('/', authenticate, requireRole('doctor'), prescriptionController.createPrescription);

// GET /api/prescriptions/doctor (Doctor only)
router.get('/doctor', authenticate, requireRole('doctor'), prescriptionController.getDoctorPrescriptions);

// GET /api/prescriptions/doctor/patients (Doctor only)
router.get('/doctor/patients', authenticate, requireRole('doctor'), prescriptionController.getDoctorPatients);

// GET /api/prescriptions/doctor/medicines (Doctor only)
router.get('/doctor/medicines', authenticate, requireRole('doctor'), prescriptionController.getDoctorMedicines);

// GET /api/prescriptions/patient (Patient only)
router.get('/patient', authenticate, requireRole('patient'), prescriptionController.getPatientPrescriptions);

// GET /api/prescriptions/:id (Authenticated doctor/patient)
router.get('/:id', authenticate, prescriptionController.getPrescriptionDetails);

// PATCH /api/prescriptions/:id/status (Doctor only)
router.patch('/:id/status', authenticate, requireRole('doctor'), prescriptionController.updateStatus);

// PUT /api/prescriptions/:id (Doctor only — full update)
router.put('/:id', authenticate, requireRole('doctor'), prescriptionController.updatePrescription);

// GET /api/prescriptions/:id/pdf (Authenticated doctor/patient)
router.get('/:id/pdf', authenticate, prescriptionController.generatePrescriptionPDF);

module.exports = router;
