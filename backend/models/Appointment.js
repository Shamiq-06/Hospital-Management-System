const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientProfile',
    required: true
  },
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
  availabilitySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailabilitySlot',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxlength: 500
  },
  symptoms: [String],
  consultationNotes: {
    type: String,
    maxlength: 2000
  },
  diagnosis: {
    type: String,
    maxlength: 1000
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  followUpDate: Date,
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isFirstVisit: {
    type: Boolean,
    default: true
  },
  notificationsSent: {
    confirmation: { type: Boolean, default: false },
    reminder: { type: Boolean, default: false },
    statusUpdate: { type: Boolean, default: false }
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  cancelledAt: Date,
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
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

// Indexes for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
