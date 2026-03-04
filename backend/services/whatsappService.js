const axios = require('axios');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.demoRecipient = process.env.WHATSAPP_DEMO_TO_NUMBER || '';
    this.defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '94').replace(/\D/g, '');
  }

  normalizePhoneNumber(phone) {
    const digits = String(phone || '').replace(/\D/g, '');

    if (!digits) return '';

    // Convert local format like 0701273949 -> 94701273949 (using default country code)
    if (digits.startsWith('0') && digits.length >= 10) {
      return `${this.defaultCountryCode}${digits.slice(1)}`;
    }

    return digits;
  }

  // Check if WhatsApp credentials are real
  isConfigured() {
    return (
      this.accessToken &&
      this.phoneNumberId &&
      !this.accessToken.includes('your_') &&
      !this.phoneNumberId.includes('your_')
    );
  }

  // Send WhatsApp message
  async sendMessage(to, message, notificationType, metadata = {}) {
    let notification;
    try {
      const targetPhone = this.demoRecipient || to;
      const originalPhone = to;

      if (!targetPhone) {
        throw new Error('Recipient phone number is missing');
      }

      // Format phone number (remove any non-digit characters and ensure it has country code)
      const formattedPhone = this.normalizePhoneNumber(targetPhone);

      notification = await Notification.create({
        recipient: metadata.userId,
        recipientPhone: formattedPhone,
        notificationType,
        message,
        channel: 'whatsapp',
        status: 'pending',
        metadata: {
          ...metadata,
          originalRecipientPhone: originalPhone,
          redirectedToDemoNumber: Boolean(this.demoRecipient)
        }
      });

      if (this.demoRecipient) {
        logger.info(`[WhatsApp DEMO ROUTE] Original: ${originalPhone} -> Demo: ${this.demoRecipient}`);
      }

      // ── DEMO MODE: credentials not configured ─────────────────────────────
      if (!this.isConfigured()) {
        logger.info(`[WhatsApp DEMO] To: +${formattedPhone}`);
        logger.info(`[WhatsApp DEMO] Message:\n${message}`);
        notification.status = 'demo';
        notification.sentAt = new Date();
        await notification.save();
        return { success: true, demo: true, notificationId: notification._id };
      }
      // ── REAL WHATSAPP API ─────────────────────────────────────────────────

      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const data = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.whatsappMessageId = response.data.messages[0].id;
      await notification.save();

      logger.success(`WhatsApp message sent to ${formattedPhone}`);

      return {
        success: true,
        messageId: response.data.messages[0].id,
        notificationId: notification._id
      };

    } catch (error) {
      logger.error('WhatsApp message failed:', error.response?.data || error.message);

      // Update notification status
      if (notification) {
        notification.status = 'failed';
        notification.errorMessage = error.response?.data?.error?.message || error.message;
        notification.retryCount += 1;
        await notification.save();
      }

      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Template: Registration Welcome
  async sendRegistrationMessage(user) {
    const message = `Hello ${user.firstName} ${user.lastName}! 👋\n\nWelcome to our Hospital Management System. Your account has been successfully created.\n\n📧 Email: ${user.email}\n👤 Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}\n\nThank you for choosing our services!`;

    return await this.sendMessage(
      user.phoneNumber,
      message,
      'registration',
      { userId: user._id }
    );
  }

  // Template: Appointment Confirmation
  async sendAppointmentConfirmation(appointment, doctor, patient) {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Hi ${patient.firstName}! ✅\n\nYour appointment has been confirmed.\n\n👨‍⚕️ Doctor: Dr. ${doctor.firstName} ${doctor.lastName}\n📅 Date: ${appointmentDate}\n🕐 Time: ${appointment.appointmentTime.startTime}\n📍 Reason: ${appointment.reasonForVisit}\n\nPlease arrive 10 minutes early. Stay healthy!`;

    return await this.sendMessage(
      patient.phoneNumber,
      message,
      'appointment_confirmation',
      {
        userId: patient._id,
        appointment: appointment._id
      }
    );
  }

  // Template: Appointment Reminder (24 hours before)
  async sendAppointmentReminder(appointment, doctor, patient) {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Reminder! ⏰\n\nHi ${patient.firstName}, your appointment is tomorrow.\n\n👨‍⚕️ Doctor: Dr. ${doctor.firstName} ${doctor.lastName}\n📅 Date: ${appointmentDate}\n🕐 Time: ${appointment.appointmentTime.startTime}\n\nSee you soon!`;

    return await this.sendMessage(
      patient.phoneNumber,
      message,
      'appointment_reminder',
      {
        userId: patient._id,
        appointment: appointment._id
      }
    );
  }

  // Template: Appointment Status Update
  async sendAppointmentStatusUpdate(appointment, patient, newStatus) {
    const statusMessages = {
      confirmed: 'confirmed ✅',
      rejected: 'rejected ❌',
      cancelled: 'cancelled 🚫',
      completed: 'completed ✔️',
      rescheduled: 'rescheduled 📅'
    };

    const message = `Hi ${patient.firstName}!\n\nYour appointment status has been updated to: ${statusMessages[newStatus]}\n\nAppointment Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}\nTime: ${appointment.appointmentTime.startTime}\n\n${newStatus === 'rejected' || newStatus === 'cancelled' ? 'Please contact us for more information or to book another appointment.' : 'Thank you!'}`;

    return await this.sendMessage(
      patient.phoneNumber,
      message,
      'appointment_status',
      {
        userId: patient._id,
        appointment: appointment._id
      }
    );
  }

  // Template: Payment Confirmation
  async sendPaymentConfirmation(payment, patient, appointment) {
    const message = `Payment Successful! 💳\n\nHi ${patient.firstName},\n\nYour payment has been processed successfully.\n\n💰 Amount: $${payment.amount}\n🆔 Transaction ID: ${payment.transactionId}\n📅 Date: ${new Date(payment.paymentDate).toLocaleDateString()}\n\nThank you for your payment!`;

    return await this.sendMessage(
      patient.phoneNumber,
      message,
      'payment_confirmation',
      {
        userId: patient._id,
        payment: payment._id,
        appointment: appointment._id
      }
    );
  }
}

module.exports = new WhatsAppService();
