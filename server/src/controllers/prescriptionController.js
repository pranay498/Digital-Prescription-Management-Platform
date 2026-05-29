const prescriptionService = require('../services/prescriptionService');
const pdfService = require('../services/pdfService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createPrescription = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { patientPhoneNumber, patientName, patientAge, diagnosis, notes, medicines, status } = req.body;

  const prescription = await prescriptionService.createPrescription(doctorId, {
    patientPhoneNumber,
    patientName,
    patientAge,
    diagnosis,
    notes,
    medicines,
    status
  });

  res.status(201).json(new ApiResponse(201, prescription, 'Prescription created successfully.'));
});

const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const prescriptions = await prescriptionService.getDoctorPrescriptions(doctorId);
  res.status(200).json(new ApiResponse(200, { prescriptions }, 'Doctor prescriptions retrieved successfully.'));
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const prescriptions = await prescriptionService.getPatientPrescriptions(patientId);
  res.status(200).json(new ApiResponse(200, { prescriptions }, 'Patient prescription history retrieved successfully.'));
});

const getPrescriptionDetails = asyncHandler(async (req, res) => {
  const prescriptionId = req.params.id;
  const prescription = await prescriptionService.getPrescriptionDetails(prescriptionId, req.user);
  res.status(200).json(new ApiResponse(200, { prescription }, 'Prescription details retrieved successfully.'));
});

const generatePrescriptionPDF = asyncHandler(async (req, res) => {
  const prescriptionId = req.params.id;
  const prescription = await prescriptionService.getPrescriptionDetails(prescriptionId, req.user);
  pdfService.generatePrescriptionPDF(prescription, res);
});

const updatePrescription = asyncHandler(async (req, res) => {
  const { patientName, patientAge, diagnosis, notes, medicines, status } = req.body;
  const prescription = await prescriptionService.updatePrescription(
    req.params.id,
    req.user,
    { patientName, patientAge, diagnosis, notes, medicines, status }
  );
  res.status(200).json(new ApiResponse(200, { prescription }, 'Prescription updated successfully.'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'pending', 'expired'].includes(status)) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid status value.'));
  }
  const prescription = await prescriptionService.updateStatus(req.params.id, req.user, status);
  res.status(200).json(new ApiResponse(200, { prescription }, 'Prescription status updated successfully.'));
});

const getDoctorPatients = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const patients = await prescriptionService.getDoctorPatients(doctorId);
  res.status(200).json(new ApiResponse(200, { patients }, 'Patients retrieved successfully.'));
});

const getDoctorMedicines = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const medicines = await prescriptionService.getDoctorMedicines(doctorId);
  res.status(200).json(new ApiResponse(200, { medicines }, 'Medicines retrieved successfully.'));
});

module.exports = {
  createPrescription,
  updatePrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionDetails,
  generatePrescriptionPDF,
  updateStatus,
  getDoctorPatients,
  getDoctorMedicines
};
