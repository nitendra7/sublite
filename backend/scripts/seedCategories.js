const mongoose = require('mongoose');
const Category = require('../models/category.js');

async function seedCategories() {
  try {
    await mongoose.connect('mongodb+srv://CipherCrew:ciphercrew@sublite.4cjuy3h.mongodb.net/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const categories = require('./category_seed_data.json');

    await Category.deleteMany({});
    const inserted = await Category.insertMany(categories);
    console.log(`✅ Inserted ${inserted.length} categories`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    mongoose.disconnect();
  }
}

seedCategories();