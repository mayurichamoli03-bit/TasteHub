const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dish = require('./models/Dish');

// Load environment variables
dotenv.config();

const sampleDishes = [
  // --- Indian ---
  {
    name: 'Butter Chicken',
    description: 'Tender chicken simmered in a velvety, rich tomato, butter and cashew cream gravy.',
    category: 'Indian',
    price: 320,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Char-grilled cottage cheese cubes simmered in a spicy, aromatic onion-tomato masala.',
    category: 'Indian',
    price: 260,
    image: 'https://images.unsplash.com/photo-1567184109191-37764e7fadd9?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Dal Makhani & Naan',
    description: 'Slow-cooked black lentils in creamy butter, served with hot garlic butter naan.',
    category: 'Indian',
    price: 190,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Pizza ---
  {
    name: 'Margherita Supreme Pizza',
    description: 'Classic hand-tossed crust topped with San Marzano tomato sauce, fresh mozzarella, and basil.',
    category: 'Pizza',
    price: 280,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Farmhouse Veggie Pizza',
    description: 'Loaded with crunchy bell peppers, red onions, mushrooms, juicy tomatoes, and melted mozzarella.',
    category: 'Pizza',
    price: 320,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Spicy Peri-Peri Chicken Pizza',
    description: 'Zesty peri-peri marinated chicken chunks, sliced jalapeños, onions, and rich mozzarella.',
    category: 'Pizza',
    price: 380,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Burgers ---
  {
    name: 'Classic Crispy Veg Burger',
    description: 'Golden fried herb potato & peas patty, crisp lettuce, cheese slice, and tangy burger mayo.',
    category: 'Burgers',
    price: 140,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Double Cheese Smash Burger',
    description: 'Two grilled patties layered with double melted cheddar, caramelized onions, and pickles.',
    category: 'Burgers',
    price: 220,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Fiery Grilled Chicken Burger',
    description: 'Succulent chicken breast grilled in house chili sauce with fresh lettuce and garlic aioli.',
    category: 'Burgers',
    price: 240,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Chinese ---
  {
    name: 'Schezwan Hakka Noodles',
    description: 'Wok-tossed noodles with shredded bell peppers, cabbage, carrots, and fiery Schezwan sauce.',
    category: 'Chinese',
    price: 180,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Veg Manchurian Gravy',
    description: 'Crispy fried mixed vegetable dumplings in a dark savory garlic, ginger, and soy sauce.',
    category: 'Chinese',
    price: 190,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Chilli Paneer Dry',
    description: 'Crispy paneer cubes stir-fried with green chilies, capsicum, spring onions, and oriental sauces.',
    category: 'Chinese',
    price: 210,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- South Indian ---
  {
    name: 'Crispy Masala Dosa',
    description: 'Golden fermented rice crepe filled with spiced potato masala, served with sambar and fresh chutney.',
    category: 'South Indian',
    price: 120,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Steamed Idli & Medu Vada Combo',
    description: 'Fluffy steamed rice cakes and crunchy lentil donuts served with piping hot dal sambar.',
    category: 'South Indian',
    price: 100,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Onion Rava Masala Dosa',
    description: 'Semolina crepe infused with roasted cumin, green chilies, onions, and filled with aloo bhaji.',
    category: 'South Indian',
    price: 140,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Desserts ---
  {
    name: 'Warm Gulab Jamun (2 Pcs)',
    description: 'Soft melt-in-mouth milk-solid dumplings soaked in fragrant cardamom & saffron sugar syrup.',
    category: 'Desserts',
    price: 90,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Molten Choco Lava Cake',
    description: 'Warm chocolate sponge cake filled with a decadent, gooey liquid dark chocolate center.',
    category: 'Desserts',
    price: 160,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Royal Rasmalai (2 Pcs)',
    description: 'Delicate cottage cheese patties soaked in thick clotted milk flavored with pistachio and saffron.',
    category: 'Desserts',
    price: 110,
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Beverages ---
  {
    name: 'Royal Mango Lassi',
    description: 'Thick creamy churned yogurt blended with sweet Alphonso mango pulp and cardamom.',
    category: 'Beverages',
    price: 110,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Iced Hazelnut Cold Coffee',
    description: 'Rich brewed espresso blended with chilled milk, roasted hazelnut syrup, and vanilla ice cream.',
    category: 'Beverages',
    price: 130,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Kullad Masala Chai (2 Servings)',
    description: 'Traditional slow-brewed Indian milk tea infused with crushed ginger, cardamom, and clove.',
    category: 'Beverages',
    price: 80,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    available: true
  },

  // --- Healthy Food ---
  {
    name: 'Mediterranean Quinoa Salad Bowl',
    description: 'Nutritious quinoa tossed with cherry tomatoes, cucumbers, kalamata olives, feta, and lemon dressing.',
    category: 'Healthy Food',
    price: 220,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Grilled Paneer Protein Bowl',
    description: 'Herb-grilled cottage cheese skewers served on brown rice with steamed broccoli and hummus.',
    category: 'Healthy Food',
    price: 250,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    name: 'Avocado & Green Sprouts Bowl',
    description: 'Fresh Haas avocado slices, sprouted moong beans, baby spinach, pomegranate, and flax seeds.',
    category: 'Healthy Food',
    price: 210,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
    available: true
  }
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Error: MONGO_URI is missing in .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const dishData of sampleDishes) {
      // Upsert by dish name to prevent duplicates on repeated runs
      const result = await Dish.findOneAndUpdate(
        { name: dishData.name },
        dishData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.isNew) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    const totalDishes = await Dish.countDocuments();
    console.log(`\nSeed completed successfully!`);
    console.log(`- Sample dishes in script: ${sampleDishes.length}`);
    console.log(`- Total dishes currently in MongoDB: ${totalDishes}`);
    console.log(`- Categories covered: Indian, Pizza, Burgers, Chinese, South Indian, Desserts, Beverages, Healthy Food`);

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
