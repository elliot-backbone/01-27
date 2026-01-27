/**
 * weeklyValue.js
 * Backbone V9 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Weekly Value Exercise
 * 
 * "One Move That Matters" per company per week
 * 
 * Surfaces at most:
 * - 1 Network Action (intro)
 * - 1 Non-network Action (operational/strategic)
 * 
 * Each surfaced action must answer:
 * 1. Why this now?
 * 2. What it unlocks?
 * 3. What it prevents?
 * 4. Why it beats alternatives?
 * 5. What happens if delayed?
 * 6. What comes next if successful?
 */

import { computeValueVector } from './valueVector.js';

/**
 * Generate explanation for a surfaced action
 */
function generateExplanation(action, alternatives, context = {}) {
  const { goal, company, now = new Date() } = context;
  const explanation = {};
  
  // 1. Why this now?
  const timeSensitivity = action.valueVector?.timeSensitivity || {};
  if (timeSensitivity.band === 'critical') {
    explanation.whyNow = `Critical deadline: ${timeSensitivity.daysRemaining} days remaining. Delay risks missing ${goal?.name || 'goal'}.`;
  } else if (timeSensitivity.band === 'high') {
    explanation.whyNow = `High urgency: ${timeSensitivity.daysRemaining} days until deadline. Action now maximizes success probability.`;
  } else if (action.type === 'INTRODUCTION') {
    explanation.whyNow = `Relationship capital is available. Window to make this introduction without overextending.`;
  } else {
    explanation.whyNow = `Optimal timing: resources available and conditions favorable for maximum impact.`;
  }
  
  // 2. What it unlocks?
  const ripple = action.valueVector?.rippleEffect || {};
  const optionality = action.valueVector?.optionalityGain || {};
  const unlocks = [];
  
  if (ripple.deltas?.length > 0) {
    unlocks.push(...ripple.deltas.map(d => d.effect));
  }
  if (optionality.options?.length > 0) {
    unlocks.push(...optionality.options);
  }
  if (action.type === 'INTRODUCTION') {
    unlocks.push(`Direct connection to ${action.targetPersonName || 'key contact'}`);
  }
  
  explanation.whatItUnlocks = unlocks.length > 0 ? unlocks : ['Removes blocking issue', 'Enables goal progress'];
  
  // 3. What it prevents?
  const downside = action.valueVector?.downsideProtection || {};
  explanation.whatItPrevents = downside.reasons?.length > 0 
    ? downside.reasons 
    : ['Goal trajectory degradation', 'Accumulating technical/strategic debt'];
  
  // 4. Why it beats alternatives?
  if (alternatives.length > 0) {
    const topAlt = alternatives[0];
    const actionDensity = action.valueVector?.valueDensity || 0;
    const altDensity = topAlt.valueVector?.valueDensity || 0;
    const densityDiff = Math.round(actionDensity - altDensity);
    
    if (densityDiff > 10) {
      explanation.whyBeatAlternatives = `${densityDiff}% higher value density than next best option: "${topAlt.title || topAlt.id}".`;
    } else if (action.type === 'INTRODUCTION' && topAlt.type !== 'INTRODUCTION') {
      explanation.whyBeatAlternatives = `Network action with higher optionality gain than operational alternatives.`;
    } else {
      explanation.whyBeatAlternatives = `Better risk-adjusted return: higher probability of success with comparable effort.`;
    }
  } else {
    explanation.whyBeatAlternatives = `Only viable high-value action identified for this goal.`;
  }
  
  // 5. What happens if delayed?
  if (timeSensitivity.band === 'critical') {
    explanation.ifDelayed = `Likely goal failure. ${timeSensitivity.daysRemaining} days is insufficient buffer.`;
  } else if (timeSensitivity.band === 'high') {
    explanation.ifDelayed = `Success probability drops significantly. Options narrow as deadline approaches.`;
  } else if (action.type === 'INTRODUCTION') {
    explanation.ifDelayed = `Relationship window may close. Introducer's capital may be spent elsewhere.`;
  } else {
    explanation.ifDelayed = `Compounding delay cost. Each week reduces optionality and increases effort required.`;
  }
  
  // 6. What comes next if successful?
  if (action.type === 'INTRODUCTION') {
    explanation.nextIfSuccessful = [
      `Follow up within 48 hours of intro`,
      `Prepare materials for ${action.targetPersonName || 'contact'}`,
      `Set meeting within 2 weeks`
    ];
  } else if (goal?.type === 'fundraise') {
    explanation.nextIfSuccessful = [
      `Update pipeline tracking`,
      `Brief team on progress`,
      `Identify next milestone toward close`
    ];
  } else {
    explanation.nextIfSuccessful = [
      `Validate outcome achieved`,
      `Update goal progress`,
      `Identify unlocked downstream actions`
    ];
  }
  
  return explanation;
}

