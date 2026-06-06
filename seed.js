const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

// Sample products - Agricultural products for NandiAgro
const sampleProducts = [
  {
    name: "Hybrid Tomato Seeds F1",
    brand: "Syngenta",
    category: "Seeds",
    price: 450,
    quantity: 100,
    description: "High-yield hybrid tomato seeds suitable for summer cultivation with disease resistance",
    imageURL: "https://images.unsplash.com/photo-1592924357615-bc4a4410be1b?w=500&h=500&fit=crop"
  },
  {
    name: "Organic NPK Fertilizer",
    brand: "EarthCare",
    category: "Fertilizers",
    price: 350,
    quantity: 200,
    description: "100% organic NPK 19:19:19 fertilizer for general crop cultivation",
    imageURL: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=500&fit=crop"
  },
  {
    name: "Manual Garden Fork",
    brand: "AgroTool",
    category: "Tools",
    price: 599,
    quantity: 50,
    description: "Heavy-duty manual garden fork with stainless steel tines for soil cultivation",
    imageURL: "https://images.unsplash.com/photo-1585421514284-efb74832c60f?w=500&h=500&fit=crop"
  },
  {
    name: "Neem Oil Pesticide",
    brand: "OrganicShield",
    category: "Pesticides",
    price: 280,
    quantity: 150,
    description: "Natural neem oil-based organic pesticide safe for vegetables and pulses",
    imageURL: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop"
  },
  {
    name: "Drip Irrigation Kit",
    brand: "AquaFlow",
    category: "Irrigation",
    price: 2500,
    quantity: 30,
    description: "Complete drip irrigation system for 500 sq.ft area with timer and filters",
    imageURL: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&h=500&fit=crop"
  },
  {
    name: "Wheat Seeds (Premium)",
    brand: "SeedMaster",
    category: "Seeds",
    price: 320,
    quantity: 80,
    description: "High-protein wheat seeds with excellent germination rate for winter season",
    imageURL: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=500&fit=crop"
  },
  {
    name: "DAP Fertilizer Bag",
    brand: "AgroChemics",
    category: "Fertilizers",
    price: 620,
    quantity: 120,
    description: "Diammonium phosphate fertilizer 46:26:0 for cereals and pulses",
    imageURL: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=500&fit=crop"
  },
  {
    name: "Garden Spade",
    brand: "ProTools",
    category: "Tools",
    price: 450,
    quantity: 60,
    description: "Professional-grade garden spade with wooden handle for digging and tilling",
    imageURL: "https://images.unsplash.com/photo-1585421514284-efb74832c60f?w=500&h=500&fit=crop"
  },
  {
    name: "Fungicide Spray",
    brand: "CropGuard",
    category: "Pesticides",
    price: 185,
    quantity: 200,
    description: "Systemic fungicide for controlling plant fungal diseases and mildew",
    imageURL: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop"
  },
  {
    name: "Soil Moisture Meter",
    brand: "AquaSense",
    category: "Tools",
    price: 850,
    quantity: 40,
    description: "Digital soil moisture meter for precise irrigation monitoring",
    imageURL: "https://images.unsplash.com/photo-1585421514284-efb74832c60f?w=500&h=500&fit=crop"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing products
    await Product.deleteMany();
    console.log('Products cleared');

    // Insert sample products
    if (sampleProducts.length > 0) {
      await Product.insertMany(sampleProducts);
      console.log('Sample products inserted');
    } else {
      console.log('No sample products to insert. Please add products to the sampleProducts array in seed.js');
    }

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@nandiagro.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@nandiagro.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created');
    }

    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
