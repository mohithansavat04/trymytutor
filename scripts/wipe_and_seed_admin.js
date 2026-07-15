const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');

dotenv.config({ path: path.join(__dirname, '../.env') }); 

const wipeAndSeed = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/trymytutor';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    // 1. Wipe database 
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      if (collection.collectionName !== 'migrations') {
        try {
          await collection.drop();
          console.log(`Dropped collection: ${collection.collectionName}`);
        } catch (e) {
          console.log(`Could not drop ${collection.collectionName}`);
        }
      }
    }
    console.log('Database successfully wiped.');

    // 2. Seed Superadmin
    const superadmin = new Admin({
      email: 'superadmin@trymytutor.com',
      password: 'Admin@123',
      name: 'Superadmin',
      role: 'Superadmin',
      activeStatus: true
    });

    await superadmin.save();
    console.log('Superadmin seeded successfully: superadmin@trymytutor.com / Admin@123');

    process.exit(0);
  } catch (err) {
    console.error('Error during DB wipe & seed:', err);
    process.exit(1);
  }
};

wipeAndSeed();
