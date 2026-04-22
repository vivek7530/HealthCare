const mongoose = require('mongoose');
const DoctorModel = require('./models/DoctorModel');
const PatientModel = require('./models/PatientModel');
const SpecializationModel = require('./models/SpecializationModel');
const bcrypt = require("bcrypt");
require('dotenv').config();
const dns = require('dns')


dns.setServers(["1.1.1.1", "8.8.8.8"])

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // === TABLE/COLLECTION CREATION QUERY ===
    console.log('\n=== TABLE CREATION ===');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Check if doctors collection exists
    const doctorCollection = collections.find(col => col.name === 'doctors');
    
    if (!doctorCollection) {
      console.log('Creating doctors collection/table...');
      await db.createCollection('doctors');
      console.log('Doctors collection created successfully!');
    } else {
      console.log('Doctors collection already exists!');
    }

    // Check if patients collection exists
    const patientCollection = collections.find(col => col.name === 'patients');
    
    if (!patientCollection) {
      console.log('Creating patients collection/table...');
      await db.createCollection('patients');
      console.log('Patients collection created successfully!');
    } else {
      console.log('Patients collection already exists!');
    }

    // Get specializations
    const specializations = await SpecializationModel.find({ isActive: true });
    const specMap = {};
    specializations.forEach(spec => {
      specMap[spec.name] = spec._id;
    });

    // Seed Doctors
    const doctors = [
      {
        name: 'Dr. Rajesh Sharma',
        email: 'doctor1@healthcare.com',
        phone: '9876543210',
        age: '35',
        sex: 'Male',
        blood: 'O+',
        password: 'doctor123',
        role: 'doctor',
        specialization: specMap['Cardiology'],
        experience: '10',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        name: 'Dr. Priya Patel',
        email: 'doctor2@healthcare.com',
        phone: '9876543211',
        age: '32',
        sex: 'Female',
        blood: 'A+',
        password: 'doctor123',
        role: 'doctor',
        specialization: specMap['Pediatrics'],
        experience: '8',
        imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        name: 'Dr. Amit Kumar',
        email: 'doctor3@healthcare.com',
        phone: '9876543212',
        age: '42',
        sex: 'Male',
        blood: 'B+',
        password: 'doctor123',
        role: 'doctor',
        specialization: specMap['Orthopedics'],
        experience: '15',
        imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg'
      },
      {
        name: 'Dr. Neha Gupta',
        email: 'doctor4@healthcare.com',
        phone: '9876543213',
        age: '38',
        sex: 'Female',
        blood: 'AB+',
        password: 'doctor123',
        role: 'doctor',
        specialization: specMap['Dermatology'],
        experience: '12',
        imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg'
      },
      {
        name: 'Dr. Vikram Singh',
        email: 'doctor5@healthcare.com',
        phone: '9876543214',
        age: '45',
        sex: 'Male',
        blood: 'O-',
        password: 'doctor123',
        role: 'doctor',
        specialization: specMap['Neurology'],
        experience: '18',
        imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg'
      }
    ];

    // Seed Patients
    const patients = [
      {
        name: 'Ramesh Kumar',
        email: 'patient1@healthcare.com',
        phone: '9876543220',
        age: '28',
        sex: 'Male',
        blood: 'A+',
        password: 'patient123',
        role: 'patient',
        imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      {
        name: 'Sita Devi',
        email: 'patient2@healthcare.com',
        phone: '9876543221',
        age: '35',
        sex: 'Female',
        blood: 'B+',
        password: 'patient123',
        role: 'patient',
        imageUrl: 'https://randomuser.me/api/portraits/women/28.jpg'
      },
      {
        name: 'Mohammed Ali',
        email: 'patient3@healthcare.com',
        phone: '9876543222',
        age: '42',
        sex: 'Male',
        blood: 'O+',
        password: 'patient123',
        role: 'patient',
        imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
      },
      {
        name: 'Anita Sharma',
        email: 'patient4@healthcare.com',
        phone: '9876543223',
        age: '30',
        sex: 'Female',
        blood: 'AB-',
        password: 'patient123',
        role: 'patient',
        imageUrl: 'https://randomuser.me/api/portraits/women/36.jpg'
      },
      {
        name: 'Ganesh Reddy',
        email: 'patient5@healthcare.com',
        phone: '9876543224',
        age: '55',
        sex: 'Male',
        blood: 'B-',
        password: 'patient123',
        role: 'patient',
        imageUrl: 'https://randomuser.me/api/portraits/men/61.jpg'
      }
    ];

    console.log('\n=== SEEDING DOCTORS ===');
    let doctorAddedCount = 0;
    let doctorSkippedCount = 0;

    for (const doctor of doctors) {
      const existingDoctor = await DoctorModel.findOne({ 
        email: doctor.email
      });
      
      if (!existingDoctor) {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctor.password, 10);
        const newDoctor = new DoctorModel({
          ...doctor,
          password: hashedPassword
        });
        await newDoctor.save();
        console.log(`Added Doctor: ${doctor.name} (${doctor.email})`);
        doctorAddedCount++;
      } else {
        console.log(`Skipped Doctor (already exists): ${doctor.name} (${doctor.email})`);
        doctorSkippedCount++;
      }
    }

    console.log('\n=== SEEDING PATIENTS ===');
    let patientAddedCount = 0;
    let patientSkippedCount = 0;

    for (const patient of patients) {
      const existingPatient = await PatientModel.findOne({ 
        email: patient.email
      });
      
      if (!existingPatient) {
        // Hash password
        const hashedPassword = await bcrypt.hash(patient.password, 10);
        const newPatient = new PatientModel({
          ...patient,
          password: hashedPassword
        });
        await newPatient.save();
        console.log(`Added Patient: ${patient.name} (${patient.email})`);
        patientAddedCount++;
      } else {
        console.log(`Skipped Patient (already exists): ${patient.name} (${patient.email})`);
        patientSkippedCount++;
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Doctors Added: ${doctorAddedCount}`);
    console.log(`Doctors Skipped: ${doctorSkippedCount}`);
    console.log(`Patients Added: ${patientAddedCount}`);
    console.log(`Patients Skipped: ${patientSkippedCount}`);

    // Display all users
    const allDoctors = await DoctorModel.find({});
    const allPatients = await PatientModel.find({});
    
    console.log(`\n=== DOCTORS IN DATABASE (${allDoctors.length}) ===`);
    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.email} - Specialization: ${doctor.specialization}`);
    });

    console.log(`\n=== PATIENTS IN DATABASE (${allPatients.length}) ===`);
    allPatients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name} - ${patient.email}`);
    });

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Doctor Login Credentials:');
    console.log('Email: doctor1@healthcare.com | Password: doctor123');
    console.log('Email: doctor2@healthcare.com | Password: doctor123');
    console.log('Email: doctor3@healthcare.com | Password: doctor123');
    
    console.log('\nPatient Login Credentials:');
    console.log('Email: patient1@healthcare.com | Password: patient123');
    console.log('Email: patient2@healthcare.com | Password: patient123');
    console.log('Email: patient3@healthcare.com | Password: patient123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('User seeding completed!');
  }
};

// Run seeding
seedUsers();
