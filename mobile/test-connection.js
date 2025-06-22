#!/usr/bin/env node
/**
 * Quick connection test for SOLACE mobile app backend
 * Run this to verify the backend is accessible from your development environment
 */

// Manually define the config since we can't use React Native's __DEV__ in Node.js
const config = {
  development: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
    API_BASE_URL: 'http://10.40.104.226:8000',
    API_TIMEOUT: 10000,
  }
};

async function testConnection() {
  console.log('🧪 Testing SOLACE Backend Connection');
  console.log('='.repeat(50));
  
  const apiUrl = config.development.API_BASE_URL;
  console.log(`📡 Testing connection to: ${apiUrl}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${apiUrl}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed!');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Services: ${Object.keys(healthData.services).join(', ')}`);
    } else {
      console.log(`❌ Health check failed: ${healthResponse.status}`);
      return;
    }
    
    // Test API info endpoint
    console.log('\n2. Testing API info endpoint...');
    const infoResponse = await fetch(`${apiUrl}/api`);
    
    if (infoResponse.ok) {
      const infoData = await infoResponse.json();
      console.log('✅ API info retrieved!');
      console.log(`   Name: ${infoData.name}`);
      console.log(`   Version: ${infoData.version}`);
      console.log(`   Features: ${Object.keys(infoData.features).length} available`);
    } else {
      console.log(`❌ API info failed: ${infoResponse.status}`);
    }
    
    console.log('\n🎉 Backend connection test completed successfully!');
    console.log('\n📱 Your mobile app should now be able to connect to the backend.');
    console.log('   If you\'re still having issues, try restarting your mobile app.');
    
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure the backend is running: python start.py');
    console.log('   2. Check if you\'re using the correct IP address');
    console.log('   3. For physical devices, use your computer\'s IP instead of localhost');
    console.log('   4. Make sure your device and computer are on the same network');
    console.log(`   5. Test manually: curl ${apiUrl}/health`);
  }
}

// Run the test
testConnection().catch(console.error); 