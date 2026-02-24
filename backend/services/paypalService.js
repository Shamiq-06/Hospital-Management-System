const paypal = require('paypal-rest-sdk');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

class PayPalService {
  // Create payment
  async createPayment(appointmentId, patientId, doctorId, amount, description) {
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: `${process.env.CLIENT_URL}/payment/success`,
          cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
        },
        transactions: [{
          item_list: {
            items: [{
              name: description || 'Medical Consultation',
              sku: appointmentId.toString(),
              price: amount.toFixed(2),
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: amount.toFixed(2)
          },
          description: description || 'Medical consultation fee'
        }]
      };

      paypal.payment.create(create_payment_json, async (error, payment) => {
        if (error) {
          logger.error('PayPal payment creation failed:', error);
          reject(error);
        } else {
          // Create payment record in database
          const paymentRecord = await Payment.create({
            appointment: appointmentId,
            patient: patientId,
            doctor: doctorId,
            amount: amount,
            currency: 'USD',
            paymentMethod: 'paypal',
            paypalPaymentId: payment.id,
            paymentStatus: 'pending'
          });

          // Get approval URL
          const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;

          logger.info(`PayPal payment created: ${payment.id}`);

          resolve({
            paymentId: payment.id,
            approvalUrl: approvalUrl,
            paymentRecordId: paymentRecord._id
          });
        }
      });
    });
  }

  // Execute payment after user approval
  async executePayment(paymentId, payerId) {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId
      };

      paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
          logger.error('PayPal payment execution failed:', error);

          // Update payment status in database
          await Payment.findOneAndUpdate(
            { paypalPaymentId: paymentId },
            { paymentStatus: 'failed' }
          );

          reject(error);
        } else {
          // Update payment record in database
          const updatedPayment = await Payment.findOneAndUpdate(
            { paypalPaymentId: paymentId },
            {
              paymentStatus: 'completed',
              paypalPayerId: payerId,
              paymentDate: new Date(),
              'receipt.receiptNumber': `RCP${Date.now()}`
            },
            { new: true }
          );

          logger.success(`PayPal payment completed: ${paymentId}`);

          resolve({
            success: true,
            payment: payment,
            paymentRecord: updatedPayment
          });
        }
      });
    });
  }

  // Verify payment status
  async verifyPayment(paymentId) {
    return new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, async (error, payment) => {
        if (error) {
          logger.error('PayPal payment verification failed:', error);
          reject(error);
        } else {
          const paymentRecord = await Payment.findOne({ paypalPaymentId: paymentId });

          resolve({
            paypalStatus: payment.state,
            dbStatus: paymentRecord?.paymentStatus,
            payment: payment,
            paymentRecord: paymentRecord
          });
        }
      });
    });
  }

  // Refund payment
  async refundPayment(paymentId, amount, reason) {
    return new Promise((resolve, reject) => {
      // First, get the sale ID from the payment
      paypal.payment.get(paymentId, async (error, payment) => {
        if (error) {
          logger.error('Failed to get payment for refund:', error);
          reject(error);
          return;
        }

        const saleId = payment.transactions[0].related_resources[0].sale.id;

        const refund_json = {
          amount: {
            currency: 'USD',
            total: amount.toFixed(2)
          },
          description: reason || 'Refund for cancelled appointment'
        };

        paypal.sale.refund(saleId, refund_json, async (refundError, refund) => {
          if (refundError) {
            logger.error('PayPal refund failed:', refundError);
            reject(refundError);
          } else {
            // Update payment record in database
            const updatedPayment = await Payment.findOneAndUpdate(
              { paypalPaymentId: paymentId },
              {
                paymentStatus: 'refunded',
                refundAmount: amount,
                refundDate: new Date(),
                refundReason: reason
              },
              { new: true }
            );

            logger.success(`PayPal refund completed: ${refund.id}`);

            resolve({
              success: true,
              refund: refund,
              paymentRecord: updatedPayment
            });
          }
        });
      });
    });
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    const paymentRecord = await Payment.findById(paymentId)
      .populate('appointment')
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName');

    return paymentRecord;
  }
}

module.exports = new PayPalService();
