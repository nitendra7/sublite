const mongoose = require('mongoose');
const User = require('../models/user.js');

async function seedUsers() {
  try {
    await mongoose.connect('mongodb+srv://CipherCrew:ciphercrew@sublite.4cjuy3h.mongodb.net/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const users = require('./users_seed_data.json'); // Place this file in /scripts/

    await User.deleteMany({});
    const inserted = await User.insertMany(users);
    console.log(`✅ Inserted ${inserted.length} users`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    mongoose.disconnect();
  }
}

seedUsers();