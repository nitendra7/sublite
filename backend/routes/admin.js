const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /api/admin/stats - dashboard summary statistics (protected)
router.get('/stats', auth, admin, adminController.getDashboardStats);

// GET /api/admin/users - get all users for admin management (protected)
router.get('/users', auth, admin, adminController.getAllUsers);

module.exports = router;
