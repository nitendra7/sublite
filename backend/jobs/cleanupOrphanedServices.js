const cron = require("node-cron");
const Service = require("../models/service");
const logger = require("../utils/logger");

const cleanupOrphanedServices = async () => {
  try {
    logger.info("Starting orphaned services cleanup");

    const services = await Service.find().populate("providerId");

    const orphanedServices = services.filter(
      (service) => !service.providerId || service.providerId.isActive === false,
    );

    if (orphanedServices.length === 0) {
      logger.info("No orphaned services found");
      return { cleaned: 0 };
    }

    const orphanedIds = orphanedServices.map((service) => service._id);

    const result = await Service.deleteMany({ _id: { $in: orphanedIds } });

    logger.info(`Deleted ${result.deletedCount} orphaned services with inactive/deleted providers`);
    logger.info("Orphaned services deleted:", orphanedServices.map((s) => ({
      id: s._id,
      name: s.serviceName,
      type: s.serviceType,
      createdAt: s.createdAt,
      providerActive: s.providerId?.isActive || false,
    })));

    return { cleaned: result.deletedCount, services: orphanedServices };
  } catch (error) {
    logger.error("Error during orphaned services cleanup:", error);
    return { error: error.message, cleaned: 0 };
  }
};

const runCleanupNow = async () => {
  logger.info("Running manual orphaned services cleanup");
  return await cleanupOrphanedServices();
};

const startCleanupScheduler = () => {
  cron.schedule(
    "0 2 * * *",
    async () => {
      logger.info("Scheduled cleanup job started at:", new Date().toISOString());
      await cleanupOrphanedServices();
    },
    {
      timezone: "UTC",
    },
  );

  logger.info("Orphaned services cleanup scheduler started (daily at 2:00 AM UTC)");
};

const runStartupCleanup = async () => {
  logger.info("Running startup cleanup for services with inactive providers");
  await cleanupOrphanedServices();
};

module.exports = {
  cleanupOrphanedServices,
  runCleanupNow,
  startCleanupScheduler,
  runStartupCleanup,
};
