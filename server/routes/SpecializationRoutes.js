const express = require('express');
const router = express.Router();
const SpecializationController = require('../controllers/SpecializationController');

// Get all active specializations
router.get('/', SpecializationController.getAllSpecializations);

// Get specialization by ID
router.get('/:id', SpecializationController.getSpecializationById);

// Create new specialization
router.post('/', SpecializationController.createSpecialization);

// Update specialization
router.put('/:id', SpecializationController.updateSpecialization);

// Delete specialization (soft delete)
router.delete('/:id', SpecializationController.deleteSpecialization);

// Add default specializations
router.post('/add-defaults', SpecializationController.addDefaultSpecializations);

module.exports = router;
