const { User } = require('../models/user');

module.exports = async function (req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (_err) {
    res.status(500).json({ error: 'Server error' });
  }
};
