import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('URI:', process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
  console.log('No URI found');
  process.exit(1);
}

const testConn = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Success! Connected to MongoDB Atlas');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

testConn();
