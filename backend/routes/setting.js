const express = require('express');
const settingController = require('../controllers/settingController');
const auth= require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// PROTECTED (Admin only)
router.get('/', auth, admin, settingController.getAllSettings);
router.get('/:id', auth, admin, settingController.getSettingById);
router.put('/:id', auth, admin, settingController.updateSetting);

module.exports = router;