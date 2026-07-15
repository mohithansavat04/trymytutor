const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!['Student / Parent', 'Tutor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // In a real app, hash password before saving. 
    // Assuming simple save for MVP as per PRD "no complex crypto yet" or adding it later.
    const user = await User.create({
      name,
      email,
      password, // Should be hashed in pre-save hook of User model
      role,
      phone,
      status: role === 'Tutor' ? 'Pending' : 'Active' // Tutors need approval
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    // In a real app, use bcrypt.compare. For now, direct string match if pre-save hashing isn't implemented.
    if (user && user.password === password) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.address = req.body.address || user.address;
      user.subjects = req.body.subjects || user.subjects;
      
      if (req.body.gender) user.gender = req.body.gender;
      if (req.body.age) user.age = req.body.age;
      if (req.body.classLevel) user.classLevel = req.body.classLevel;
      if (req.body.email && !user.email.endsWith('@phoneauth.app')) user.email = req.body.email;
      else if (req.body.email && user.email.endsWith('@phoneauth.app')) {
        // First time setting real email
        const emailExists = await User.findOne({ email: req.body.email });
        if (!emailExists) user.email = req.body.email;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    // Hardcoded static OTP as requested
    res.json({ message: 'OTP sent successfully', otp: '1234' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role, name } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    if (otp !== '1234') {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    let user = await User.findOne({ phone });

    // If user doesn't exist, register them
    if (!user) {
      if (!role || !['Student / Parent', 'Tutor'].includes(role)) {
        return res.status(400).json({ message: 'Valid role is required for new registration' });
      }

      user = await User.create({
        phone,
        email: `${phone}@phoneauth.app`, // prevent E11000 duplicate key on email
        role,
        name: name || 'User',
        status: role === 'Tutor' ? 'Pending' : 'Active'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isNewUser: user.email ? user.email.endsWith('@phoneauth.app') : true, 
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePhoneRequest = async (req, res) => {
  try {
    const { newPhone } = req.body;
    if (!newPhone) return res.status(400).json({ message: 'New phone number is required' });
    
    const existing = await User.findOne({ phone: newPhone });
    if (existing) return res.status(400).json({ message: 'Phone number already in use' });

    res.json({ message: 'OTP sent to new phone number', otp: '1234' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePhoneVerify = async (req, res) => {
  try {
    const { newPhone, otp } = req.body;
    if (!newPhone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });
    if (otp !== '1234') return res.status(401).json({ message: 'Invalid OTP' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.phone = newPhone;
    await user.save();

    res.json({ message: 'Phone number updated successfully', phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
