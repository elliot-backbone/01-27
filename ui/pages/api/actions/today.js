// Mock data store - will be replaced with real backend integration
const MOCK_ACTIONS = [
  {
    actionId: "action_001",
    title: "Schedule investor update call with Series A lead",
    entityRef: { 
      type: "company", 
      id: "comp_001", 
      name: "Pluto Analytics" 
    },
    resolutionId: "SCHEDULE_UPDATE",
    steps: [
      { step: 1, action: "Open calendar and find 30-minute slot this week" },
      { step: 2, action: "Email lead investor with 3 time options" },
      { step: 3, action: "Prepare brief update doc highlighting Q4 metrics" }
    ],
    sources: [
      { sourceType: "GOAL", sourceId: "goal_funding_q1" }
    ],
    type: "COMMUNICATION"
  },
  {
    actionId: "action_002",
    title: "Review and approve engineering headcount plan",
    entityRef: { 
      type: "company", 
      id: "comp_002", 
      name: "Lucius AI" 
    },
    resolutionId: "APPROVE_PLAN",
    steps: [
      { step: 1, action: "Review attached hiring plan document" },
      { step: 2, action: "Verify budget alignment with Q1 burn target" },
      { step: 3, action: "Reply to CTO with approval or requested changes" }
    ],
    sources: [
      { sourceType: "ISSUE", sourceId: "issue_burn_spike" }
    ],
    type: "APPROVAL"
  },
  {
    actionId: "action_003",
    title: "Connect portfolio company CEO with potential design partner",
    entityRef: { 
      type: "company", 
      id: "comp_003", 
      name: "Nexova Systems" 
    },
    resolutionId: "MAKE_INTRODUCTION",
    steps: [
      { step: 1, action: "Draft double opt-in intro email" },
      { step: 2, action: "Send to both parties separately for approval" },
      { step: 3, action: "Make introduction once both confirm" }
    ],
    sources: [
      { sourceType: "GOAL", sourceId: "goal_revenue_q1" }
    ],
    type: "INTRODUCTION"
  }
];

// State management for completed/skipped actions
let completedActionIds = [];
let skippedActionIds = [];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Filter out completed and skipped actions
  const availableActions = MOCK_ACTIONS.filter(
    action => !completedActionIds.includes(action.actionId) && 
              !skippedActionIds.includes(action.actionId)
  );

  if (availableActions.length === 0) {
    // Reset if all actions processed (for demo purposes)
    completedActionIds = [];
    skippedActionIds = [];
    return res.status(200).json(MOCK_ACTIONS[0]);
  }

  // Return the first (highest ranked) available action
  return res.status(200).json(availableActions[0]);
}

// Export state management for other endpoints
export { completedActionIds, skippedActionIds };
