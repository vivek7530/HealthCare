const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: {
    type: String,
  },
  sex: {
    type: String,
  },
  blood: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["patient"],
    default: "patient",
  },
  imageUrl: {
    type: String,
  },
  medicalHistory: {
    type: String,
  },
  allergies: {
    type: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PatientModel = mongoose.model("Patient", PatientSchema);

module.exports = PatientModel;