/**
 * Select the best network action for a company
 */
function selectBestNetworkAction(actions, context = {}) {
  const networkActions = actions.filter(a => 
    a.type === 'INTRODUCTION' || a.sourceType === 'INTRODUCTION'
  );
  
  if (networkActions.length === 0) return null;
  
  // Already sorted by value density, take the first
  const best = networkActions[0];
  const alternatives = networkActions.slice(1, 4);
  
  return {
    ...best,
    explanation: generateExplanation(best, alternatives, context),
    alternatives: alternatives.map(a => ({
      id: a.id,
      title: a.title || a.targetPersonName,
      valueDensity: a.valueVector?.valueDensity || 0
    }))
  };
}

/**
 * Select the best non-network action for a company
 */
function selectBestNonNetworkAction(actions, context = {}) {
  const nonNetworkActions = actions.filter(a => 
    a.type !== 'INTRODUCTION' && a.sourceType !== 'INTRODUCTION'
  );
  
  if (nonNetworkActions.length === 0) return null;
  
  const best = nonNetworkActions[0];
  const alternatives = nonNetworkActions.slice(1, 4);
  
  return {
    ...best,
    explanation: generateExplanation(best, alternatives, context),
    alternatives: alternatives.map(a => ({
      id: a.id,
      title: a.title || a.id,
      valueDensity: a.valueVector?.valueDensity || 0
    }))
  };
}

/**
 * Generate weekly value exercise for a single company
 */
export function generateCompanyWeeklyValue(company, rankedActions, context = {}) {
  const { now = new Date() } = context;
  
  // Find the primary goal (highest urgency or most impactful)
  const primaryGoal = (company.goals || [])
    .filter(g => g.status === 'active')
    .sort((a, b) => {
      const aTime = new Date(a.due) - now;
      const bTime = new Date(b.due) - now;
      return aTime - bTime; // Soonest deadline first
    })[0];
  
  const contextWithGoal = { ...context, goal: primaryGoal, company };
  
  // Add value vectors to all actions
  const actionsWithVectors = rankedActions.map(action => ({
    ...action,
    valueVector: action.valueVector || computeValueVector(action, contextWithGoal)
  })).sort((a, b) => (b.valueVector?.valueDensity || 0) - (a.valueVector?.valueDensity || 0));
  
  // Select best of each type
  const networkAction = selectBestNetworkAction(actionsWithVectors, contextWithGoal);
  const nonNetworkAction = selectBestNonNetworkAction(actionsWithVectors, contextWithGoal);
  
  return {
    companyId: company.id,
    companyName: company.name,
    weekOf: now.toISOString().split('T')[0],
    primaryGoal: primaryGoal ? {
      id: primaryGoal.id,
      name: primaryGoal.name,
      type: primaryGoal.type,
      progressPct: Math.round((primaryGoal.current / primaryGoal.target) * 100),
      daysRemaining: Math.floor((new Date(primaryGoal.due) - now) / (1000 * 60 * 60 * 24))
    } : null,
    
    // The one move that matters (network)
    networkAction,
    
    // The one move that matters (non-network)
    nonNetworkAction,
    
    // Summary
    summary: buildSummary(company, networkAction, nonNetworkAction),
    
    // Metadata
    generatedAt: now.toISOString(),
    totalActionsConsidered: actionsWithVectors.length
  };
}

/**
 * Build executive summary
 */
