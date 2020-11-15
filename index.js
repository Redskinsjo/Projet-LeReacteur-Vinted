const express = require('express');
const formidable = require('express-formidable');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const cors = require('cors');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();
app.use(formidable());
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_KEY,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
const userRoutes = require('./routes/user');
app.use(userRoutes);
const offerRoutes = require('./routes/offer');
app.use(offerRoutes);

app.all('*', (req, res) => {
  res.status(400).json({ error: { message: "This route doesn't exist." } });
});

app.listen(process.env.PORT, () => {
  console.log('Server started...');
});
