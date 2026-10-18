const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');


router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { available: true };

 
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

  
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
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
    if (error.kind === 'ObjectId') {
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

module.exports = router;
