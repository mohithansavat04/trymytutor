const Admin = require('../models/Admin');
const User = require('../models/User');
const Mcq = require('../models/Mcq');
const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Demo = require('../models/Demo');
const Setting = require('../models/Setting');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// --- Auth ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const roleDoc = await Role.findOne({ name: admin.role });
    const permissions = roleDoc ? roleDoc.permissions : [];

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { name: admin.name, email: admin.email, role: admin.role, permissions } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setupAdmin = async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: 'admin@trymytutor.com' });
    if (existing) {
      // Update existing admin password
      existing.password = 'Admin@123';
      existing.role = 'Super Admin';
      await existing.save();
      return res.json({ message: 'Admin password updated to Admin@123' });
    }
    const admin = new Admin({
      email: 'admin@trymytutor.com',
      password: 'Admin@123',
      name: 'Super Admin',
      role: 'Super Admin'
    });
    await admin.save();
    res.json({ message: 'Admin created successfully. email: admin@trymytutor.com, password: Admin@123' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const tutorsCount = await User.countDocuments({ role: 'Tutor' });
    const studentsCount = await User.countDocuments({ role: 'Student / Parent' });
    const requirementsCount = await Requirement.countDocuments();
    const activeBidsCount = await Bid.countDocuments({ status: 'Pending' });
    const demosCount = await Demo.countDocuments();
    
    res.json({
      totalUsers,
      tutorsCount,
      studentsCount,
      requirementsCount,
      activeBidsCount,
      demosCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { phone } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.` });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { phone } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.` });
    }
    res.status(400).json({ message: err.message });
  }
};

const Role = require('../models/Role');

// Middleware to verify token
exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    token = token.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }
      
      const roleDoc = await Role.findOne({ name: req.admin.role });
      req.admin.permissions = roleDoc ? roleDoc.permissions : [];

      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    // If the role is explicitly 'Super Admin', grant all access
    if (req.admin.role === 'Super Admin') {
      return next();
    }

    if (!req.admin.permissions) {
      return res.status(403).json({ message: 'Forbidden: No permissions assigned' });
    }

    const hasPermission = requiredPermissions.some(perm => req.admin.permissions.includes(perm));
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- Agreement MCQs Management ---
exports.getAllMcqs = async (req, res) => {
  try {
    const mcqs = await Mcq.find().sort({ createdAt: -1 });
    res.json(mcqs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMcq = async (req, res) => {
  try {
    const mcq = await Mcq.findById(req.params.id);
    if (!mcq) return res.status(404).json({ message: 'MCQ not found' });
    res.json(mcq);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createMcq = async (req, res) => {
  try {
    const mcq = new Mcq(req.body);
    await mcq.save();
    res.status(201).json(mcq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMcq = async (req, res) => {
  try {
    const mcq = await Mcq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mcq) return res.status(404).json({ message: 'MCQ not found' });
    res.json(mcq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMcq = async (req, res) => {
  try {
    await Mcq.findByIdAndDelete(req.params.id);
    res.json({ message: 'MCQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Requirements Management ---
exports.getAllRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find().populate('student', 'name email').sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    await Requirement.findByIdAndDelete(req.params.id);
    // Also delete associated bids
    await Bid.deleteMany({ requirement: req.params.id });
    res.json({ message: 'Requirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Bids Management ---
exports.getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find().populate('tutor', 'name email').populate('requirement', 'subject classLevel').sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBid = async (req, res) => {
  try {
    await Bid.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bid deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Demos Management ---
exports.getAllDemos = async (req, res) => {
  try {
    const demos = await Demo.find().populate('student', 'name email').populate('tutor', 'name email').populate('requirement', 'subject classLevel').sort({ scheduledAt: 1 });
    res.json(demos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDemo = async (req, res) => {
  try {
    await Demo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demo deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// --- Tutor Approvals Management ---
// ==========================================

exports.getTutorApprovals = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'Tutor' }).sort('-createdAt');
    
    // Calculate metrics
    let awaitingInterview = 0;
    let liveTutors = 0;
    let mcqFailedToday = 0;
    let suspendedThisWeek = 0;

    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    tutors.forEach(tutor => {
      if (tutor.tutorState === 'Interview pending') awaitingInterview++;
      if (tutor.tutorState === 'Live') liveTutors++;
      
      // Approximating date checks based on updated timestamps if we had them, 
      // but since we only have joinedAt, we'll just check state for now
      if (tutor.tutorState === 'MCQ Failed') mcqFailedToday++; 
      if (tutor.tutorState === 'Suspended') suspendedThisWeek++;
    });

    res.json({
      metrics: {
        awaitingInterview,
        liveTutors,
        mcqFailedToday,
        suspendedThisWeek
      },
      tutors
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTutorState = async (req, res) => {
  try {
    const { action } = req.body;
    let newState;
    
    if (action === 'Pass') newState = 'Live';
    else if (action === 'Fail') newState = 'Suspended';
    else if (action === 'Make in-house') newState = 'In-house';
    else return res.status(400).json({ message: 'Invalid action' });

    const updatedTutor = await User.findByIdAndUpdate(
      req.params.id, 
      { tutorState: newState }, 
      { new: true }
    );
    
    res.json(updatedTutor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Settings ---
exports.getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting(req.body);
      await setting.save();
    } else {
      setting = await Setting.findOneAndUpdate({}, req.body, { new: true });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Team Members ---
exports.getTeamMembers = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const admin = new Admin({ email, password, role });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTeamMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
