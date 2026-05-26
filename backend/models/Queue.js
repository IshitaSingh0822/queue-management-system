const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  prefix: { type: String, default: 'A', maxlength: 3, uppercase: true },
  currentServing: { type: Number, default: 0 },
  totalIssued: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  avgWaitTime: { type: Number, default: 5 },
  counterName: { type: String, default: 'Counter 1' },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

QueueSchema.virtual('waitingCount', {
  ref: 'Token',
  localField: '_id',
  foreignField: 'queueId',
  count: true,
  match: { status: 'waiting' }
});

module.exports = mongoose.model('Queue', QueueSchema);
