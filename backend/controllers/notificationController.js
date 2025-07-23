const Notification = require('../models/notification');

// Authentication for these routes is determined by index.js setup.
// Consider if these routes should filter by req.user._id if user-specific notifications are desired.

exports.getAllNotifications = async (req, res) => {
  try {
    // If you want to get notifications *for the logged-in user*, you'd filter by req.user._id:
    // const notifications = await Notification.find({ userId: req.user._id });
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    // If you want to ensure the user can only get their own notification, add a filter:
    // const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    // If the logged-in user is creating a notification for themselves, you might use req.user._id:
    // const notification = new Notification({ ...req.body, userId: req.user._id });
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    // If update requires user ownership, add a check:
    // const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    // If delete requires user ownership, add a check:
    // const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};