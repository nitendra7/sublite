const mongoose = require('mongoose');
const Setting = require('../models/setting.js');

async function seedSettings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const settings = require('./settings_seed_data.json');

    await Setting.deleteMany({});
    const inserted = await Setting.insertMany(settings);
    console.log(`✅ Inserted ${inserted.length} settings`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding settings:", err);
    mongoose.disconnect();
  }
}

seedSettings(); 