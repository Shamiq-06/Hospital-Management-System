const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['registration', 'appointment_confirmation', 'appointment_reminder', 'appointment_status', 'payment_confirmation', 'general'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'sms', 'email'],
    default: 'whatsapp'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
    default: 'pending'
  },
  whatsappMessageId: String,
  metadata: {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    additionalInfo: Map
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
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

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
