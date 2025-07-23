const express = require('express');
const supportTicketController = require('../controllers/supportTicketController');
const router = express.Router();

router.get('/', supportTicketController.getAllSupportTickets);
router.get('/:id', supportTicketController.getSupportTicketById);
router.post('/', supportTicketController.createSupportTicket);
router.put('/:id', supportTicketController.updateSupportTicket);
router.delete('/:id', supportTicketController.deleteSupportTicket);

module.exports = router; 