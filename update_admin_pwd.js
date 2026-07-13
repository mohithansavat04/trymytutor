const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trymytutor';

async function updatePassword() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    let admin = await Admin.findOne({ email: 'admin@trymytutor.com' });
    if (!admin) {
      admin = new Admin({
        email: 'admin@trymytutor.com',
        name: 'Super Admin'
      });
    }
    
    // Set password directly
    admin.password = 'Admin@123';
    await admin.save();
    
    console.log('Admin password updated successfully to Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
}

updatePassword();
