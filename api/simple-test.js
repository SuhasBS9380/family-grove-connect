export default async function handler(req, res) {
  try {
    console.log('Simple test function called');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    res.status(200).json({
      success: true,
      message: 'Simple test working',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in simple test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
