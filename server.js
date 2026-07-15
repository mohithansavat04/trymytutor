require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static frontend files

// Database connection
const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trymytutor';
mongoose.connect(DB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Fallback for SPA/Frontend
app.use('/admin', (req, res) => {
  res.render('admin/index');
});
app.get('/', (req, res) => {
  res.redirect('/admin');
});
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
