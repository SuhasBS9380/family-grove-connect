// Test login functionality
const testLogin = async () => {
  try {
    const response = await fetch('https://family-grove-connect-drih.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: '9686282603',
        password: 'test123'
      })
    });
    
    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Text:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON:', data);
    } catch (e) {
      console.log('Response is not JSON, probably HTML error page');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogin();
