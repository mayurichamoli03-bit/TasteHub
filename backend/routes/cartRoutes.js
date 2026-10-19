const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Dish = require('../models/Dish');
const auth = require('../middleware/auth');

// GET user cart with populated dish details
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.dishId');

    if (!cart) {
      return res.json({
        success: true,
        items: []
      });
    }

    // Filter out any dishes that were removed or unavailable
    const validItems = cart.items
      .filter(item => item.dishId != null)
      .map(item => ({
        _id: item.dishId._id,
        dishId: item.dishId._id,
        name: item.dishId.name,
        price: item.dishId.price,
        image: item.dishId.image,
        category: item.dishId.category,
        available: item.dishId.available,
        quantity: item.quantity
      }));

    return res.json({
      success: true,
      items: validItems
    });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart.'
    });
  }
});

// POST / PUT: Sync full cart for user
router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart payload. Array of items expected.'
      });
    }

    // Validate and clean items
    const cleanItems = [];
    for (const item of items) {
      const dishId = item.dishId || item._id || item.id;
      const quantity = parseInt(item.quantity, 10);
      if (dishId && !isNaN(quantity) && quantity > 0) {
        cleanItems.push({ dishId, quantity });
      }
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, items: cleanItems, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: 'Cart saved successfully.',
      count: cleanItems.length
    });
  } catch (error) {
    console.error('Save cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving cart.'
    });
  }
});

// DELETE: Clear user cart
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return res.json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing cart.'
    });
  }
});

module.exports = router;
