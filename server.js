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
  .then(async () => {
    console.log('MongoDB connected successfully');
    try {
      const Admin = require('./models/Admin');
      const count = await Admin.countDocuments();
      if (count === 0) {
        console.log('No admins found in database. Auto-seeding default superadmin...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await Admin.create({
          name: 'Super Admin',
          email: 'admin@trymytutor.com',
          password: hashedPassword,
          role: 'Superadmin',
          status: 'Active'
        });
        await Admin.create({
          name: 'Super Admin',
          email: 'superadmin@trymytutor.com',
          password: hashedPassword,
          role: 'Superadmin',
          status: 'Active'
        });
        console.log('Auto-seed complete: admin@trymytutor.com / Admin@123');
      }
    } catch (e) {
      console.error('Auto-seed error:', e);
    }
  })
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
