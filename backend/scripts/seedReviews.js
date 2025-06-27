const mongoose = require('mongoose');
const Review = require('../models/review.js');

async function seedReviews() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const reviews = require('./reviews_seed_data.json');

    await Review.deleteMany({});
    const inserted = await Review.insertMany(reviews);
    console.log(`✅ Inserted ${inserted.length} reviews`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding reviews:", err);
    mongoose.disconnect();
  }
}

seedReviews(); 