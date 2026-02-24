const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin, validate } = require('../middleware/validation');

router.post('/register', validateRegistration, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
