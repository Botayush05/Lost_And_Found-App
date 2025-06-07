const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected!');
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
});

//Routes
const lostItemsRoute = require('./routes/lostItems');
app.use('/api/items', lostItemsRoute);

// Add authentication route after the items route
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
