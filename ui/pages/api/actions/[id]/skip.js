const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { actionId, reason } = req.body;

  if (!actionId || actionId !== id) {
    return res.status(400).json({ error: 'Invalid action ID' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/actions/${id}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        actionId, 
        skippedAt: new Date().toISOString(),
        reason 
      })
    });

    if (response.status === 204) {
      return res.status(204).end();
    }

    const error = await response.json().catch(() => ({ error: 'Backend error' }));
    return res.status(response.status).json(error);
  } catch (err) {
    return res.status(503).json({ error: 'Backend unavailable' });
  }
}
