const InventoryAlert = require('../models/InventoryAlert');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

/**
 * Pure evaluation function for inventory status and reorder calculations
 */
const evaluateStock = (currentStock, minStock, maxStock, productName = 'Product') => {
  const stock = Number(currentStock);
  const min = Number(minStock);
  const max = Number(maxStock);

  let status = 'Healthy';
  let alertType = null;
  let severity = 'LOW';
  let message = '';
  const suggestedReorder = Math.max(0, max - stock);

  if (stock === 0) {
    status = 'Out of Stock';
    alertType = 'OUT_OF_STOCK';
    severity = 'HIGH';
    message = `Critical: "${productName}" is completely Out of Stock (0 units remaining). Suggested reorder: ${suggestedReorder} units.`;
  } else if (stock <= min) {
    status = 'Low Stock';
    alertType = 'LOW_STOCK';
    severity = stock <= Math.max(1, Math.floor(min / 2)) ? 'HIGH' : 'MEDIUM';
    message = `Warning: "${productName}" is Low Stock (${stock} units left, minimum threshold is ${min}). Suggested reorder: ${suggestedReorder} units.`;
  } else if (stock > max) {
    status = 'Overstock';
    alertType = 'OVERSTOCK';
    severity = 'LOW';
    message = `Notice: "${productName}" is Overstocked (${stock} units in stock, maximum capacity is ${max}). Consider promotional discount.`;
  } else {
    status = 'Healthy';
    alertType = null;
    severity = 'LOW';
    message = `Product "${productName}" inventory level is Healthy (${stock} units).`;
  }

  return {
    status,
    alertType,
    severity,
    message,
    suggestedReorder,
  };
};

/**
 * Evaluates a product in DB, updates its inventoryStatus, and generates alerts/notifications
 */
const evaluateAndAlertProduct = async (productOrId) => {
  let product;
  if (typeof productOrId === 'string' || productOrId instanceof require('mongoose').Types.ObjectId) {
    product = await Product.findById(productOrId);
  } else {
    product = productOrId;
  }

  if (!product) return null;

  const evaluation = evaluateStock(
    product.quantity,
    product.minimumStock,
    product.maximumStock,
    product.name
  );

  // Update product inventory status if changed
  if (product.inventoryStatus !== evaluation.status) {
    product.inventoryStatus = evaluation.status;
    await Product.findByIdAndUpdate(product._id, { inventoryStatus: evaluation.status });
  }

  // If an alert condition exists (Low Stock, Out of Stock, Overstock), generate an InventoryAlert and Notification
  if (evaluation.alertType) {
    // Avoid duplicate unread alert for the same product and alert type within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingAlert = await InventoryAlert.findOne({
      productId: product._id,
      alertType: evaluation.alertType,
      createdAt: { $gte: oneHourAgo },
    });

    if (!existingAlert) {
      await InventoryAlert.create({
        productId: product._id,
        vendorId: product.vendorId,
        alertType: evaluation.alertType,
        message: evaluation.message,
        severity: evaluation.severity,
        isRead: false,
      });

      await Notification.create({
        userId: product.vendorId,
        title: `Inventory Alert: ${evaluation.status}`,
        message: evaluation.message,
        type: evaluation.alertType,
        isRead: false,
      });
    }
  }

  return {
    product,
    ...evaluation,
  };
};

module.exports = {
  evaluateStock,
  evaluateAndAlertProduct,
};
