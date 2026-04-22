const mongoose = require('mongoose');
const SpecializationModel = require('./models/SpecializationModel');
require('dotenv').config();
const dns = require('dns')


dns.setServers(["1.1.1.1", "8.8.8.8"])

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
  { name: 'Pathology', description: 'Disease diagnosis through lab tests specialist' },
  { name: 'Internal Medicine', description: 'Adult disease prevention and treatment' },
  { name: 'Family Medicine', description: 'Comprehensive healthcare for all ages' },
  { name: 'Emergency Medicine', description: 'Emergency medical care specialist' },
  { name: 'Physical Medicine', description: 'Rehabilitation and physical therapy' },
  { name: 'Infectious Disease', description: 'Infection and disease control specialist' }
];

const seedSpecializations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // === TABLE/COLLECTION CREATION QUERY ===
    console.log('\n=== TABLE CREATION ===');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Check if specializations collection exists
    const specializationCollection = collections.find(col => col.name === 'specializations');
    
    if (!specializationCollection) {
      console.log('Creating specializations collection/table...');
      await db.createCollection('specializations');
      console.log('Specializations collection created successfully!');
    } else {
      console.log('Specializations collection already exists!');
    }

    // MongoDB equivalent of table creation query:
    // db.createCollection("specializations", {
    //   validator: {
    //     $jsonSchema: {
    //       bsonType: "object",
    //       required: ["name"],
    //       properties: {
    //         name: { bsonType: "string", description: "must be a string" },
    //         description: { bsonType: "string", description: "must be a string" },
    //         isActive: { bsonType: "bool", description: "must be a boolean" },
    //         createdAt: { bsonType: "date", description: "must be a date" },
    //         updatedAt: { bsonType: "date", description: "must be a date" }
    //       }
    //     }
    //   }
    // });

    console.log('\n=== SEED DATA INSERTION ===');

    let addedCount = 0;
    let skippedCount = 0;
    
    console.log('Adding default specializations...\n');
    
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
        console.log(`Skipped (already exists): ${spec.name}`);
        skippedCount++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Added: ${addedCount} new specializations`);
    console.log(`Skipped: ${skippedCount} existing specializations`);
    console.log(`Total: ${addedCount + skippedCount} specializations processed`);
    
    // Display all specializations in database
    const allSpecs = await SpecializationModel.find({ isActive: true }).sort({ name: 1 });
    console.log(`\nCurrent specializations in database (${allSpecs.length}):`);
    allSpecs.forEach((spec, index) => {
      console.log(`${index + 1}. ${spec.name} - ${spec.description}`);
    });

  } catch (error) {
    console.error('Error seeding specializations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Seeding completed!');
  }
};

// Run the seeding
seedSpecializations();
