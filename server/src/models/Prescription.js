const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  patientName: {
    type: String,
    required: true
  },

  patientAge: {
    type: Number,
    required: true
  },

  diagnosis: {
    type: String,
    required: true
  },

  notes: {
    type: String,
    default: ''
  },

  medicines: [
    {
      name: {
        type: String,
        required: true
      },

      dosage: {
        type: String,
        required: true
      },

      frequency: {
        type: String,
        required: true
      },

      duration: {
        type: String,
        required: true
      }
    }
  ],

  signature: {
    type: String,
    required: true
  },

    status: {
      type: String,
      enum: ['active', 'expired', 'pending'],
      default: 'active'
    },

    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }, {
    timestamps: true
  });

PrescriptionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.doctor && ret.doctor.name) {
      ret.doctorName = ret.doctor.name;
    }
    return ret;
  }
});
PrescriptionSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.doctor && ret.doctor.name) {
      ret.doctorName = ret.doctor.name;
    }
    return ret;
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
