const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  reason: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
AppointmentSchema.index({ patient_id: 1, status: 1 });
AppointmentSchema.index({ doctor_id: 1, status: 1 });
AppointmentSchema.index({ created_at: -1 });

// Update the updated_at field before saving
AppointmentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const AppointmentModel = mongoose.model("Appointment", AppointmentSchema);

module.exports = AppointmentModel;
