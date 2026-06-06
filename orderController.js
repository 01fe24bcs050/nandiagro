const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendCancellationEmail } = require('../utils/emailService.js');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Validate User
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication Failed',
        details: 'No user found in request. Invalid or expired token.',
      });
    }

    // Destructure order data
    const {
      items,
      shippingAddress,
      phone,
      itemsPrice,
      shippingPrice,
      taxPrice,
    } = req.body;

    // Validate Order Items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: 'Order Validation Error',
        details: 'Order must contain at least one item',
      });
    }

    // Validate Product Availability
    const productChecks = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);

        if (!product) {
          return {
            valid: false,
            message: `Product ${item.product} not found`,
          };
        }

        if (product.quantity < item.quantity) {
          return {
            valid: false,
            message: `Insufficient stock for product ${product.name}`,
          };
        }

        return {
          valid: true,
          product,
          name: product.name,
          imageURL: product.imageURL,
        };
      })
    );

    // Check for invalid products
    const invalidProducts = productChecks.filter(
      (check) => !check.valid
    );

    if (invalidProducts.length > 0) {
      return res.status(400).json({
        message: 'Stock Availability Error',
        details: invalidProducts.map((p) => p.message),
      });
    }

    // Prepare order items with additional details
    const orderItems = items.map((item, index) => ({
      product: item.product,
      name: productChecks[index].name,
      quantity: item.quantity,
      price: item.price,
      imageURL: productChecks[index].imageURL,
    }));

    const calculatedItemsPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderItemsPrice = Number(itemsPrice ?? calculatedItemsPrice);
    const orderTaxPrice = Number(taxPrice || 0);
    const orderShippingPrice = Number(shippingPrice || 0);

    // Create Order
    const order = await Order.create({
      user: req.user._id,

      orderItems,

      shippingAddress: {
        address: shippingAddress.split(',')[0]?.trim(),
        city: shippingAddress.split(',')[1]?.trim(),
        postalCode: shippingAddress.split('-')[1]?.trim(),
        country: 'India',
      },

      phone,

      itemsPrice: orderItemsPrice,
      taxPrice: orderTaxPrice,
      shippingPrice: orderShippingPrice,

      totalPrice: orderItemsPrice + orderTaxPrice + orderShippingPrice,

      status: 'Pending',
    });

    // Update Product Quantities
    await Promise.all(
      items.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.quantity },
        });
      })
    );

    res.status(201).json(order);

  } catch (error) {
    console.error('Detailed Order Creation Error:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
    });

    res.status(500).json({
      message: 'Order Creation Failed',
      details: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      // Check if user owns the order or is admin
      if (
        order.user._id.toString() === req.user._id.toString() ||
        req.user.role === 'admin'
      ) {
        res.json(order);
      } else {
        res.status(403).json({
          message: 'Not authorized',
        });
      }
    } else {
      res.status(404).json({
        message: 'Order not found',
      });
    }

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({
        createdAt: -1,
      });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();

      order.paymentResult = {
        id: req.body.id,
        status: req.body.status || 'COMPLETED',
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();

      res.json(updatedOrder);

    } else {
      res.status(404).json({
        message: 'Order not found',
      });
    }

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Allowed status values
    const validStatuses = [
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ];

    // Validate status
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    // Update order status
    order.status = req.body.status;

    // If delivered
    if (req.body.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // If cancelled
    if (req.body.status === 'Cancelled') {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    // Save updated order
    const updatedOrder = await order.save();

    res.json(updatedOrder);

  } catch (error) {
    console.error('Update order status error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Cancel order (only when Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to cancel this order',
      });
    }

    // Only allow cancellation if status is "Pending"
    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`,
      });
    }

    // Update order to cancelled
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.refundAmount = order.totalPrice;
    order.refunded = true;

    // Restore product quantities
    await Promise.all(
      order.orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      })
    );

    const cancelledOrder = await order.save();

    // Get user email for notification
    const user = await require('../models/User').findById(order.user);
    if (user && user.email) {
      await sendCancellationEmail(user.email, {
        orderId: order._id,
        refundAmount: order.totalPrice,
        items: order.orderItems,
      });
    }

    res.json({
      message: 'Order cancelled successfully. Refund will be processed.',
      order: cancelledOrder,
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
};
