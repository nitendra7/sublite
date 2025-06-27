const mongoose = require('mongoose');
const Booking = require('../models/booking.js');

async function seedBookings() {
  try {
    await mongoose.connect('mongodb+srv://CipherCrew:ciphercrew@sublite.4cjuy3h.mongodb.net/sublite', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    const bookings = require('./bookings_seed_data.json');

    await Booking.deleteMany({});
    const inserted = await Booking.insertMany(bookings);
    console.log(`✅ Inserted ${inserted.length} bookings`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding bookings:", err);
    mongoose.disconnect();
  }
}

seedBookings(); 