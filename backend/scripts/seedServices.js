const mongoose = require('mongoose');
const Service = require('../models/service.js');

async function seedServices() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const services = require('./services_seed_data.json');

    await Service.deleteMany({});
    const inserted = await Service.insertMany(services);
    console.log(`✅ Inserted ${inserted.length} services`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding services:", err);
    mongoose.disconnect();
  }
}

seedServices(); 