/**
 * graph.js Ã¢â‚¬â€ Explicit DAG Definition (Patch 2)
 * 
 * Execution order is enforced by an explicit dependency graph, not convention.
 * 
 * INVARIANT: No circular dependencies. Architecture enforces doctrine.
 * 
 * @module graph
 */

// =============================================================================
// COMPUTATION GRAPH (Phase 3.1)
// =============================================================================

/**
 * Dependency graph for Phase 3.2 pipeline.
 * Each node lists its dependencies.
 * 
 * Phase 3.2 extends Phase 3.1 with:
 * - metrics: Metric time series view
 * - goalTrajectory: Goal forecast + probability-of-hit
 * - preissues: Forecasted issues (preventative)
 * - actionCandidates: Actions from issues/preissues/goals
 * - actionImpact: Attach impact model to actions
 * - actionRanker: Rank by expected net impact
 * 
 * DAG Order:
 * runway â†’ metrics â†’ trajectory â†’ goalTrajectory â†’ health â†’ issues â†’ 
 * preissues â†’ ripple â†’ actionCandidates â†’ actionImpact â†’ actionRanker
 */
export const GRAPH = {
  // L1: Base derivations (no deps)
  runway: [],
  metrics: [],
  
  // L2: Trajectory (can use metrics)
  trajectory: ['metrics'],
  
  // L3: Goal trajectory (goals + metrics + trajectory)
  goalTrajectory: ['metrics', 'trajectory'],
  
  // L4: Health (internal state only, depends on runway)
  health: ['runway'],
  
  // L5: Issues (gaps - depends on runway, trajectory, goalTrajectory)
  issues: ['runway', 'trajectory', 'goalTrajectory'],
  
  // L6: Pre-issues (forecasted - depends on runway, goalTrajectory, trajectory)
  preissues: ['runway', 'goalTrajectory', 'trajectory', 'metrics'],
  
  // L7: Ripple (downstream effects - depends on issues)
  ripple: ['issues'],
  
  // L8: Intro opportunities (network actions - depends on goalTrajectory for blocked goals)
  introOpportunity: ['goalTrajectory', 'issues'],
  
  // L9: Action candidates (from issues, preissues, goals, AND intros)
  actionCandidates: ['issues', 'preissues', 'goalTrajectory', 'introOpportunity'],
  
  // L10: Action impact (attach impact model, use ripple for leverage)
  actionImpact: ['actionCandidates', 'ripple'],
  
  // L11: Value vector (8-dimension value model)
  valueVector: ['actionImpact'],
  
  // L12: Action ranker (rank by value density)
  actionRanker: ['valueVector'],
  
  // L13: Weekly value surface ("One Move That Matters")
  weeklyValue: ['actionRanker'],
  
  // L14: Priority view (compatibility layer over ranked actions)
  priority: ['actionRanker', 'weeklyValue']
};

// =============================================================================
// TOPOLOGICAL SORT
// =============================================================================

/**
 * Perform topological sort on the dependency graph.
 * Detects cycles and throws on circular dependencies.
 * Produces stable ordering.
 * 
 * @param {Object} graph - Dependency graph (node -> dependencies[])
 * @returns {string[]} - Nodes in topological order
 * @throws {Error} - If cycle detected
 */
export function topoSort(graph) {
  const nodes = Object.keys(graph);
  const visited = new Set();
  const visiting = new Set();
  const order = [];
  
  function visit(node) {
    if (visited.has(node)) {
      return;
    }
    
    if (visiting.has(node)) {
      throw new Error(`DAG CYCLE DETECTED: ${node} is part of a circular dependency`);
    }
    
    visiting.add(node);
    
    const deps = graph[node] || [];
    for (const dep of deps) {
      if (!graph.hasOwnProperty(dep)) {
        throw new Error(`DAG ERROR: Unknown dependency '${dep}' in node '${node}'`);
      }
      visit(dep);
    }
    
    visiting.delete(node);
    visited.add(node);
    order.push(node);
  }
  
  // Visit all nodes (sorted for determinism)
  for (const node of nodes.sort()) {
    visit(node);
  }
  
  return order;
}

/**
 * Validate graph structure
 * @param {Object} graph 
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateGraph(graph) {
  const errors = [];
  const nodes = new Set(Object.keys(graph));
  
  // Check all dependencies exist
  for (const [node, deps] of Object.entries(graph)) {
    for (const dep of deps) {
      if (!nodes.has(dep)) {
        errors.push(`Node '${node}' depends on unknown node '${dep}'`);
      }
    }
  }
  
  // Check for cycles
  try {
    topoSort(graph);
  } catch (e) {
    errors.push(e.message);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get the execution order for the standard graph
 * @returns {string[]}
 */
export function getExecutionOrder() {
  return topoSort(GRAPH);
}

/**
 * Get dependencies for a node
 * @param {string} node 
 * @returns {string[]}
 */
export function getDependencies(node) {
  return GRAPH[node] || [];
}

/**
 * Check if node A depends on node B (directly or transitively)
 * @param {string} nodeA 
 * @param {string} nodeB 
 * @returns {boolean}
 */
export function dependsOn(nodeA, nodeB) {
  const visited = new Set();
  
  function check(current) {
    if (current === nodeB) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    
    const deps = GRAPH[current] || [];
    for (const dep of deps) {
      if (check(dep)) return true;
    }
    return false;
  }
  
  return check(nodeA);
}

export default {
  GRAPH,
  topoSort,
  validateGraph,
  getExecutionOrder,
  getDependencies,
  dependsOn
};
