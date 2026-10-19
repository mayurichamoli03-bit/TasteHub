const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Dish description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Indian',
      'Pizza',
      'Burgers',
      'Chinese',
      'South Indian',
      'Desserts',
      'Beverages',
      'Healthy Food',
      'Biryani',
      'Snacks'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Dish', dishSchema);
