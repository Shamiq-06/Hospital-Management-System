const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateAppointment, validateId, validate } = require('../middleware/validation');

// Protect all routes
router.use(protect);

router.post(
  '/',
  authorize('patient'),
  validateAppointment,
  validate,
  appointmentController.createAppointment
);

router.get('/availability/:doctorId', appointmentController.getDoctorAvailability);
router.get('/:id', validateId, validate, appointmentController.getAppointmentById);

router.put(
  '/:id/reschedule',
  authorize('patient'),
  validateId,
  validate,
  appointmentController.rescheduleAppointment
);

router.put('/:id/cancel', validateId, validate, appointmentController.cancelAppointment);

module.exports = router;
