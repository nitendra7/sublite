const express = require('express');
const settingController = require('../controllers/settingController');
const router = express.Router();

router.get('/', settingController.getAllSettings);
router.get('/:id', settingController.getSettingById);
router.put('/:id', settingController.updateSetting);

module.exports = router; 