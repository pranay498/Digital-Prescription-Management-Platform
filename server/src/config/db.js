const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://rxuser:rxpass@localhost:27017/rxmanager?authSource=admin';
    const conn = await mongoose.connect(connUri);
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
