const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const { validateDoctorProfile, validateAvailabilitySlot, validateId, validate } = require('../middleware/validation');

// Protect all routes
router.use(protect);
router.use(authorize('doctor'));

router.post('/profile', validateDoctorProfile, validate, doctorController.createOrUpdateProfile);
router.get('/profile', doctorController.getProfile);

router.post('/availability', validateAvailabilitySlot, validate, doctorController.createAvailability);
router.get('/availability', doctorController.getAvailability);
router.put('/availability/:id', validateId, validate, doctorController.updateAvailability);
router.delete('/availability/:id', validateId, validate, doctorController.deleteAvailability);

router.get('/appointments', doctorController.getAppointments);
router.put('/appointments/:id/status', validateId, validate, doctorController.updateAppointmentStatus);
router.put('/appointments/:id/notes', validateId, validate, doctorController.addConsultationNotes);

router.get('/statistics', doctorController.getStatistics);

module.exports = router;
