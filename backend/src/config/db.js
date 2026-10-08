import mongoose from 'mongoose';

/**
 * Masks credentials in MongoDB URI for safe console logging
 */
const maskMongoURI = (uri) => {
  if (!uri) return '';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'mongodb://****:****@...';
  }
};

/**
 * Connect to MongoDB Atlas
 * Non-blocking: returns true if connected, false if URI missing or connection fails
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('ℹ️  [MongoDB] MONGODB_URI is not configured in backend/.env.');
    console.log('📦 [Storage] Running on local JSON storage (backend/data/db.json).');
    return false;
  }

  try {
    const masked = maskMongoURI(uri);
    console.log(`⏳ [MongoDB] Connecting to MongoDB Atlas (${masked})...`);

    const conn = await mongoose.connect(uri, {
      dbName: 'campuscare',
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s if Atlas is unreachable
      connectTimeoutMS: 10000
    });

    console.log(`✅ [MongoDB] MongoDB connected successfully to database: "${conn.connection.name || 'campuscare'}"`);
    console.log(`🌐 [MongoDB] Host: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`❌ [MongoDB] Connection error: ${err.message}`);
    console.log('⚠️  [MongoDB] Please check your MONGODB_URI credentials and IP Whitelist in MongoDB Atlas.');
    console.log('📦 [Storage] Continuing with local storage (backend/data/db.json).');
    return false;
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [MongoDB] Connection lost / disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 [MongoDB] Reconnected to MongoDB Atlas.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ [MongoDB] Runtime connection error: ${err.message}`);
});

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
