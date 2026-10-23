const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const InventoryAlert = require('../models/InventoryAlert');
const { evaluateAndAlertProduct } = require('../utils/inventoryLogic');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Purging existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Notification.deleteMany({}),
      InventoryAlert.deleteMany({}),
    ]);

    console.log('👤 Creating demo users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: {
        street: '100 Admin Plaza',
        city: 'Silicon Valley',
        state: 'CA',
        postalCode: '94025',
        country: 'USA',
      },
    });

    const vendor = await User.create({
      name: 'Apex Electronics (Vendor)',
      email: 'vendor@ecommerce.com',
      password: 'vendor123',
      role: 'vendor',
      phone: '+1 (555) 234-5678',
      address: {
        street: '450 Tech Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
      },
    });

    const customer = await User.create({
      name: 'Jane Customer',
      email: 'customer@ecommerce.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1 (555) 987-6543',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'USA',
      },
    });

    console.log('📂 Creating product categories...');
    const categories = await Category.insertMany([
      {
        name: 'Computers & Accessories',
        description: 'Laptops, desktop peripherals, mice, keyboards, and tech accessories',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
      },
      {
        name: 'Audio & Wearables',
        description: 'Headphones, smartwatches, speakers, and wireless audio gear',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
      {
        name: 'Electronics & Displays',
        description: 'Monitors, smart screens, televisions, and visual components',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
      },
      {
        name: 'Office & Workspace',
        description: 'Ergonomic lighting, standing desk gear, and work-from-home essentials',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
      },
    ]);

    const compCat = categories[0]._id;
    const audioCat = categories[1]._id;
    const elecCat = categories[2]._id;
    const officeCat = categories[3]._id;

    console.log('📦 Seeding products (including required Wireless Mouse test subject)...');
    const productsData = [
      // 1. REQUIRED TEST PRODUCT: Wireless Mouse (Stock: 10, Min: 5, Max: 30)
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic 2.4GHz wireless optical mouse with whisper-quiet clicks, adjustable DPI (800-1600), and ultra-long battery life.',
        price: 29.99,
        category: compCat,
        vendorId: vendor._id,
        quantity: 10,
        minimumStock: 5,
        maximumStock: 30,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
        status: 'active',
        averageRating: 4.8,
        numReviews: 2,
      },
      // 2. Pro Mechanical Keyboard (Healthy)
      {
        name: 'RGB Mechanical Gaming Keyboard',
        description: 'Hot-swappable tactile mechanical keyboard with per-key RGB backlighting, durable aluminum chassis, and detachable braided cable.',
        price: 89.99,
        category: compCat,
        vendorId: vendor._id,
        quantity: 24,
        minimumStock: 8,
        maximumStock: 50,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        status: 'active',
        averageRating: 4.9,
        numReviews: 5,
      },
      // 3. Noise-Cancelling Headphones (Low Stock initially)
      {
        name: 'Wireless ANC Headphones',
        description: 'Premium active noise-cancelling over-ear headphones with 40-hour battery life, high-res audio drivers, and voice assistant support.',
        price: 199.99,
        category: audioCat,
        vendorId: vendor._id,
        quantity: 3,
        minimumStock: 6,
        maximumStock: 25,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        status: 'active',
        averageRating: 4.7,
        numReviews: 4,
      },
      // 4. Smart Fitness Watch (Out of Stock initially)
      {
        name: 'Pro Fitness Smartwatch',
        description: 'Waterproof smartwatch with continuous heart rate tracking, SpO2 sensor, sleep analysis, and built-in GPS for workouts.',
        price: 129.99,
        category: audioCat,
        vendorId: vendor._id,
        quantity: 0,
        minimumStock: 5,
        maximumStock: 30,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        status: 'active',
        averageRating: 4.5,
        numReviews: 3,
      },
      // 5. USB-C Multi-Port Hub (Overstocked initially)
      {
        name: '8-in-1 USB-C Hub Adapter',
        description: 'Compact aluminum USB-C hub with 4K HDMI, 100W Power Delivery pass-through, SD card reader, and Gigabit Ethernet.',
        price: 45.00,
        category: compCat,
        vendorId: vendor._id,
        quantity: 65,
        minimumStock: 10,
        maximumStock: 40,
        image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',
        status: 'active',
        averageRating: 4.6,
        numReviews: 2,
      },
      // 6. Ultra HD 4K IPS Monitor (Healthy)
      {
        name: '27-inch 4K IPS Monitor',
        description: 'Factory color-calibrated 4K UHD display with 99% sRGB coverage, HDR10, ultra-slim bezels, and height-adjustable stand.',
        price: 349.99,
        category: elecCat,
        vendorId: vendor._id,
        quantity: 16,
        minimumStock: 4,
        maximumStock: 25,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
        status: 'active',
        averageRating: 5.0,
        numReviews: 1,
      },
      // 7. Ergonomic LED Desk Lamp (Healthy)
      {
        name: 'Dimmable Smart Desk Lamp',
        description: 'Modern architect lamp with touch control, customizable color temperatures (2700K-6500K), auto-dimming sensor, and USB charging port.',
        price: 49.99,
        category: officeCat,
        vendorId: vendor._id,
        quantity: 18,
        minimumStock: 5,
        maximumStock: 35,
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
        status: 'active',
        averageRating: 4.4,
        numReviews: 2,
      },
    ];

    const products = await Product.insertMany(productsData);

    console.log('🧠 Evaluating intelligent inventory logic for all products...');
    for (const prod of products) {
      await evaluateAndAlertProduct(prod);
    }

    console.log('⭐ Creating sample reviews...');
    await Review.insertMany([
      {
        productId: products[0]._id, // Wireless Mouse
        customerId: customer._id,
        rating: 5,
        comment: 'Super ergonomic and responsive! Great value for everyday productivity.',
      },
      {
        productId: products[1]._id, // Keyboard
        customerId: customer._id,
        rating: 5,
        comment: 'The mechanical switches feel incredible. RGB lighting looks amazing on my desk.',
      },
    ]);

    console.log('🛍️ Creating sample customer order...');
    await Order.create({
      customerId: customer._id,
      items: [
        {
          product: products[1]._id,
          name: products[1].name,
          price: products[1].price,
          quantity: 1,
          vendorId: vendor._id,
          image: products[1].image,
        },
      ],
      totalAmount: 97.19,
      shippingAddress: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'USA',
      },
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
      orderStatus: 'Shipped',
    });

    console.log('==================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials:');
    console.log('  👑 Admin:    admin@ecommerce.com    / admin123');
    console.log('  🏪 Vendor:   vendor@ecommerce.com   / vendor123');
    console.log('  🛒 Customer: customer@ecommerce.com / customer123');
    console.log('==================================================');
    console.log('Initial Test Subject (Wireless Mouse):');
    console.log(`  Stock: 10 | Min: 5 | Max: 30 | Status: Healthy`);
    console.log('==================================================');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
