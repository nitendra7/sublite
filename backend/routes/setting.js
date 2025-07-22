const express = require('express');
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// PROTECTED (Admin only)
router.get('/', authMiddleware, adminMiddleware, settingController.getAllSettings);
router.get('/:id', authMiddleware, adminMiddleware, settingController.getSettingById);
router.put('/:id', authMiddleware, adminMiddleware, settingController.updateSetting);

module.exports = router;