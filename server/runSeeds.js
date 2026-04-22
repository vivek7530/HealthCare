const { execSync } = require('child_process');

console.log('=== RUNNING SEED SCRIPTS ===\n');

try {
  console.log('1. Seeding Specializations...');
  execSync('node seedSpecializations.js', { stdio: 'inherit' });
  
  console.log('\n2. Seeding Users (Doctors and Patients)...');
  execSync('node seedUsers.js', { stdio: 'inherit' });
  
  console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
  console.log('\nYou can now test login with the following credentials:');
  console.log('\nDOCTORS:');
  console.log('Email: doctor1@healthcare.com | Password: doctor123');
  console.log('Email: doctor2@healthcare.com | Password: doctor123');
  console.log('Email: doctor3@healthcare.com | Password: doctor123');
  
  console.log('\nPATIENTS:');
  console.log('Email: patient1@healthcare.com | Password: patient123');
  console.log('Email: patient2@healthcare.com | Password: patient123');
  console.log('Email: patient3@healthcare.com | Password: patient123');
  
} catch (error) {
  console.error('Error running seeds:', error.message);
  process.exit(1);
}
