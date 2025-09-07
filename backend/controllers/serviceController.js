const Service = require("../models/service");
const { User } = require("../models/user");

const createService = async (req, res) => {
  try {
    const provider = await User.findById(req.user._id); // Uses req.user._id

    if (!provider.isProvider || !provider.providerSettingsCompleted) {
      provider.providerSettings = {
        activeHours: {
          start: "09:00",
          end: "18:00",
        },
        timezone: "UTC",
      };
      provider.providerSettingsCompleted = true;
      await provider.save();
    }

    const { serviceName, originalPrice, maxUsers } = req.body;

    if (!serviceName || !originalPrice || !maxUsers) {
      return res.status(400).json({
        message: "Service Name, Original Price, and Max Users are required.",
      });
    }

    const service = new Service({
      ...req.body,
      providerId: req.user._id,
    });

    await service.save();

    if (!provider.isProvider) {
      provider.isProvider = true;
      await provider.save();
    }

    res.status(201).json(service);
  } catch (err) {
    console.error("Service creation error:", err);
    console.error("Error stack:", err.stack);
    res.status(400).json({
      message: "Failed to create service.",
      error: err.message,
      details:
        err.name === "ValidationError"
          ? Object.keys(err.errors).map(
              (key) => `${key}: ${err.errors[key].message}`,
            )
          : undefined,
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    let query = { serviceStatus: "active", availableSlots: { $gt: 0 } };
    if (req.user && req.user._id) {
      query.providerId = { $ne: req.user._id };
    }
    const services = await Service.find(query)
      .populate("providerId", "username name rating providerSettings isActive")
      .sort({ createdAt: -1 });

    // Filter out services where provider doesn't exist or is soft deleted
    const validServices = services.filter(
      (service) =>
        service.providerId != null && service.providerId.isActive === true,
    );

    // Clean up orphaned services (services with deleted/soft-deleted providers)
    const orphanedServices = services.filter(
      (service) =>
        service.providerId == null || service.providerId.isActive === false,
    );
    if (orphanedServices.length > 0) {
      const orphanedIds = orphanedServices.map((service) => service._id);
      await Service.updateMany(
        { _id: { $in: orphanedIds } },
        { serviceStatus: "suspended" },
      );
      console.log(
        `Suspended ${orphanedServices.length} services with deleted/inactive providers`,
      );
    }

    res.json(validServices);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch services.", error: err.message });
  }
};

const getMyServices = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "User not authenticated or user ID missing." });
    }

    const userId = req.user._id;

    const services = await Service.find({ providerId: userId })
      .populate("categoryId")
      .select("-credentials");
    console.log(
      "getMyServices result:",
      services.map((s) => ({
        _id: s._id,
        serviceName: s.serviceName,
        providerId: s.providerId,
      })),
    );
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services offered by user:", error);
    res.status(500).json({
      message: "Server Error: Could not fetch your services.",
      error: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "providerId",
      "username name rating providerSettings isActive",
    );
    console.log("Service findById result:", {
      requestedId: req.params.id,
      foundService: service ? service._id : null,
      serviceProviderId: service ? service.providerId : null,
      providerActive: service?.providerId?.isActive,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Check if provider exists and is active (wasn't soft deleted)
    if (!service.providerId || service.providerId.isActive === false) {
      console.log(
        "Service provider deleted/inactive, suspending service:",
        req.params.id,
      );
      await Service.findByIdAndUpdate(req.params.id, {
        serviceStatus: "suspended",
      });
      return res.status(404).json({ message: "Service no longer available." });
    }
    res.json(service);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch service.", error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this service." });
    }
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.json(updatedService);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update service.", error: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Compare as strings to avoid ObjectId comparison issues
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "User not authorized to delete this service",
      });
    }

    await service.deleteOne();

    res.status(200).json({ message: "Service removed successfully" });
  } catch (error) {
    console.error("Error in deleteService:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Cleanup function to suspend services with deleted/inactive providers
const cleanupOrphanedServices = async () => {
  try {
    const services = await Service.find().populate("providerId");
    const orphanedServices = services.filter(
      (service) => !service.providerId || service.providerId.isActive === false,
    );

    if (orphanedServices.length > 0) {
      const orphanedIds = orphanedServices.map((service) => service._id);
      const result = await Service.updateMany(
        { _id: { $in: orphanedIds } },
        { serviceStatus: "suspended" },
      );
      console.log(
        `Cleanup: Suspended ${result.modifiedCount} services with inactive providers`,
      );
      return result.modifiedCount;
    }

    return 0;
  } catch (err) {
    console.error("Error cleaning up orphaned services:", err);
    return 0;
  }
};

module.exports = {
  createService,
  getAllServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  cleanupOrphanedServices,
};
