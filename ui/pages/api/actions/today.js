const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/actions/today`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Backend error' }));
      return res.status(response.status).json(error);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Backend connection error:', err.message);
    return res.status(503).json({ 
      error: 'Backend unavailable',
      message: 'Ensure backend is running on port 4000'
    });
  }
}
