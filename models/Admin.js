const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Super Admin'
  },
  role: {
    type: String,
    enum: ['Superadmin', 'Admin', 'Finance Manager', 'Support'],
    default: 'Admin'
  },
  activeStatus: {
    type: Boolean,
    default: true
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
