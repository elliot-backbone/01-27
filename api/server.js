/**
 * Backbone API Server (Option C - Production Ready)
 * 
 * Standalone backend service running on port 4000.
 * UI calls this service for all data operations.
 * 
 * @module api/server
 */

import http from 'http';
import { URL } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { compute } from '../runtime/engine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

// =============================================================================
// DATA LAYER
// =============================================================================

const DATA_PATH = join(__dirname, '../raw/sample.json');
const EVENTS_PATH = join(__dirname, '../raw/actionEvents.json');

function loadPortfolioData() {
  const raw = readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function loadActionEvents() {
  if (!existsSync(EVENTS_PATH)) {
    return [];
  }
  const raw = readFileSync(EVENTS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveActionEvents(events) {
  writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
}

// =============================================================================
// ENGINE LAYER
// =============================================================================

let cachedResult = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 60000; // 1 minute cache

function getEngineOutput() {
  const now = Date.now();
  
  if (cachedResult && cacheTimestamp && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedResult;
  }
  
  const portfolioData = loadPortfolioData();
  const result = compute(portfolioData, new Date());
  
  cachedResult = result;
  cacheTimestamp = now;
  
  return result;
}

function invalidateCache() {
  cachedResult = null;
  cacheTimestamp = null;
}

// =============================================================================
// ACTION FILTERING
// =============================================================================

function filterCompletedActions(actions, events) {
  const completedIds = new Set(
    events
      .filter(e => e.eventType === 'ACTION_COMPLETED' || e.eventType === 'ACTION_SKIPPED')
      .map(e => e.actionId)
  );
  
  return actions.filter(a => !completedIds.has(a.actionId));
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

const routes = {
  'GET /api/health': (req, res) => {
    json(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  },
  
  'GET /api/actions': (req, res) => {
    const output = getEngineOutput();
    const events = loadActionEvents();
    const availableActions = filterCompletedActions(output.actions, events);
    
    json(res, 200, {
      actions: availableActions,
      total: availableActions.length,
      meta: output.meta
    });
  },
  
  'GET /api/actions/today': (req, res) => {
    const output = getEngineOutput();
    const events = loadActionEvents();
    const availableActions = filterCompletedActions(output.actions, events);
    
    if (availableActions.length === 0) {
      json(res, 200, { action: null, message: 'No actions available' });
      return;
    }
    
    const topAction = availableActions[0];
    json(res, 200, topAction);
  },
  
  'GET /api/actions/:id': (req, res, params) => {
    const output = getEngineOutput();
    const action = output.actions.find(a => a.actionId === params.id);
    
    if (!action) {
      json(res, 404, { error: 'Action not found' });
      return;
    }
    
    json(res, 200, action);
  },
  
  'POST /api/actions/:id/complete': async (req, res, params) => {
    const body = await parseBody(req);
    const { actionId, completedAt } = body;
    
    if (!actionId || actionId !== params.id) {
      json(res, 400, { error: 'Invalid action ID' });
      return;
    }
    
    if (!completedAt) {
      json(res, 400, { error: 'completedAt timestamp required' });
      return;
    }
    
    const events = loadActionEvents();
    
    const alreadyCompleted = events.some(
      e => e.actionId === actionId && e.eventType === 'ACTION_COMPLETED'
    );
    
    if (alreadyCompleted) {
      json(res, 409, { error: 'Action already completed' });
      return;
    }
    
    events.push({
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      actionId,
      eventType: 'ACTION_COMPLETED',
      completedAt,
      completedBy: 'user',
      timestamp: new Date().toISOString()
    });
    
    saveActionEvents(events);
    invalidateCache();
    
    res.writeHead(204);
    res.end();
  },
  
  'POST /api/actions/:id/skip': async (req, res, params) => {
    const body = await parseBody(req);
    const { actionId, skippedAt, reason } = body;
    
    if (!actionId || actionId !== params.id) {
      json(res, 400, { error: 'Invalid action ID' });
      return;
    }
    
    if (!skippedAt) {
      json(res, 400, { error: 'skippedAt timestamp required' });
      return;
    }
    
    const events = loadActionEvents();
    
    events.push({
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      actionId,
      eventType: 'ACTION_SKIPPED',
      skippedAt,
      skippedBy: 'user',
      reason: reason || null,
      timestamp: new Date().toISOString()
    });
    
    saveActionEvents(events);
    invalidateCache();
    
    res.writeHead(204);
    res.end();
  },
  
  'GET /api/companies': (req, res) => {
    const output = getEngineOutput();
    json(res, 200, {
      companies: output.companies,
      total: output.companies.length
    });
  },
  
  'GET /api/companies/:id': (req, res, params) => {
    const output = getEngineOutput();
    const company = output.companies.find(c => c.id === params.id);
    
    if (!company) {
      json(res, 404, { error: 'Company not found' });
      return;
    }
    
    json(res, 200, company);
  },
  
  'GET /api/events': (req, res) => {
    const events = loadActionEvents();
    json(res, 200, { events, total: events.length });
  },
  
  'DELETE /api/events': (req, res) => {
    saveActionEvents([]);
    invalidateCache();
    json(res, 200, { cleared: true });
  },
  
  'GET /api/meta': (req, res) => {
    const output = getEngineOutput();
    json(res, 200, output.meta);
  }
};

// =============================================================================
// UTILITIES
// =============================================================================

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function matchRoute(method, pathname) {
  const exactKey = `${method} ${pathname}`;
  if (routes[exactKey]) {
    return { handler: routes[exactKey], params: {} };
  }
  
  for (const [pattern, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = pattern.split(' ');
    if (routeMethod !== method) continue;
    
    const routeParts = routePath.split('/');
    const pathParts = pathname.split('/');
    
    if (routeParts.length !== pathParts.length) continue;
    
    const params = {};
    let match = true;
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return { handler, params };
    }
  }
  
  return null;
}

// =============================================================================
// SERVER
// =============================================================================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;
  
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  const route = matchRoute(method, pathname);
  
  if (!route) {
    json(res, 404, { error: 'Not found' });
    return;
  }
  
  try {
    await route.handler(req, res, route.params);
  } catch (err) {
    console.error('Handler error:', err);
    json(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  BACKBONE API SERVER                                          ║
║  Port: ${PORT}                                                   ║
║  Endpoints: /api/health, /api/actions, /api/companies         ║
╚═══════════════════════════════════════════════════════════════╝
`);
});
