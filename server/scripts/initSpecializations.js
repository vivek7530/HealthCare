const mongoose = require('mongoose');
const SpecializationModel = require('../models/SpecializationModel');
require('dotenv').config();

const initSpecializations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

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
      { name: 'Rheumatology', description: 'Joint and autoimmune diseases specialist' },
      { name: 'Urology', description: 'Urinary system specialist' },
      { name: 'General Surgery', description: 'General surgical procedures specialist' },
      { name: 'Anesthesiology', description: 'Anesthesia and pain management specialist' },
      { name: 'Radiology', description: 'Medical imaging specialist' },
      { name: 'Pathology', description: 'Disease diagnosis through lab tests specialist' }
    ];

    let addedCount = 0;
    
    for (const spec of defaultSpecializations) {
      const existingSpec = await SpecializationModel.findOne({ 
        name: { $regex: new RegExp(`^${spec.name}$`, 'i') }
      });
      
      if (!existingSpec) {
        const newSpec = new SpecializationModel(spec);
        await newSpec.save();
        console.log(`Added: ${spec.name}`);
        addedCount++;
      } else {
        console.log(`Already exists: ${spec.name}`);
      }
    }

    console.log(`\nInitialization complete! Added ${addedCount} new specializations.`);
    
    // Display all specializations
    const allSpecs = await SpecializationModel.find({ isActive: true }).sort({ name: 1 });
    console.log('\nCurrent specializations in database:');
    allSpecs.forEach((spec, index) => {
      console.log(`${index + 1}. ${spec.name} - ${spec.description}`);
    });

  } catch (error) {
    console.error('Error initializing specializations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the initialization
initSpecializations();