function buildSummary(company, networkAction, nonNetworkAction) {
  const lines = [];
  
  if (networkAction && nonNetworkAction) {
    const nDensity = networkAction.valueVector?.valueDensity || 0;
    const opDensity = nonNetworkAction.valueVector?.valueDensity || 0;
    
    if (nDensity > opDensity * 1.2) {
      lines.push(`Priority: Network action (${Math.round(nDensity)}/100 value density)`);
      lines.push(`${networkAction.targetPersonName || 'Contact'} intro is the highest-leverage move this week.`);
    } else if (opDensity > nDensity * 1.2) {
      lines.push(`Priority: Operational action (${Math.round(opDensity)}/100 value density)`);
      lines.push(`Focus on "${nonNetworkAction.title || nonNetworkAction.id}" before network expansion.`);
    } else {
      lines.push(`Balanced priority: Both actions have similar value density (~${Math.round((nDensity + opDensity) / 2)}/100)`);
      lines.push(`Execute network action first if relationship window is time-limited.`);
    }
  } else if (networkAction) {
    lines.push(`Network action is the clear priority this week.`);
    lines.push(`No competing operational actions of similar value.`);
  } else if (nonNetworkAction) {
    lines.push(`Operational focus this week.`);
    lines.push(`No high-value network opportunities identified.`);
  } else {
    lines.push(`No high-value actions identified.`);
    lines.push(`Review goal progress and issue backlog.`);
  }
  
  return lines;
}

/**
 * Generate weekly value exercise for entire portfolio
 */
export function generatePortfolioWeeklyValue(companies, allRankedActions, context = {}) {
  const { now = new Date() } = context;
  
  // Group actions by company
  const actionsByCompany = new Map();
  for (const action of allRankedActions) {
    const companyId = action.companyId || action.entityRef?.id;
    if (!actionsByCompany.has(companyId)) {
      actionsByCompany.set(companyId, []);
    }
    actionsByCompany.get(companyId).push(action);
  }
  
  // Generate for each company
  const companyValues = companies.map(company => {
    const companyActions = actionsByCompany.get(company.id) || [];
    return generateCompanyWeeklyValue(company, companyActions, context);
  });
  
  // Sort by highest value opportunity
  companyValues.sort((a, b) => {
    const aMax = Math.max(
      a.networkAction?.valueVector?.valueDensity || 0,
      a.nonNetworkAction?.valueVector?.valueDensity || 0
    );
    const bMax = Math.max(
      b.networkAction?.valueVector?.valueDensity || 0,
      b.nonNetworkAction?.valueVector?.valueDensity || 0
    );
    return bMax - aMax;
  });
  
  // Identify portfolio-wide priorities
  const topNetworkActions = companyValues
    .filter(cv => cv.networkAction)
    .sort((a, b) => (b.networkAction.valueVector?.valueDensity || 0) - (a.networkAction.valueVector?.valueDensity || 0))
    .slice(0, 3);
  
  const topNonNetworkActions = companyValues
    .filter(cv => cv.nonNetworkAction)
    .sort((a, b) => (b.nonNetworkAction.valueVector?.valueDensity || 0) - (a.nonNetworkAction.valueVector?.valueDensity || 0))
    .slice(0, 3);
  
  return {
    weekOf: now.toISOString().split('T')[0],
    generatedAt: now.toISOString(),
    
    // Per-company breakdown
    companies: companyValues,
    
    // Portfolio-level priorities
    portfolioPriorities: {
      topNetworkMoves: topNetworkActions.map(cv => ({
        company: cv.companyName,
        action: cv.networkAction?.targetPersonName || cv.networkAction?.id,
        valueDensity: cv.networkAction?.valueVector?.valueDensity || 0
      })),
      topOperationalMoves: topNonNetworkActions.map(cv => ({
        company: cv.companyName,
        action: cv.nonNetworkAction?.title || cv.nonNetworkAction?.id,
        valueDensity: cv.nonNetworkAction?.valueVector?.valueDensity || 0
      }))
    },
    
    // Summary stats
    stats: {
      companiesWithNetworkActions: companyValues.filter(cv => cv.networkAction).length,
      companiesWithOperationalActions: companyValues.filter(cv => cv.nonNetworkAction).length,
      totalActionsConsidered: allRankedActions.length
    }
  };
}

export default {
  generateCompanyWeeklyValue,
  generatePortfolioWeeklyValue
};
