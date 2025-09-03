const express = require('express');
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');


const router = express.Router();

router.get('/', auth.optionalAuth, serviceController.getAllServices);


router.get('/my-services', auth, serviceController.getMyServices);

router.post('/', auth, serviceController.createService);



router.get('/:id', serviceController.getServiceById);

router.put('/:id', auth, serviceController.updateService);

router.delete('/:id', auth, serviceController.deleteService);


module.exports = router;