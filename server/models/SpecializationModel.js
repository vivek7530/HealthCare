const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
SpecializationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SpecializationModel = mongoose.model('Specialization', SpecializationSchema);

module.exports = SpecializationModel;
