const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validatePayment, validateId, validate } = require('../middleware/validation');

// Protect all routes
router.use(protect);

router.post('/create', authorize('patient'), paymentController.createPayment);
router.post('/execute', authorize('patient'), paymentController.executePayment);
router.post('/:id/complete-demo', authorize('patient'), validateId, validate, paymentController.completeDemo);
router.get('/', paymentController.getUserPayments);
router.get('/:id', validateId, validate, paymentController.getPaymentById);
router.get('/:id/verify', validateId, validate, paymentController.verifyPayment);
router.post(
  '/:id/refund',
  authorize('admin'),
  validateId,
  validate,
  paymentController.refundPayment
);

module.exports = router;
