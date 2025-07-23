const express = require('express');
const settingController = require('../controllers/settingController');
const admin = require('../middleware/admin'); // Admin middleware is applied after isAuthenticated in index.js

const router = express.Router();

// Admin-only routes
router.get('/', admin, settingController.getAllSettings);
router.get('/:id', admin, settingController.getSettingById);
router.put('/:id', admin, settingController.updateSetting);

module.exports = router;