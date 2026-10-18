const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const auth = require('../middleware/auth');


router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;


    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required.'
      });
    }

    if (!phone || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number.'
      });
    }

   
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before placing an order.'
      });
    }


    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const dishId = item.dishId || item._id || item.id;
      const quantity = parseInt(item.quantity, 10);

      if (!dishId || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item quantity or missing dish ID in order payload.'
        });
      }

      const dish = await Dish.findById(dishId);
      if (!dish) {
        return res.status(404).json({
          success: false,
          message: `Dish with ID ${dishId} was not found in our menu.`
        });
      }

      if (!dish.available) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${dish.name}" is currently unavailable.`
        });
      }

      const itemTotal = dish.price * quantity;
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: quantity
      });
    }

   
    const deliveryFee = calculatedSubtotal >= 500 ? 0 : 40; // Free delivery above ₹500, else ₹40
    const calculatedTotal = calculatedSubtotal + deliveryFee;

    const newOrder = new Order({
      userId: req.user._id,
      items: verifiedOrderItems,
      deliveryAddress: deliveryAddress.trim(),
      phone: cleanPhone,
      subtotal: calculatedSubtotal,
      deliveryFee: deliveryFee,
      total: calculatedTotal,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Pay with Cash on Delivery.',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing your order.'
    });
  }
});


router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.dishId', 'image category');

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Fetch my orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your orders.'
    });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.dishId', 'image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

   
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Fetch single order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid order ID format.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order details.'
    });
  }
});

module.exports = router;
