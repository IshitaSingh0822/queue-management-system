const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const Token = require('../models/Token');

// GET all queues with stats
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find().lean();
    const enriched = await Promise.all(
      queues.map(async (q) => {
        const waiting = await Token.countDocuments({ queueId: q._id, status: 'waiting' });
        const serving = await Token.countDocuments({ queueId: q._id, status: 'serving' });
        const completed = await Token.countDocuments({ queueId: q._id, status: 'completed' });
        return { ...q, waitingCount: waiting, servingCount: serving, completedCount: completed };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single queue
router.get('/:id', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).lean();
    if (!queue) return res.status(404).json({ error: 'Queue not found' });
    const waiting = await Token.countDocuments({ queueId: queue._id, status: 'waiting' });
    const serving = await Token.countDocuments({ queueId: queue._id, status: 'serving' });
    const completed = await Token.countDocuments({ queueId: queue._id, status: 'completed' });
    res.json({ ...queue, waitingCount: waiting, servingCount: serving, completedCount: completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE queue
router.post('/', async (req, res) => {
  try {
    const queue = new Queue(req.body);
    await queue.save();
    req.io.emit('queue_created', queue);
    res.status(201).json(queue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE queue
router.put('/:id', async (req, res) => {
  try {
    const queue = await Queue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.io.emit('queue_updated', queue);
    res.json(queue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE queue
router.delete('/:id', async (req, res) => {
  try {
    await Queue.findByIdAndDelete(req.params.id);
    await Token.deleteMany({ queueId: req.params.id });
    req.io.emit('queue_deleted', { id: req.params.id });
    res.json({ message: 'Queue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CALL next token
router.post('/:id/next', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) return res.status(404).json({ error: 'Queue not found' });

    // Mark current serving as completed
    await Token.updateMany(
      { queueId: req.params.id, status: 'serving' },
      { status: 'completed', completedAt: new Date() }
    );

    // Get next waiting token
    const nextToken = await Token.findOne({
      queueId: req.params.id,
      status: 'waiting'
    }).sort({ priority: -1, createdAt: 1 });

    if (!nextToken) {
      req.io.emit('queue_updated', { ...queue.toObject(), currentServing: 0 });
      return res.json({ message: 'No waiting tokens', token: null });
    }

    nextToken.status = 'serving';
    nextToken.calledAt = new Date();
    await nextToken.save();

    queue.currentServing = nextToken.tokenNumber;
    await queue.save();

    const waiting = await Token.countDocuments({ queueId: queue._id, status: 'waiting' });

    req.io.emit('token_called', {
      token: nextToken,
      queue: { ...queue.toObject(), waitingCount: waiting }
    });

    res.json({ token: nextToken, queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET queue
router.post('/:id/reset', async (req, res) => {
  try {
    await Token.deleteMany({ queueId: req.params.id });
    const queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { currentServing: 0, totalIssued: 0 },
      { new: true }
    );
    req.io.emit('queue_reset', queue);
    res.json({ message: 'Queue reset', queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
