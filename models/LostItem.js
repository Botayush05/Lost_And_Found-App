const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['lost', 'found'],
    default: 'lost'
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your user model is named "User"
    required: true
  },
  imageUrl: {
    type: String, // This will store the URL of the uploaded image from Cloudinary
    required: false // If image is optional, set it as false
  }
});

module.exports = mongoose.model('LostItem', lostItemSchema);
