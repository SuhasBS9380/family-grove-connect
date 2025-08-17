// Test file to check frontend-backend connectivity
const testAPI = async () => {
  try {
    console.log('Testing API connectivity...');
    
    // Test 1: Health check
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: '9380102924',
        password: '123456'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login test:', loginData);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testAPI();
