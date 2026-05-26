const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true
  },
  tokenNumber: { type: Number, required: true },
  tokenDisplay: { type: String },
  customerName: { type: String, default: 'Customer', trim: true },
  customerPhone: { type: String, default: '', trim: true },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'skipped', 'cancelled'],
    default: 'waiting'
  },
  priority: { type: String, enum: ['normal', 'priority'], default: 'normal' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  calledAt: { type: Date },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Token', TokenSchema);
