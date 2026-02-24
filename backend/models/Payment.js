const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'credit_card', 'debit_card', 'cash'],
    default: 'paypal'
  },
  paypalPaymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  paypalPayerId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date,
  refundReason: String,
  metadata: {
    type: Map,
    of: String
  },
  receipt: {
    receiptNumber: String,
    receiptUrl: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Index for efficient queries
paymentSchema.index({ patient: 1, paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
