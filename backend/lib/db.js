const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Enhanced connection options for production with better performance and stability
    const options = {
      maxPoolSize: 15, // Increased for better concurrency handling
      minPoolSize: 5, // Maintain minimum connections
      serverSelectionTimeoutMS: 10000, // Increased timeout for server selection
      socketTimeoutMS: 60000, // Increased socket timeout for long operations
      maxIdleTimeMS: 60000, // Increased idle time for connection reuse
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Write concern for better data consistency
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;