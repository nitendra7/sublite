const { User } = require("../models/user");
const RefreshToken = require("../models/refreshtoken");
const Service = require("../models/service");
const bcrypt = require("bcryptjs");

exports.getMe = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { name, username, phone, password } = req.body;
    let providerSettings;
    if (req.body.providerSettings) {
      try {
        providerSettings =
          typeof req.body.providerSettings === "string"
            ? JSON.parse(req.body.providerSettings)
            : req.body.providerSettings;
      } catch (_e) {
        return res.status(400).json({ message: "Invalid providerSettings format. Must be valid JSON." });
      }
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 12);

    if (providerSettings) {
      if (!user.providerSettings || typeof user.providerSettings !== "object") user.providerSettings = {};
      if (providerSettings.activeHours) {
        if (!user.providerSettings.activeHours || typeof user.providerSettings.activeHours !== "object")
          user.providerSettings.activeHours = {};
        if ("start" in providerSettings.activeHours)
          user.providerSettings.activeHours.start = providerSettings.activeHours.start;
        if ("end" in providerSettings.activeHours)
          user.providerSettings.activeHours.end = providerSettings.activeHours.end;
      }
      if ("timezone" in providerSettings) user.providerSettings.timezone = providerSettings.timezone;
      user.providerSettingsCompleted = true;
    }

    if (req.file && req.file.path) {
      user.profilePicture = req.file.path;
    } else if (req.file && req.file.filename) {
      user.profilePicture = req.file.filename;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    if (!userResponse.profilePicture) userResponse.profilePicture = user.profilePicture || "/logos/logo.png";
    return res.json(userResponse);
  } catch (err) {
    console.error("updateMe error", err);
    return res.status(500).json({ message: "Server error while updating profile.", error: err.message });
  }
};

exports.deactivateMe = async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isActive = false;
    await user.save();

    if (req.user.tokenType === "custom_jwt") {
      await RefreshToken.deleteMany({ userId });
    }

    return res.status(200).json({ message: "Your account has been successfully deactivated." });
  } catch (err) {
    return res.status(500).json({ message: "Server error during account deactivation.", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: "Missing user id." });
  try {
    const user = await User.findOne({ _id: id, isActive: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid user ID." });
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.deleteUserById = async (req, res) => {
  const requesterId = req.user && req.user._id;
  if (!requesterId) return res.status(401).json({ message: "Unauthorized" });
  try {
    if (requesterId.toString() === req.params.id) {
      return res.status(400).json({ message: "Admins cannot delete themselves." });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user || !user.isActive) return res.status(404).json({ message: "User not found." });

    const deletedServices = await Service.updateMany({ providerId: userId }, { serviceStatus: "suspended" });

    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    await user.save();

    return res.status(200).json({
      message: "User deleted successfully.",
      deletedServices: deletedServices.modifiedCount,
    });
  } catch (err) {
    console.error("deleteUserById error", err);
    return res.status(500).json({ message: "Failed to delete user.", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const requesterId = req.user && req.user._id;
  if (!requesterId) return res.status(401).json({ message: "Unauthorized" });
  try {
    if (requesterId.toString() === req.params.id) {
      return res.status(400).json({ message: "Admins cannot change their own admin status." });
    }
    const { isAdmin } = req.body;
    if (typeof isAdmin !== "boolean") return res.status(400).json({ message: "isAdmin must be a boolean." });

    const user = await User.findOne({ _id: req.params.id, isActive: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isAdmin = isAdmin;
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    return res.status(200).json(userResponse);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.getSoftDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await User.find({ isActive: false }).select("-password");
    return res.json({
      message: "Soft deleted users retrieved successfully",
      count: deletedUsers.length,
      users: deletedUsers,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, isActive: false });
    if (!user) return res.status(404).json({ message: "Deleted user not found." });

    user.isActive = true;
    if (user.email && user.email.startsWith("deleted_")) user.email = user.email.replace(/^deleted_\d+_/, "");
    if (user.username && user.username.startsWith("deleted_")) user.username = user.username.replace(/^deleted_\d+_/, "");
    await user.save();

    return res.status(200).json({ message: "User restored successfully.", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("restoreUser error", err);
    return res.status(500).json({ message: "Failed to restore user.", error: err.message });
  }
};

exports.permanentDeleteUser = async (req, res) => {
  const requesterId = req.user && req.user._id;
  if (!requesterId) return res.status(401).json({ message: "Unauthorized" });
  try {
    if (requesterId.toString() === req.params.id) {
      return res.status(400).json({ message: "Admins cannot permanently delete themselves." });
    }

    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, isActive: false });
    if (!user) return res.status(404).json({ message: "Soft deleted user not found." });

    const deletedServices = await Service.deleteMany({ providerId: userId });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User permanently deleted successfully.",
      deletedServices: deletedServices.deletedCount,
    });
  } catch (err) {
    console.error("permanentDeleteUser error", err);
    return res.status(500).json({ message: "Failed to permanently delete user.", error: err.message });
  }
};
