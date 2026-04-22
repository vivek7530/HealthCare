// Simple script to add specializations using built-in http module
const http = require('http');

const addSpecializations = () => {
  const postData = JSON.stringify({});
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/specializations/add-defaults',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Success! Specializations added:');
        console.log(`- Added: ${result.added} new specializations`);
        console.log(`- Total processed: ${result.total ? result.total.length : 0}`);
        
        if (result.total && result.total.length > 0) {
          console.log('\nAdded specializations:');
          result.total.forEach((spec, index) => {
            console.log(`${index + 1}. ${spec.name} - ${spec.description}`);
          });
        }
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Server is not running on port 3001');
      console.log('Please start the server first: node index.js');
      console.log('Then run this script in a NEW terminal window');
    } else {
      console.error('Error:', error.message);
    }
  });

  req.write(postData);
  req.end();
};

console.log('Make sure your server is running on port 3001 before running this script.');
console.log('Start server: node index.js');
console.log('Then run this script in a NEW terminal window.\n');
addSpecializations();
