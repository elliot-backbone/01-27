import { completedActionIds } from '../today';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { actionId, completedAt } = req.body;

  // Validate request
  if (!actionId || actionId !== id) {
    return res.status(400).json({ error: 'Invalid action ID' });
  }

  if (!completedAt) {
    return res.status(400).json({ error: 'completedAt timestamp required' });
  }

  // Add to completed list
  if (!completedActionIds.includes(actionId)) {
    completedActionIds.push(actionId);
  }

  // Return 204 No Content as per contract
  return res.status(204).end();
}
