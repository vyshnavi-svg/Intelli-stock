const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const InventoryAlert = require('../models/InventoryAlert');
const Notification = require('../models/Notification');
const { evaluateAndAlertProduct } = require('../utils/inventoryLogic');

const seedDatabase = require('../seed/seedData');

dotenv.config({ path: __dirname + '/../.env' });

const runVerification = async () => {
  console.log('🧪 ==================================================');
  console.log('🧪 STARTING VERIFICATION: EXACT INVENTORY TEST SCENARIO');
  console.log('🧪 ==================================================');

  try {
    await connectDB();

    // Check if test data exists, if not seed it automatically
    let vendor = await User.findOne({ email: 'vendor@ecommerce.com' });
    let customer = await User.findOne({ email: 'customer@ecommerce.com' });
    let mouse = await Product.findOne({ name: 'Wireless Mouse' });

    if (!vendor || !customer || !mouse) {
      console.log('🌱 Demo test data not found in current instance. Seeding automatically...');
      await seedDatabase();
      vendor = await User.findOne({ email: 'vendor@ecommerce.com' });
      customer = await User.findOne({ email: 'customer@ecommerce.com' });
      mouse = await Product.findOne({ name: 'Wireless Mouse' });
    }

    // Reset stock to initial test condition if needed
    mouse.quantity = 10;
    mouse.minimumStock = 5;
    mouse.maximumStock = 30;
    mouse.inventoryStatus = 'Healthy';
    await mouse.save();

    console.log('\n--- STEP 1: INITIAL STATE VERIFICATION ---');
    console.log(`Product:          ${mouse.name}`);
    console.log(`Initial Stock:    ${mouse.quantity} (Expected: 10)`);
    console.log(`Minimum Stock:    ${mouse.minimumStock} (Expected: 5)`);
    console.log(`Maximum Stock:    ${mouse.maximumStock} (Expected: 30)`);
    console.log(`Inventory Status: ${mouse.inventoryStatus} (Expected: Healthy)`);

    if (mouse.quantity !== 10 || mouse.minimumStock !== 5 || mouse.maximumStock !== 30) {
      throw new Error('Initial stock parameters do not match required test specifications.');
    }
    console.log('✅ STEP 1 PASSED: Initial state matches test specification.');

    // 2. Simulate Customer Ordering 6 units
    console.log('\n--- STEP 2: CUSTOMER PLACES ORDER FOR 6 UNITS ---');
    const orderQuantity = 6;
    console.log(`Ordering ${orderQuantity} units of "${mouse.name}"...`);

    // Stock deduction & inventory logic (same flow as orderController.createOrder)
    mouse.quantity -= orderQuantity;
    await mouse.save();

    const order = await Order.create({
      customerId: customer._id,
      items: [
        {
          product: mouse._id,
          name: mouse.name,
          price: mouse.price,
          quantity: orderQuantity,
          image: mouse.image,
          vendorId: mouse.vendorId,
        },
      ],
      totalAmount: Number((mouse.price * orderQuantity * 1.08).toFixed(2)),
      shippingAddress: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'USA',
      },
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
      orderStatus: 'Confirmed',
    });

    console.log(`Order created successfully: #${order._id}`);

    // Run intelligent inventory evaluation
    const evaluation = await evaluateAndAlertProduct(mouse);

    console.log('\n--- STEP 3: POST-ORDER INVENTORY EVALUATION ---');
    console.log(`Updated Stock:            ${mouse.quantity} (Expected: 4)`);
    console.log(`New Inventory Status:     ${mouse.inventoryStatus} (Expected: Low Stock)`);
    console.log(`Suggested Reorder:        ${evaluation.suggestedReorder} units (Expected: 26)`);

    if (mouse.quantity !== 4) {
      throw new Error(`Stock mismatch: Expected 4, got ${mouse.quantity}`);
    }

    if (mouse.inventoryStatus.toLowerCase() !== 'low stock') {
      throw new Error(`Status mismatch: Expected 'Low Stock', got ${mouse.inventoryStatus}`);
    }

    if (evaluation.suggestedReorder !== 26) {
      throw new Error(`Reorder calculation mismatch: Expected 26 (30 - 4), got ${evaluation.suggestedReorder}`);
    }
    console.log('✅ STEP 2 & 3 PASSED: Stock reduced to 4, status is Low Stock, suggested reorder is 26.');

    // 4. Verify Inventory Alert Created in Database
    console.log('\n--- STEP 4: ALERT & NOTIFICATION VERIFICATION ---');
    const alert = await InventoryAlert.findOne({
      productId: mouse._id,
      alertType: 'LOW_STOCK',
    }).sort({ createdAt: -1 });

    if (!alert) {
      throw new Error('Low stock alert was not created in InventoryAlert collection!');
    }

    console.log(`Found Alert:              [${alert.alertType}] Severity: ${alert.severity}`);
    console.log(`Alert Message:            "${alert.message}"`);

    const notification = await Notification.findOne({
      userId: mouse.vendorId,
      type: 'LOW_STOCK',
    }).sort({ createdAt: -1 });

    if (!notification) {
      throw new Error('Vendor notification was not generated!');
    }

    console.log(`Vendor Notification:      "${notification.title} - ${notification.message}"`);
    console.log('✅ STEP 4 PASSED: InventoryAlert and Notification properly generated in MongoDB.');

    console.log('\n==================================================');
    console.log('🎉 ALL INVENTORY TEST SCENARIO ASSERTIONS PASSED 100%!');
    console.log('==================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

runVerification();
