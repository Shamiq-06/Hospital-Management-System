const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  slots: [{
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringEndDate: {
    type: Date
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
availabilitySlotSchema.index({ doctor: 1, date: 1 });

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
