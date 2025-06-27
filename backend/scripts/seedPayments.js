const mongoose = require('mongoose');
const Payment = require('../models/payment.js');

async function seedPayments() {
  try {
    await mongoose.connect('mongodb+srv://CipherCrew:ciphercrew@sublite.4cjuy3h.mongodb.net/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const payments = require('./payments_seed_data.json');

    await Payment.deleteMany({});
    const inserted = await Payment.insertMany(payments);
    console.log(`✅ Inserted ${inserted.length} payments`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding payments:", err);
    mongoose.disconnect();
  }
}

seedPayments(); 