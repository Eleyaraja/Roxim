// Quick test script to verify D-ID API key
const axios = require('axios');

const API_KEY = 'ZWxleWFyYWphb2ZmaWNpYWxAZ21haWwuY29t:DmPzn3hwB4A0DYp-n6h5n';

async function testDIDAPI() {
  console.log('🧪 Testing D-ID API...');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  
  try {
    const response = await axios.post(
      'https://api.d-id.com/talks',
      {
        script: {
          type: 'text',
          input: 'Hello, this is a test.',
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural'
          }
        },
        config: {
          fluent: true
        },
        source_url: 'https://create-images-results.d-id.com/default-presenter-image.png'
      },
      {
        headers: {
          'Authorization': `Basic ${API_KEY}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Talk ID:', response.data.id);
    console.log('Status:', response.data.status);
    
  } catch (error) {
    console.log('❌ Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }
}

testDIDAPI();
