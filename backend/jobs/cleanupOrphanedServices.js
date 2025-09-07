const cron = require("node-cron");
const Service = require("../models/service");

/**
 * Cleanup job to remove orphaned services (services with deleted providers)
 * Runs every day at 2:00 AM
 */

const cleanupOrphanedServices = async () => {
  try {
    console.log("🧹 Starting orphaned services cleanup...");

    // Find all services and populate provider info including isActive status
    const services = await Service.find().populate("providerId");

    // Filter services where provider doesn't exist or is soft deleted
    const orphanedServices = services.filter(
      (service) => !service.providerId || service.providerId.isActive === false,
    );

    if (orphanedServices.length === 0) {
      console.log("✅ No orphaned services found");
      return { cleaned: 0 };
    }

    // Get IDs of orphaned services
    const orphanedIds = orphanedServices.map((service) => service._id);

    // DELETE orphaned services instead of suspending them
    const result = await Service.deleteMany({ _id: { $in: orphanedIds } });

    console.log(
      `🗑️  Deleted ${result.deletedCount} orphaned services with inactive/deleted providers`,
    );
    console.log(
      "📋 Orphaned services deleted:",
      orphanedServices.map((s) => ({
        id: s._id,
        name: s.serviceName,
        type: s.serviceType,
        createdAt: s.createdAt,
        providerActive: s.providerId?.isActive || false,
      })),
    );

    return { cleaned: result.deletedCount, services: orphanedServices };
  } catch (error) {
    console.error("❌ Error during orphaned services cleanup:", error);
    return { error: error.message, cleaned: 0 };
  }
};

/**
 * Manual cleanup function that can be called directly
 */
const runCleanupNow = async () => {
  console.log("🚀 Running manual orphaned services cleanup...");
  return await cleanupOrphanedServices();
};

/**
 * Start the scheduled cleanup job
 */
const startCleanupScheduler = () => {
  // Run cleanup every day at 2:00 AM
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log(
        "⏰ Scheduled cleanup job started at:",
        new Date().toISOString(),
      );
      await cleanupOrphanedServices();
    },
    {
      timezone: "UTC",
    },
  );

  console.log(
    "📅 Orphaned services cleanup scheduler started (daily at 2:00 AM UTC)",
  );
};

/**
 * One-time cleanup on server start
 */
const runStartupCleanup = async () => {
  console.log(
    "🔄 Running startup cleanup for services with inactive providers...",
  );
  await cleanupOrphanedServices();
};

module.exports = {
  cleanupOrphanedServices,
  runCleanupNow,
  startCleanupScheduler,
  runStartupCleanup,
};
