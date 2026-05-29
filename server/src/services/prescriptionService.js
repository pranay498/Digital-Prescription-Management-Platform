const Prescription = require('../models/Prescription');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class PrescriptionService {
  async createPrescription(doctorId, { patientPhoneNumber, patientName, patientAge, diagnosis, notes, medicines, status }) {
    if (!patientPhoneNumber || !patientName || !patientAge || !diagnosis || !medicines || !medicines.length) {
      throw new ApiError(400, 'All fields (patientPhoneNumber, patientName, patientAge, diagnosis, medicines) are required.');
    }

    const patientUser = await User.findOne({ phoneNumber: patientPhoneNumber, role: 'patient' });
    if (!patientUser) {
      throw new ApiError(404, `Patient with phone number ${patientPhoneNumber} not found.`);
    }

    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      throw new ApiError(404, 'Doctor profile not found.');
    }

    const prescription = await Prescription.create({
      doctor: doctorUser._id,
      patient: patientUser._id,
      patientName,
      patientAge,
      diagnosis,
      notes,
      medicines,
      status: status || 'active',
      signature: doctorUser.signature || `Dr. ${doctorUser.name}`
    });

    return Prescription.findById(prescription._id)
      .populate('doctor', 'name email signature')
      .populate('patient', 'name email phoneNumber');
  }

  async getDoctorPrescriptions(doctorId) {
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    const today = new Date();
    for (let rx of prescriptions) {
      if (rx.endDate && rx.endDate < today && rx.status === 'active') {
        rx.status = 'expired';
        await rx.save();
      }
    }
    return prescriptions;
  }

  async getPatientPrescriptions(patientId) {
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name email signature')
      .sort({ createdAt: -1 });

    const today = new Date();
    for (let rx of prescriptions) {
      if (rx.endDate && rx.endDate < today && rx.status === 'active') {
        rx.status = 'expired';
        await rx.save();
      }
    }
    return prescriptions;
  }

  async getPrescriptionDetails(prescriptionId, user) {
    const prescription = await Prescription.findById(prescriptionId)
      .populate('doctor', 'name email signature')
      .populate('patient', 'name email');

    if (!prescription) {
      throw new ApiError(404, 'Prescription not found.');
    }

    const isDoctor = prescription.doctor._id.toString() === user.id;
    const isPatient = prescription.patient._id.toString() === user.id;

    if (!isDoctor && !isPatient) {
      throw new ApiError(403, 'Access denied: You are not authorized to view this prescription.');
    }

    return prescription;
  }

  async updatePrescription(prescriptionId, user, { patientName, patientAge, diagnosis, notes, medicines, status }) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found.');
    }

    if (prescription.doctor.toString() !== user.id) {
      throw new ApiError(403, 'Access denied: You are not authorized to edit this prescription.');
    }

    if (patientName !== undefined) prescription.patientName = patientName;
    if (patientAge !== undefined) prescription.patientAge = patientAge;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;
    if (medicines !== undefined && medicines.length) prescription.medicines = medicines;
    if (status !== undefined) prescription.status = status;

    await prescription.save();

    return Prescription.findById(prescription._id)
      .populate('doctor', 'name email signature')
      .populate('patient', 'name email phoneNumber');
  }

  async updateStatus(prescriptionId, user, status) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found.');
    }

    if (prescription.doctor.toString() !== user.id) {
      throw new ApiError(403, 'Access denied: You are not authorized to update this prescription status.');
    }

    prescription.status = status;
    await prescription.save();

    return prescription;
  }

  async getDoctorPatients(doctorId) {
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate('patient', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    const patientMap = {};
    for (let rx of prescriptions) {
      if (!rx.patient) continue;
      const pid = rx.patient._id.toString();
      if (!patientMap[pid]) {
        patientMap[pid] = {
          ...rx.patient._doc,
          prescriptionCount: 0,
          lastVisit: rx.createdAt,
          lastMedicine: rx.medicines[0]?.name || 'N/A'
        };
      }
      patientMap[pid].prescriptionCount++;
    }
    return Object.values(patientMap);
  }

  async getDoctorMedicines(doctorId) {
    const prescriptions = await Prescription.find({ doctor: doctorId });
    const medicineMap = {};
    for (let rx of prescriptions) {
      for (let med of rx.medicines) {
        const key = med.name.toLowerCase();
        if (!medicineMap[key]) {
          medicineMap[key] = { name: med.name, count: 0, dosages: new Set(), frequency: med.frequency || 'N/A' };
        }
        medicineMap[key].count++;
        medicineMap[key].dosages.add(med.dosage);
      }
    }
    return Object.values(medicineMap)
      .map(m => ({ ...m, dosages: [...m.dosages] }))
      .sort((a, b) => b.count - a.count);
  }
}

module.exports = new PrescriptionService();
