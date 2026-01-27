/**
 * EXPLAINABILITY-ONLY MODULE
 *
 * This file MUST NOT:
 *  - compute rankScore
 *  - influence action ordering
 *  - be used in sorting logic
 *
 * Canonical action ranking occurs ONLY in:
 *   decide/ranking.js
 *
 * Any use of this module to reorder Actions is a contract violation.
 */

/**
 * valueVector.js
 * Backbone V9 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Value Vector Computation
 * 
 * For every action, compute 8 dimensions:
 * 1. Direct Impact
 * 2. Downside Protection
 * 3. Ripple Effect
 * 4. Optionality Gain
 * 5. Probability of Success
 * 6. Cost
 * 7. Time Sensitivity
 * 8. Trust Risk
 */

const TIME_SENSITIVITY_MULTIPLIERS = {
  critical: 2.0,
  high: 1.5,
  medium: 1.0,
  low: 0.7
};

export function calculateTimeSensitivity(dueDate, now = new Date()) {
  if (!dueDate) return { band: 'medium', multiplier: 1.0, daysRemaining: null };
  
  const due = new Date(dueDate);
  const daysRemaining = Math.floor((due - now) / (1000 * 60 * 60 * 24));
  
  let band, multiplier;
  if (daysRemaining <= 7) {
    band = 'critical';
    multiplier = TIME_SENSITIVITY_MULTIPLIERS.critical;
  } else if (daysRemaining <= 21) {
    band = 'high';
    multiplier = TIME_SENSITIVITY_MULTIPLIERS.high;
  } else if (daysRemaining <= 45) {
    band = 'medium';
    multiplier = TIME_SENSITIVITY_MULTIPLIERS.medium;
  } else {
    band = 'low';
    multiplier = TIME_SENSITIVITY_MULTIPLIERS.low;
  }
  
  return { band, multiplier, daysRemaining };
}

export function calculateDirectImpact(action, goal) {
  if (!goal) return 0;
  
  const gap = goal.target - goal.current;
  if (gap <= 0) return 0;
  
  let estimatedContribution = 0;
  const actionType = action.type || action.sourceType;
  
  switch (actionType) {
    case 'INTRODUCTION':
      if (goal.type === 'fundraise') {
        estimatedContribution = gap * 0.2;
      } else if (goal.type === 'partnership') {
        estimatedContribution = gap * 0.3;
      } else {
        estimatedContribution = gap * 0.1;
      }
      break;
    case 'ISSUE':
      estimatedContribution = gap * 0.15;
      break;
    case 'PREISSUE':
      estimatedContribution = gap * 0.1;
      break;
    case 'GOAL':
      estimatedContribution = gap * 0.25;
      break;
    default:
      estimatedContribution = gap * 0.1;
  }
  
  const impactPct = (estimatedContribution / gap) * 100;
  return Math.min(100, Math.max(0, impactPct));
}

export function calculateDownsideProtection(action, context = {}) {
  let protection = 0;
  const reasons = [];
  
  if (action.sourceType === 'PREISSUE' || action.type === 'PREISSUE') {
    protection += 40;
    reasons.push('Prevents forecasted issue');
  }
  
  if (action.issue?.type === 'RUNWAY_CRITICAL' || action.issue?.type === 'RUNWAY_SHORT') {
    protection += 50;
    reasons.push('Prevents cash crisis');
  }
  
  const timeSensitivity = context.timeSensitivity || {};
  if (timeSensitivity.band === 'critical') {
    protection += 30;
    reasons.push('Prevents missed deadline');
  } else if (timeSensitivity.band === 'high') {
    protection += 15;
    reasons.push('Reduces deadline risk');
  }
  
  if (action.issue?.type === 'DATA_STALE') {
    protection += 20;
    reasons.push('Prevents blind spots');
  }
  
  return { score: Math.min(100, protection), reasons };
}

export function calculateRippleEffect(action, context = {}) {
  let ripple = 0;
  const deltas = [];
  
  if (action.impact?.secondOrderLeverage) {
    ripple = action.impact.secondOrderLeverage;
  }
  
  if (action.type === 'INTRODUCTION' || action.sourceType === 'INTRODUCTION') {
    ripple += 25;
    deltas.push({ type: 'relationship', effect: 'New connection in network' });
    
    if (action.targetOrg && context.portfolioCompanyIds?.includes(action.targetOrg)) {
      ripple += 20;
      deltas.push({ type: 'portfolio', effect: 'Strengthens portfolio network' });
    }
  }
  
  if (action.unlocksGoals?.length > 0) {
    ripple += action.unlocksGoals.length * 15;
    deltas.push({ type: 'goals', effect: `Unlocks ${action.unlocksGoals.length} downstream goals` });
  }
  
  if (action.resolvesList?.length > 1) {
    ripple += (action.resolvesList.length - 1) * 10;
    deltas.push({ type: 'issues', effect: `Resolves ${action.resolvesList.length} issues` });
  }
  
  return { score: Math.min(100, ripple), deltas };
}

