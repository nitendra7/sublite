const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /api/admin/stats - dashboard summary statistics (protected)
router.get('/stats', auth, admin, adminController.getDashboardStats);

module.exports = router;