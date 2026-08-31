const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: MONGODB_URI environment variable is missing in production. Cannot start database connection.');
      }
      console.log('No MONGODB_URI provided. Starting in-memory fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`Using In-Memory MongoDB: ${mongoUri}`);
    } else {
      console.log('Connecting to MongoDB Atlas...');
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then(async (m) => {
      console.log('Connected to MongoDB');
      try {
        const User = require('../models/User');
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('Seeding demo database from seed.js...');
          const { seedDemo } = require('../seed');
          await seedDemo();
        }
      } catch (seedErr) {
        console.error('Auto-seed check error:', seedErr);
      }
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
