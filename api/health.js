import connectDB from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const connected = await connectDB();
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      database: connected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
