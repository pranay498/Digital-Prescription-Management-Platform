const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://rxuser:rxpass@localhost:27017/rxmanager?authSource=admin';
    const conn = await mongoose.connect(connUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failure: ' + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
