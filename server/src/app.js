const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173' ||"https://digital-heal.netlify.app",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescriptions');

app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;
