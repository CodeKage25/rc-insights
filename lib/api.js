'use strict';

const fetch = require('node-fetch');

const BASE_URL = 'https://api.revenuecat.com/v2';

/**
 * Fetch a single chart from the RevenueCat Charts API.
 * @param {string} apiKey - Secret API key (sk_*)
 * @param {string} projectId - Project ID (e.g. proj058a6330)
 * @param {string} chart - Chart name (mrr, revenue, actives, churn, trials, etc.)
 * @param {object} params - Query params: start_date, end_date, resolution, segment
 * @returns {Promise<object>} Raw API response
 */
async function fetchChart(apiKey, projectId, chart, params = {}) {
  const url = new URL(`${BASE_URL}/projects/${projectId}/charts/${chart}`);

  const defaults = {
    resolution: '1', // weekly
    start_date: oneYearAgo(),
    end_date: today(),
  };

  Object.entries({ ...defaults, ...params }).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Charts API error ${res.status} for "${chart}": ${body}`);
  }

  return res.json();
}

/**
 * Fetch all charts needed for a full health report in parallel.
 */
async function fetchAllCharts(apiKey, projectId, params = {}) {
  const charts = ['mrr', 'revenue', 'actives', 'churn', 'trials', 'new_customers'];

  const results = await Promise.allSettled(
    charts.map((c) => fetchChart(apiKey, projectId, c, params))
  );

  const data = {};
  charts.forEach((name, i) => {
    if (results[i].status === 'fulfilled') {
      data[name] = results[i].value;
    }
  });

  return data;
}

// ── helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function oneYearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
}

module.exports = { fetchChart, fetchAllCharts };
