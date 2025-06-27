const mongoose = require('mongoose');
const WalletTransaction = require('../models/walletTransaction.js');

async function seedWalletTransactions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const transactions = require('./walletTransactions_seed_data.json');

    await WalletTransaction.deleteMany({});
    const inserted = await WalletTransaction.insertMany(transactions);
    console.log(`✅ Inserted ${inserted.length} wallet transactions`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding wallet transactions:", err);
    mongoose.disconnect();
  }
}

seedWalletTransactions(); 