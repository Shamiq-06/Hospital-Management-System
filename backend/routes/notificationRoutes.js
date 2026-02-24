const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { validateId, validate } = require('../middleware/validation');

// Protect all routes
router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.get('/:id', validateId, validate, notificationController.getNotificationById);
router.put('/:id/read', validateId, validate, notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', validateId, validate, notificationController.deleteNotification);

module.exports = router;
