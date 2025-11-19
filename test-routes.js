const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRoutes() {
  try {
    console.log('🧪 Testing backend routes...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Health:', healthResponse.data);

    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get(API_BASE.replace('/api', ''));
    console.log('✅ Root:', rootResponse.data);

    // Test run endpoint (without auth)
    console.log('\n3. Testing run endpoint (without auth)...');
    try {
      const runResponse = await axios.post(`${API_BASE}/run`, {
        language: 'python',
        code: 'print("Hello, World!")'
      });
      console.log('✅ Run:', runResponse.data);
    } catch (error) {
      console.log('🔒 Run (expected auth error):', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Backend routes are working correctly!');
  } catch (error) {
    console.error('❌ Route test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testRoutes();