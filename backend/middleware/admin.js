const User = require('../models/user');

module.exports = async function (req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    // Fetch user from DB to get latest role
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 