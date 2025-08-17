import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('🔄 Testing login with demo credentials...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: '9380102924',
        password: '123456'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user.firstName, data.user.lastName);
      console.log('Role:', data.user.role);
      console.log('Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed!');
      console.log('Error:', data.message);
      console.log('Details:', data);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }

  // Test member login too
  try {
    console.log('\n🔄 Testing member login...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: '9380102925',
        password: '123456'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Member login successful!');
      console.log('User:', data.user.firstName, data.user.lastName);
      console.log('Role:', data.user.role);
    } else {
      console.log('❌ Member login failed!');
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Member login connection error:', error.message);
  }
};

testLogin();
