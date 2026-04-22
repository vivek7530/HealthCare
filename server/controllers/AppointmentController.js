// AppointmentController.js
const AppointmentModel = require("../models/AppointmentModel");
const AppointmentMessageModel = require("../models/AppointmentMessageModel");

const AppointmentController = {
  createAppointment: async (req, res) => {
    try {
      const { patient_id, doctor_id, patientName, doctorName, reason } = req.body;

      // Simple appointment creation - only required fields
      const appointment = await AppointmentModel.create({
        patient_id,
        doctor_id,
        patientName,
        doctorName,
        reason,
        status: 'Pending'
      });

      // Create the initial message with the reason
      await AppointmentMessageModel.create({
        appointment_id: appointment._id,
        sender_id: patient_id,
        sender_type: 'Patient',
        message: reason,
        timestamp: new Date()
      });

      // Populate the appointment with related data
      const populatedAppointment = await AppointmentModel.findById(appointment._id)
        .populate('patient_id', 'name email')
        .populate('doctor_id', 'name email specialization');

      res.status(201).json(populatedAppointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAppointments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, patient_id, doctor_id } = req.query;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (patient_id) filter.patient_id = patient_id;
      if (doctor_id) filter.doctor_id = doctor_id;

      // Get appointments with pagination
      const appointments = await AppointmentModel.find(filter)
        .populate('patient_id', 'name email')
        .populate('doctor_id', 'name email specialization')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination metadata
      const total = await AppointmentModel.countDocuments(filter);

      res.json({
        appointments,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAppointmentById: async (req, res) => {
    try {
      const appointment = await AppointmentModel.findById(req.params.id)
        .populate('patient_id', 'name email')
        .populate('doctor_id', 'name email specialization');

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateAppointmentStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const appointmentId = req.params.id;

      // Validate status
      if (!['Pending', 'Active', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const appointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true }
      ).populate('patient_id', 'name email')
       .populate('doctor_id', 'name email specialization');

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteAppointment: async (req, res) => {
    try {
      const appointmentId = req.params.id;

      // Delete associated messages first
      await AppointmentMessageModel.deleteMany({ appointment_id: appointmentId });

      // Delete the appointment
      const result = await AppointmentModel.findByIdAndDelete(appointmentId);

      if (!result) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Message related endpoints
  getAppointmentMessages: async (req, res) => {
    try {
      const { appointmentId } = req.params;

      const messages = await AppointmentMessageModel.find({ appointment_id: appointmentId })
        .populate('sender_id', 'name')
        .sort({ timestamp: 1 });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  addMessage: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { sender_id, sender_type, message } = req.body;

      // Check if appointment exists and is not completed/cancelled
      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
        return res.status(400).json({ message: "Cannot add messages to completed or cancelled appointments" });
      }

      // If this is the first doctor reply, change status to Active
      if (sender_type === 'Doctor' && appointment.status === 'Pending') {
        await AppointmentModel.findByIdAndUpdate(appointmentId, { status: 'Active' });
      }

      const newMessage = await AppointmentMessageModel.create({
        appointment_id: appointmentId,
        sender_id,
        sender_type,
        message
      });

      const populatedMessage = await AppointmentMessageModel.findById(newMessage._id)
        .populate('sender_id', 'name');

      res.status(201).json(populatedMessage);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = AppointmentController;
