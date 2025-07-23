const express = require('express');
const categoryController = require('../controllers/categoryController');
const admin = require('../middleware/admin'); // Admin middleware is applied after isAuthenticated in index.js

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only routes
router.post('/', admin, categoryController.createCategory);
router.put('/:id', admin, categoryController.updateCategory);
router.delete('/:id', admin, categoryController.deleteCategory);

module.exports = router;