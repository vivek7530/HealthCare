// This script adds specializations using the API endpoint
// Run this when the server is running on port 3001

const axios = require('axios');

const addSpecializations = async () => {
  try {
    console.log('Adding specializations via API...');
    
    const response = await axios.post('http://localhost:3001/api/specializations/add-defaults');
    
    console.log('Success! Specializations added:');
    console.log(`- Added: ${response.data.added} new specializations`);
    console.log(`- Total: ${response.data.total} specializations`);
    
    // Show the added specializations
    if (response.data.total && response.data.total.added) {
      console.log('\nAdded specializations:');
      response.data.total.added.forEach((spec, index) => {
        console.log(`${index + 1}. ${spec.name} - ${spec.description}`);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.message);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Server is not running on port 3001');
      console.log('Please start the server first: node index.js');
    } else {
      console.error('Error:', error.message);
    }
  }
};

console.log('Make sure your server is running on port 3001 before running this script.');
addSpecializations();
