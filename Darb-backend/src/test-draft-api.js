// test-draft-api.js
require('dotenv').config();
const axios = require('axios');

// Test token - replace with a valid token from your system
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

// Minimal draft data for testing
const minimalDraft = {
  title: 'Test Draft Campaign',
  description: 'This is a test draft campaign',
  category: 'Technology',
  location: 'Lagos, Nigeria',
  stage: 'concept'
};

async function testDraftEndpoint() {
  try {
    console.log('Testing draft campaign API endpoint...');
    console.log('Using token:', TEST_TOKEN.substring(0, 10) + '...');
    
    // Attempt to create a draft campaign
    const response = await axios.post('http://localhost:5000/api/drafts', minimalDraft, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('Success! Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing draft endpoint:');
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // If there's a specific error message from the server
      if (error.response.data && error.response.data.message) {
        console.error('Server Error Message:', error.response.data.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return { success: false, error };
  }
}

// Run the test
testDraftEndpoint();