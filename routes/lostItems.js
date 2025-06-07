const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');

// Configure multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lost_found_items',  // Cloudinary folder to store images
    allowedFormats: ['jpg', 'png', 'jpeg'],  // Allowed image formats
  },
});

const upload = multer({ storage });

// POST: Report a new lost or found item with image upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const newItem = new LostItem({
      ...req.body,
      user: req.user.id,  // set the user ID from JWT
      imageUrl: req.file ? req.file.path : null,  // Cloudinary URL of the uploaded image (if any)
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET: Fetch all items
router.get('/', async (req, res) => {
  try {
    const items = await LostItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ NEW ROUTES:

// GET: Fetch a single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update an item by ID
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Prepare the data to update
    const updatedItemData = {
      ...req.body,
      imageUrl: req.file ? req.file.path : item.imageUrl, // If new image uploaded, use it, else retain the old one
    };

    const updatedItem = await LostItem.findByIdAndUpdate(
      req.params.id,
      updatedItemData,
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete an item by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const deletedItem = await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
