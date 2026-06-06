const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Irrigation', 'Other'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: 0,
    default: 0,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  imageURL: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
