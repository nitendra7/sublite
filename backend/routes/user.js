const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate, updateUserSchema } = require('../middleware/validation');

const router = express.Router();



router.get('/me', auth, userController.getMe);

const upload = require('../middleware/upload');
router.put('/me', validate(updateUserSchema), auth, upload, userController.updateMe);

router.delete('/me', auth, userController.deactivateMe);


router.get('/', auth, admin, userController.getAllUsers);

router.get('/:id', auth, admin, userController.getUserById);

router.delete('/:id', auth, admin, userController.deleteUserById);

router.patch('/:id/role', auth, admin, userController.updateUserRole);

module.exports = router;
