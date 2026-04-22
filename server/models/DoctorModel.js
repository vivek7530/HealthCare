const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
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
    enum: ["doctor"],
    default: "doctor",
  },
  imageUrl: {
    type: String,
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  area: String,
  visit: String,
  degree: String,
  availability: [
    {
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
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
DoctorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DoctorModel = mongoose.model("Doctor", DoctorSchema);

module.exports = DoctorModel;
