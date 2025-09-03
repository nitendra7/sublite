const SupportTicket = require('../models/supportTicket');


exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupportTicket = async (req, res) => {
  try {
    const ticket = new SupportTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json({ message: 'Support ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};