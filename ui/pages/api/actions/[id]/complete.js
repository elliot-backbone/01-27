const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { actionId, completedAt } = req.body;

  if (!actionId || actionId !== id) {
    return res.status(400).json({ error: 'Invalid action ID' });
  }

  if (!completedAt) {
    return res.status(400).json({ error: 'completedAt timestamp required' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/actions/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, completedAt })
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
