const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  blood: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "patient", "doctor", "admin"],
    default: "patient",
  },
  imageUrl: {
    type: String,
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
  },
  experience: {
    type: String,
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

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;

