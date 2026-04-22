const mongoose = require('mongoose');

const AppointmentMessageSchema = new mongoose.Schema({
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sender_type: {
    type: String,
    enum: ['Doctor', 'Patient'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
AppointmentMessageSchema.index({ appointment_id: 1, timestamp: 1 });

const AppointmentMessageModel = mongoose.model('AppointmentMessage', AppointmentMessageSchema);

module.exports = AppointmentMessageModel;
