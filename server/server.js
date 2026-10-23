const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Intelligent Inventory and E-Commerce System API is active',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const Product = require('./models/Product');
const seedDatabase = require('./seed/seedData');

// Connect to MongoDB and start Express server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial demo catalog and accounts...');
      await seedDatabase();
    }

    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`==================================================`);
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
        console.log(`==================================================`);
      });
      return server;
    }
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
