const Service = require('../models/service');
const User = require('../models/user');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

/**
 * @desc    Create a new service
 */
const createService = async (req, res) => {
  try {
    const provider = await User.findById(req.user._id); // Uses req.user._id
    
    // If user is not yet a provider, set default provider settings
    if (!provider.isProvider || !provider.providerSettingsCompleted) {
        // Set default provider settings for first-time providers
        provider.providerSettings = {
            activeHours: {
                start: '09:00',
                end: '18:00'
            },
            timezone: 'UTC'
        };
        provider.providerSettingsCompleted = true;
        await provider.save();
    }

    const { serviceName, originalPrice, maxUsers } = req.body;

    if (!serviceName || !originalPrice || !maxUsers) {
      return res.status(400).json({ message: 'Service Name, Original Price, and Max Users are required.' });
    }

    const service = new Service({
      ...req.body,
      providerId: req.user._id, // Uses req.user._id
    });
    await service.save();

    if (!provider.isProvider) {
        provider.isProvider = true;
        await provider.save();
    }

    res.status(201).json(service);

  } catch (err) {
    res.status(400).json({ message: 'Failed to create service.', error: err.message });
  }
};

/**
 * @desc    Get all active and available services
 */
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ serviceStatus: 'active', availableSlots: { $gt: 0 } })
                                  .populate('providerId', 'username name rating providerSettings')
                                  .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services.', error: err.message });
  }
};


/**
 * @desc    Get services created by the logged-in user (as a provider)
 */
const getMyServices = async (req, res) => {
    try {
        if (!req.user || !req.user._id) { // Uses req.user._id
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }

        const userId = req.user._id;

        const services = await Service.find({ providerId: userId })
                                    .populate('categoryId')
                                    .select('-credentials');
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services offered by user:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch your services.', error: error.message });
    }
};

/**
 * @desc    Get a single service by its ID
 */
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'username name rating providerSettings');
    if (!service) {
        return res.status(404).json({ message: 'Service not found.' });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch service.', error: err.message });
  }
};

/**
 * @desc    Update a service owned by the user
 */
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        if (service.providerId.toString() !== req.user._id) { // Uses req.user._id
            return res.status(403).json({ message: 'You are not authorized to update this service.' });
        }
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updatedService);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update service.', error: err.message });
    }
};

/**
 * @desc    Delete a service owned by the user
 */
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.providerId.toString() !== req.user._id) { // Uses req.user._id
            return res.status(403).json({ message: 'User not authorized to delete this service' });
        }

        await service.deleteOne();

        res.status(200).json({ message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


module.exports = {
    createService,
    getAllServices,
    getMyServices,
    getServiceById,
    updateService,
    deleteService
};