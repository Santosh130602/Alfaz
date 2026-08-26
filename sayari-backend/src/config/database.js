'use strict';

const mongoose = require('mongoose');


const MONGO_OPTIONS = {
  maxPoolSize       : 20,
  minPoolSize       : 5,
  socketTimeoutMS   : 45000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites       : true,
  writeConcern      : { w: 'majority' },
};

let isConnected = false;

async function connectDB () {
  if (isConnected) return;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in environment');

    mongoose.set('strictQuery', true);
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    await mongoose.connect(uri, MONGO_OPTIONS);
    isConnected = true;

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — attempting reconnect...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed on app exit');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
