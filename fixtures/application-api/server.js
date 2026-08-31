const express = require('express');

const app = express();
const port = Number.parseInt(process.env.PORT || '4010', 10);
let transientFailureUsed = false;

const workOrders = [
  {
    workOrderId: 'WO-1001',
    createdAt: '2026-08-01T07:00:00Z',
    lineId: 'Line 1',
  },
  {
    workOrderId: 'WO-1002',
    createdAt: '2026-08-02T08:30:00Z',
    lineId: 'Line 1',
  },
  {
    workOrderId: 'WO-1003',
    createdAt: '2026-08-03T09:15:00Z',
    lineId: 'Line 1',
  },
  {
    workOrderId: 'WO-1004',
    createdAt: '2026-08-04T11:45:00Z',
    lineId: 'Line 1',
  },
  {
    workOrderId: 'WO-1005',
    createdAt: '2026-08-05T13:20:00Z',
    lineId: 'Line 1',
  },
  {
    workOrderId: 'WO-1006',
    createdAt: '2026-08-06T14:05:00Z',
    lineId: 'Line 1',
  },
];

const batches = [
  { batchId: 'B-1001', workOrderId: 'WO-1001', quantity: 120 },
  { batchId: 'B-1002', workOrderId: 'WO-1001', quantity: 90 },
  { batchId: 'B-1003', workOrderId: 'WO-1002', quantity: 150 },
  { batchId: 'B-1004', workOrderId: 'WO-1003', quantity: 110 },
  { batchId: 'B-1005', workOrderId: 'WO-1003', quantity: 70 },
  { batchId: 'B-1006', workOrderId: 'WO-1004', quantity: 130 },
  { batchId: 'B-1007', workOrderId: 'WO-1005', quantity: 160 },
  { batchId: 'B-1008', workOrderId: 'WO-1005', quantity: 80 },
  { batchId: 'B-1009', workOrderId: 'WO-1006', quantity: 140 },
  { batchId: 'B-1010', workOrderId: 'WO-1006', quantity: 95 },
];

const receiving = [
  { batchId: 'B-1001', receivedAt: '2026-08-01T07:30:00Z', quantity: 120 },
  { batchId: 'B-1003', receivedAt: '2026-08-02T09:00:00Z', quantity: 150 },
  { batchId: 'B-1004', receivedAt: '2026-08-03T10:00:00Z', quantity: 110 },
  { batchId: 'B-1006', receivedAt: '2026-08-04T12:30:00Z', quantity: 130 },
  { batchId: 'B-1007', receivedAt: '2026-08-05T14:00:00Z', quantity: 160 },
  { batchId: 'B-1009', receivedAt: '2026-08-06T15:00:00Z', quantity: 140 },
];

const dispatch = [
  { batchId: 'B-1001', dispatchedAt: '2026-08-01T18:00:00Z', quantity: 120 },
  { batchId: 'B-1004', dispatchedAt: '2026-08-03T20:15:00Z', quantity: 110 },
  { batchId: 'B-1007', dispatchedAt: '2026-08-05T22:00:00Z', quantity: 160 },
];

function parsePage(value, fallback) {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function paginate(items, page, pageSize) {
  const total = items.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    data: items.slice(start, end),
    page: safePage,
    pageSize: safePageSize,
    total,
  };
}

function applyFailure(req, res, next) {
  const failureMode = String(
    req.headers['x-simulate-failure'] || req.query.simulateFailure || '',
  ).toLowerCase();

  if (failureMode === 'timeout') {
    setTimeout(() => next(), 8000);
    return;
  }

  if (failureMode === '500-once') {
    if (!transientFailureUsed) {
      transientFailureUsed = true;
      return res.status(500).json({ error: 'Simulated transient failure' });
    }
  }

  next();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/work-orders', applyFailure, (req, res) => {
  const page = parsePage(req.query.page, 1);
  const pageSize = parsePage(req.query.pageSize, 2);
  res.json(paginate(workOrders, page, pageSize));
});

app.get('/batches', applyFailure, (req, res) => {
  const page = parsePage(req.query.page, 1);
  const pageSize = parsePage(req.query.pageSize, 2);
  res.json(paginate(batches, page, pageSize));
});

app.get('/receiving', applyFailure, (req, res) => {
  const page = parsePage(req.query.page, 1);
  const pageSize = parsePage(req.query.pageSize, 2);
  res.json(paginate(receiving, page, pageSize));
});

app.get('/dispatch', applyFailure, (req, res) => {
  const page = parsePage(req.query.page, 1);
  const pageSize = parsePage(req.query.pageSize, 2);
  res.json(paginate(dispatch, page, pageSize));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Application API fixture listening on http://0.0.0.0:${port}`);
});