export function calculateOptionalityGain(action, context = {}) {
  let optionality = action.optionalityGain || 0;
  const options = [];
  
  if (action.goalType === 'fundraise' || action.issue?.goalType === 'fundraise') {
    optionality += 20;
    options.push('Expands future funding options');
  }
  
  if (action.goalType === 'partnership') {
    optionality += 15;
    options.push('Opens partnership pipeline');
  }
  
  if (action.type === 'INTRODUCTION') {
    const seniorRoles = ['CEO', 'CTO', 'Partner', 'Managing Partner'];
    if (seniorRoles.some(r => action.targetPersonRole?.includes(r))) {
      optionality += 20;
      options.push('Access to senior decision-maker');
    }
  }
  
  return { score: Math.min(100, optionality), options };
}

export function calculateCost(action) {
  let cost = 0;
  const components = [];
  
  if (action.impact?.effortCost) {
    cost = action.impact.effortCost;
    components.push({ type: 'effort', value: action.impact.effortCost });
  } else {
    const actionType = action.type || action.sourceType;
    switch (actionType) {
      case 'INTRODUCTION':
        cost = 20;
        components.push({ type: 'effort', value: 20, note: 'Email/call to make intro' });
        break;
      case 'ISSUE':
        cost = 40;
        components.push({ type: 'effort', value: 40, note: 'Issue resolution work' });
        break;
      case 'PREISSUE':
        cost = 30;
        components.push({ type: 'effort', value: 30, note: 'Preventative action' });
        break;
      case 'GOAL':
        cost = 50;
        components.push({ type: 'effort', value: 50, note: 'Goal advancement work' });
        break;
      default:
        cost = 35;
        components.push({ type: 'effort', value: 35, note: 'Estimated effort' });
    }
  }
  
  if (action.trustRisk?.trustRiskScore) {
    const trustCost = action.trustRisk.trustRiskScore * 0.3;
    cost += trustCost;
    components.push({ type: 'trustRisk', value: trustCost, note: 'Social capital expenditure' });
  }
  
  return { score: Math.max(10, Math.min(100, cost)), components };
}

export function computeValueVector(action, context = {}) {
  const { goal, now = new Date() } = context;
  
  const directImpact = calculateDirectImpact(action, goal);
  const timeSensitivity = calculateTimeSensitivity(goal?.due, now);
  const downsideProtection = calculateDownsideProtection(action, { timeSensitivity });
  const rippleEffect = calculateRippleEffect(action, context);
  const optionalityGain = calculateOptionalityGain(action, context);
  const probability = action.probability ?? action.impact?.probabilityOfSuccess ?? 0.5;
  const cost = calculateCost(action);
  const trustRisk = action.trustRisk || { trustRiskScore: 0, trustRiskBand: 'low', trustRiskReason: [] };
  
  const numerator = (directImpact + downsideProtection.score + rippleEffect.score + optionalityGain.score) * probability;
  const denominator = cost.score * timeSensitivity.multiplier;
  const valueDensity = denominator > 0 ? numerator / denominator : 0;
  const normalizedDensity = Math.min(100, valueDensity * 25);
  
  return {
    directImpact,
    downsideProtection,
    rippleEffect,
    optionalityGain,
    probability,
    cost,
    timeSensitivity,
    trustRisk,
    valueDensity: normalizedDensity,
    explain: buildExplanation({ directImpact, downsideProtection, rippleEffect, optionalityGain, probability, cost, timeSensitivity, trustRisk, valueDensity: normalizedDensity })
  };
}

function buildExplanation(vector) {
  const lines = [];
  const scores = [
    { name: 'Direct Impact', score: vector.directImpact },
    { name: 'Downside Protection', score: vector.downsideProtection.score },
    { name: 'Ripple Effect', score: vector.rippleEffect.score },
    { name: 'Optionality', score: vector.optionalityGain.score }
  ].sort((a, b) => b.score - a.score);
  
  if (scores[0].score > 0) {
    lines.push(`Primary value driver: ${scores[0].name} (${Math.round(scores[0].score)})`);
  }
  
  if (vector.probability >= 0.7) {
    lines.push(`High probability of success (${Math.round(vector.probability * 100)}%)`);
  } else if (vector.probability <= 0.3) {
    lines.push(`Uncertain outcome (${Math.round(vector.probability * 100)}% probability)`);
  }
  
  if (vector.timeSensitivity.band === 'critical') {
    lines.push(`Time-critical: ${vector.timeSensitivity.daysRemaining} days remaining`);
  }
  
  if (vector.cost.score > 60) {
    lines.push(`High effort required (${Math.round(vector.cost.score)}/100)`);
  } else if (vector.cost.score < 30) {
    lines.push(`Low effort action (${Math.round(vector.cost.score)}/100)`);
  }
  
  if (vector.trustRisk.trustRiskScore > 30) {
    lines.push(`Trust risk: ${vector.trustRisk.trustRiskBand}`);
  }
  
  lines.push(`Value density: ${Math.round(vector.valueDensity)}/100`);
  return lines;
}

// NOTE: Action sorting/ranking ONLY in decide/ranking.js (QA enforced)
// Use computeValueVector for analysis, not ranking

export default {
  computeValueVector,
  calculateTimeSensitivity,
  calculateDirectImpact,
  calculateDownsideProtection,
  calculateRippleEffect,
  calculateOptionalityGain,
  calculateCost
};
