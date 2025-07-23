const SupportTicket = require('../models/supportTicket');

// Authentication for these routes is determined by index.js setup.
// If these routes are protected, req.user will be available.

exports.getAllSupportTickets = async (req, res) => {
  try {
    // If you want to get tickets *for the logged-in user*, filter by req.user._id:
    // const tickets = await SupportTicket.find({ userId: req.user._id });
    const tickets = await SupportTicket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    // If you want to ensure the user can only get their own ticket, add a filter:
    // const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupportTicket = async (req, res) => {
  try {
    // If the logged-in user is creating a ticket for themselves, you might use req.user._id:
    // const ticket = new SupportTicket({ ...req.body, userId: req.user._id });
    const ticket = new SupportTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSupportTicket = async (req, res) => {
  try {
    // If update requires user ownership, add a check:
    // const ticket = await SupportTicket.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    // If delete requires user ownership, add a check:
    // const ticket = await SupportTicket.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
    res.json({ message: 'Support ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};