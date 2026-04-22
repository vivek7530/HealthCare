// AppointmentRoutes.js
const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/AppointmentController");

// Enhanced appointment endpoints
router.post("/", AppointmentController.createAppointment);
router.get("/", AppointmentController.getAppointments);
router.get("/:id", AppointmentController.getAppointmentById);
router.put("/:id/status", AppointmentController.updateAppointmentStatus);
router.delete("/:id", AppointmentController.deleteAppointment);

// Message endpoints
router.get("/:appointmentId/messages", AppointmentController.getAppointmentMessages);
router.post("/:appointmentId/messages", AppointmentController.addMessage);

// Legacy endpoints for backward compatibility
router.post("/add", AppointmentController.createAppointment);
router.get("/all", AppointmentController.getAppointments);
router.get("/displayappointment/:id", AppointmentController.getAppointmentById);
router.delete("/deleteappointment/:id", AppointmentController.deleteAppointment);

module.exports = router;
