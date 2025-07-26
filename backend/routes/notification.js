const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);
router.patch('/:id/read', auth, notificationController.markAsRead);

module.exports = router;