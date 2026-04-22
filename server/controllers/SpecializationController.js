const SpecializationModel = require('../models/SpecializationModel');

const SpecializationController = {
  // Get all specializations
  getAllSpecializations: async (req, res) => {
    try {
      const specializations = await SpecializationModel.find({ isActive: true })
        .sort({ name: 1 });
      res.status(200).json(specializations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get specialization by ID
  getSpecializationById: async (req, res) => {
    try {
      const specialization = await SpecializationModel.findById(req.params.id);
      if (!specialization) {
        return res.status(404).json({ message: 'Specialization not found' });
      }
      res.status(200).json(specialization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new specialization
  createSpecialization: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      // Check if specialization already exists
      const existingSpecialization = await SpecializationModel.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingSpecialization) {
        return res.status(400).json({ message: 'Specialization already exists' });
      }

      const newSpecialization = new SpecializationModel({
        name,
        description
      });

      const savedSpecialization = await newSpecialization.save();
      res.status(201).json(savedSpecialization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update specialization
  updateSpecialization: async (req, res) => {
    try {
      const { name, description, isActive } = req.body;
      const updatedSpecialization = await SpecializationModel.findByIdAndUpdate(
        req.params.id,
        { name, description, isActive },
        { new: true, runValidators: true }
      );

      if (!updatedSpecialization) {
        return res.status(404).json({ message: 'Specialization not found' });
      }

      res.status(200).json(updatedSpecialization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete specialization (soft delete - set isActive to false)
  deleteSpecialization: async (req, res) => {
    try {
      const deletedSpecialization = await SpecializationModel.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!deletedSpecialization) {
        return res.status(404).json({ message: 'Specialization not found' });
      }

      res.status(200).json({ message: 'Specialization deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add default specializations
  addDefaultSpecializations: async (req, res) => {
    try {
      const defaultSpecializations = [
        { name: 'Cardiology', description: 'Heart and cardiovascular system specialist' },
        { name: 'Neurology', description: 'Brain and nervous system specialist' },
        { name: 'Pediatrics', description: 'Children health specialist' },
        { name: 'Orthopedics', description: 'Bones and joints specialist' },
        { name: 'Dermatology', description: 'Skin and hair specialist' },
        { name: 'Psychiatry', description: 'Mental health specialist' },
        { name: 'Gynecology', description: 'Female reproductive system specialist' },
        { name: 'Ophthalmology', description: 'Eye care specialist' },
        { name: 'ENT', description: 'Ear, Nose, and Throat specialist' },
        { name: 'Gastroenterology', description: 'Digestive system specialist' },
        { name: 'Endocrinology', description: 'Hormone and gland specialist' },
        { name: 'Oncology', description: 'Cancer treatment specialist' },
        { name: 'Nephrology', description: 'Kidney specialist' },
        { name: 'Pulmonology', description: 'Lungs and respiratory system specialist' },
        { name: 'Rheumatology', description: 'Joint and autoimmune diseases specialist' }
      ];

      const addedSpecializations = [];
      
      for (const spec of defaultSpecializations) {
        const existingSpec = await SpecializationModel.findOne({ 
          name: { $regex: new RegExp(`^${spec.name}$`, 'i') }
        });
        
        if (!existingSpec) {
          const newSpec = new SpecializationModel(spec);
          await newSpec.save();
          addedSpecializations.push(newSpec);
        }
      }

      res.status(201).json({
        message: 'Default specializations added successfully',
        added: addedSpecializations.length,
        total: addedSpecializations
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = SpecializationController;
