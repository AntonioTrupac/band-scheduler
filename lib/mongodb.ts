import mongoose from 'mongoose';

const connectMongo = async () => {
  if (mongoose.connection.readyState) return;
  console.log('Connecting to MongoDB');
  await mongoose.connect(process.env.MONGODB_URI!);
};

export default connectMongo;
