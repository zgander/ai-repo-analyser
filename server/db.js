import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('MONGO_URI is not defined in .env. MongoDB caching will be disabled.');
      return false;
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB successfully connected.');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}
