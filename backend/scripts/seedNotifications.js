const mongoose = require('mongoose');
const Notification = require('../models/notification.js');

async function seedNotifications() {
  try {
    await mongoose.connect('mongodb+srv://CipherCrew:ciphercrew@sublite.4cjuy3h.mongodb.net/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const notifications = require('./notifications_seed_data.json');

    await Notification.deleteMany({});
    const inserted = await Notification.insertMany(notifications);
    console.log(`✅ Inserted ${inserted.length} notifications`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding notifications:", err);
    mongoose.disconnect();
  }
}

seedNotifications(); 