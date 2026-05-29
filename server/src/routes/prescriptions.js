const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('doctor'), prescriptionController.createPrescription);

router.get('/doctor', authenticate, requireRole('doctor'), prescriptionController.getDoctorPrescriptions);

router.get('/doctor/patients', authenticate, requireRole('doctor'), prescriptionController.getDoctorPatients);

router.get('/doctor/medicines', authenticate, requireRole('doctor'), prescriptionController.getDoctorMedicines);

router.get('/patient', authenticate, requireRole('patient'), prescriptionController.getPatientPrescriptions);

router.get('/:id', authenticate, prescriptionController.getPrescriptionDetails);

router.patch('/:id/status', authenticate, requireRole('doctor'), prescriptionController.updateStatus);

router.put('/:id', authenticate, requireRole('doctor'), prescriptionController.updatePrescription);

router.get('/:id/pdf', authenticate, prescriptionController.generatePrescriptionPDF);

module.exports = router;
