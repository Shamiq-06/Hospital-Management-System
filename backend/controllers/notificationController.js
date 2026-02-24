const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    let query = { recipient: req.user.id };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.notificationType = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Mark as read
    if (notification.status === 'delivered') {
      notification.status = 'read';
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      {
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        status: { $in: ['sent', 'delivered'] }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    await notification.remove();

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res, next) => {
  try {
    const total = await Notification.countDocuments({ recipient: req.user.id });
    const unread = await Notification.countDocuments({
      recipient: req.user.id,
      status: { $in: ['sent', 'delivered'] }
    });
    const read = await Notification.countDocuments({
      recipient: req.user.id,
      status: 'read'
    });
    const failed = await Notification.countDocuments({
      recipient: req.user.id,
      status: 'failed'
    });

    res.status(200).json({
      status: 'success',
      data: {
        total,
        unread,
        read,
        failed
      }
    });
  } catch (error) {
    next(error);
  }
};
