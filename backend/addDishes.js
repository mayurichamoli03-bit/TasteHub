
require('dotenv').config();
const mongoose = require('mongoose');
const Dish = require('./models/Dish');

const dishes = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza topped with cheese and tomato sauce.',
    category: 'Pizza',
    price: 249,
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Classic Cheese Burger',
    description: 'Juicy burger with cheese, lettuce and tomato.',
    category: 'Burgers',
    price: 179,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Veg Hakka Noodles',
    description: 'Chinese noodles tossed with fresh vegetables.',
    category: 'Chinese',
    price: 169,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Soft paneer in a creamy tomato gravy.',
    category: 'Indian',
    price: 249,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy dosa served with potato masala and chutney.',
    category: 'South Indian',
    price: 129,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Veg Biryani',
    description: 'Aromatic basmati rice cooked with vegetables and spices.',
    category: 'Biryani',
    price: 189,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'French Fries',
    description: 'Golden and crispy potato fries.',
    category: 'Snacks',
    price: 99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake topped with chocolate frosting.',
    category: 'Desserts',
    price: 149,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Fresh Fruit Salad',
    description: 'Fresh seasonal fruits served in a healthy bowl.',
    category: 'Healthy Food',
    price: 139,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    available: true
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled creamy coffee topped with froth.',
    category: 'Beverages',
    price: 119,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    available: true
  }
];

async function addDishes() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingNames = await Dish.find({
      name: { $in: dishes.map(dish => dish.name) }
    }).distinct('name');

    const newDishes = dishes.filter(
      dish => !existingNames.includes(dish.name)
    );

    if (newDishes.length === 0) {
      console.log('All these dishes already exist. No duplicates added.');
      return;
    }

    await Dish.insertMany(newDishes);
    console.log(`${newDishes.length} dishes added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addDishes();
