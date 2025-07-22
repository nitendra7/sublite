const Service = require('../models/service');
const User = require('../models/user');

/**
 * @desc    Create a new service
 */
exports.createService = async (req, res) => {
  try {
    const provider = await User.findById(req.user.id);
    if (!provider.providerSettingsCompleted) {
        return res.status(403).json({ message: 'Please complete your provider settings (Active Hours and Timezone) before creating a service.' });
    }

    const { serviceName, rentalPrice, rentalDuration, accessInstructionsTemplate } = req.body;

    if (!serviceName || !rentalPrice || !rentalDuration || !accessInstructionsTemplate) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const service = new Service({
      ...req.body,
      providerId: req.user.id,
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
exports.getAllServices = async (req, res) => {
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
 * @desc    Get services created by the logged-in user
 */
exports.getMyServices = async (req, res) => { // Changed from const to exports.getMyServices
    try {
        const services = await Service.find({ providerId: req.user.id });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch your services.', error: error.message });
    }
};

/**
 * @desc    Get a single service by its ID
 */
exports.getServiceById = async (req, res) => {
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
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        if (service.providerId.toString() !== req.user.id) {
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
exports.deleteService = async (req, res) => { // ADDED THIS ENTIRE FUNCTION
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Authorization Check
        if (service.providerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this service' });
        }
        
        await service.deleteOne();

        res.status(200).json({ message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};