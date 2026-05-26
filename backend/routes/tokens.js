const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const Queue = require('../models/Queue');

// GET tokens for a queue
router.get('/queue/:queueId', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { queueId: req.params.queueId };
    if (status) filter.status = status;
    const tokens = await Token.find(filter).sort({ createdAt: 1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all tokens (for display board)
router.get('/all', async (req, res) => {
  try {
    const serving = await Token.find({ status: 'serving' })
      .populate('queueId', 'name prefix counterName color')
      .sort({ calledAt: -1 })
      .limit(10);
    const recent = await Token.find({ status: 'completed' })
      .populate('queueId', 'name prefix counterName color')
      .sort({ completedAt: -1 })
      .limit(5);
    res.json({ serving, recent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET token by ID
router.get('/:id', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate('queueId');
    if (!token) return res.status(404).json({ error: 'Token not found' });
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GENERATE new token
router.post('/generate', async (req, res) => {
  try {
    const { queueId, customerName, customerPhone, priority, notes } = req.body;
    const queue = await Queue.findById(queueId);
    if (!queue) return res.status(404).json({ error: 'Queue not found' });
    if (queue.status !== 'active') {
      return res.status(400).json({ error: 'Queue is not active' });
    }

    queue.totalIssued += 1;
    await queue.save();

    const tokenNumber = queue.totalIssued;
    const tokenDisplay = `${queue.prefix}${String(tokenNumber).padStart(3, '0')}`;

    const token = new Token({
      queueId,
      tokenNumber,
      tokenDisplay,
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || '',
      priority: priority || 'normal',
      notes: notes || ''
    });

    await token.save();

    const waiting = await Token.countDocuments({ queueId, status: 'waiting' });

    req.io.emit('token_generated', {
      token,
      queue: { ...queue.toObject(), waitingCount: waiting }
    });

    res.status(201).json({ token, estimatedWait: waiting * queue.avgWaitTime });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE token status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ error: 'Token not found' });

    token.status = status;
    if (status === 'serving') token.calledAt = new Date();
    if (status === 'completed') token.completedAt = new Date();
    await token.save();

    req.io.emit('token_updated', token);
    res.json(token);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE token
router.delete('/:id', async (req, res) => {
  try {
    const token = await Token.findByIdAndDelete(req.params.id);
    req.io.emit('token_deleted', { id: req.params.id, queueId: token?.queueId });
    res.json({ message: 'Token deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
router.get('/stats/summary', async (req, res) => {
  try {
    const totalWaiting = await Token.countDocuments({ status: 'waiting' });
    const totalServing = await Token.countDocuments({ status: 'serving' });
    const totalCompleted = await Token.countDocuments({ status: 'completed' });
    const totalToday = await Token.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    res.json({ totalWaiting, totalServing, totalCompleted, totalToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
