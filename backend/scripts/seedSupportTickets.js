const mongoose = require('mongoose');
const SupportTicket = require('../models/supportTicket.js');

async function seedSupportTickets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const tickets = require('./supportTickets_seed_data.json');

    await SupportTicket.deleteMany({});
    const inserted = await SupportTicket.insertMany(tickets);
    console.log(`✅ Inserted ${inserted.length} support tickets`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding support tickets:", err);
    mongoose.disconnect();
  }
}

seedSupportTickets(); 