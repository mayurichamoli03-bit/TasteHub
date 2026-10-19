const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { available: true };

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      const escapedCategory = escapeRegex(category.trim());
      filter.category = new RegExp(`^${escapedCategory}$`, 'i');
    }

    if (search && search.trim() !== '') {
      const escapedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const dishes = await Dish.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: dishes.length,
      dishes
    });
  } catch (error) {
    console.error('Fetch dishes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dishes.'
    });
  }
});

// GET all active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Dish.distinct('category', { available: true });
    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching categories.'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found.'
      });
    }

    return res.json({
      success: true,
      dish
    });
  } catch (error) {
    console.error('Fetch single dish error:', error);
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid dish ID format.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dish.'
    });
  }
});

// Admin: Add new dish
router.post('/', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'tastehub_default_secret_key';
    const decoded = jwt.verify(token, secret);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator privileges required.' });
    }

    const { name, description, category, price, image, available } = req.body;
    if (!name || !description || !category || price == null || !image) {
      return res.status(400).json({ success: false, message: 'Missing required dish fields.' });
    }

    const dish = new Dish({
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      image: image.trim(),
      available: available !== undefined ? Boolean(available) : true
    });

    const saved = await dish.save();
    return res.status(201).json({ success: true, message: 'Dish created successfully.', dish: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating dish.' });
  }
});

// Admin: Update dish
router.put('/:id', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'tastehub_default_secret_key';
    const decoded = jwt.verify(token, secret);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator privileges required.' });
    }

    const updated = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Dish not found.' });
    }

    return res.json({ success: true, message: 'Dish updated successfully.', dish: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating dish.' });
  }
});

module.exports = router;
