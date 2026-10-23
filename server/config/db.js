const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/intelligent_inventory_db';
  const useMemoryDB = process.env.USE_MEMORY_DB;

  if (useMemoryDB === 'true') {
    console.log('🔄 Initializing embedded in-memory MongoDB server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Embedded MongoDB connected: ${uri}`);
    return;
  }

  try {
    // Attempt connecting to configured MONGO_URI with short timeout for auto-fallback
    console.log(`🔄 Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ MongoDB connected successfully to ' + mongoose.connection.host);
  } catch (err) {
    if (useMemoryDB === 'auto' || !process.env.MONGO_URI) {
      console.warn(`⚠️ Could not reach local MongoDB (${err.message}).`);
      console.log('🔄 Launching automatic embedded MongoMemoryServer for seamless local development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();
        await mongoose.connect(uri);
        console.log(`✅ Embedded MongoDB running and connected: ${uri}`);
        return;
      } catch (memErr) {
        console.error('❌ Failed to start embedded MongoDB:', memErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ MongoDB Connection Error:', err.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
