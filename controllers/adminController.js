const Admin = require('../models/Admin');
const User = require('../models/User');
const Mcq = require('../models/Mcq');
const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Demo = require('../models/Demo');
const Setting = require('../models/Setting');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');
const CmsPage = require('../models/CmsPage');
const Category = require('../models/Category');
const MasterData = require('../models/MasterData');
const Message = require('../models/Message');
const Rating = require('../models/Rating');
const Kyc = require('../models/Kyc');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Role = require('../models/Role');
const McqAttempt = require('../models/McqAttempt');
const SearchAnalytics = require('../models/SearchAnalytics');
const DemoCancellation = require('../models/DemoCancellation');
const CommunicationMasking = require('../models/CommunicationMasking');
const ChatThread = require('../models/ChatThread');
const Dispute = require('../models/Dispute');
const RefundRequest = require('../models/RefundRequest');
const TutorPerformance = require('../models/TutorPerformance');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

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

// --- Auth ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Login attempt:', admin.email, 'Role:', admin.role);

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Only allow Admin, Super Admin, Superadmin, and Finance Manager to login
    // const allowedRoles = ['Admin', 'Super Admin', 'Superadmin', 'Finance Manager'];
    // if (!allowedRoles.includes(admin.role)) {
    //   return res.status(403).json({ message: 'Access Denied: Your role is not authorized to login to the admin panel' });
    // }

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

// --- Profile ---
exports.getProfile = async (req, res) => {
  try {
    // req.admin is set by protect middleware
    res.json(req.admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = password; // Will be hashed by pre-save hook

    await admin.save();

    // Return updated user (excluding password)
    const updatedAdmin = await Admin.findById(admin._id).select('-password');
    res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { isDeleted: { $ne: true } };
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ data: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    let query = { deletedAt: null };
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const totalUsers = await User.countDocuments(query);
    const tutorsCount = await User.countDocuments({ role: 'Tutor', ...query });
    const studentsCount = await User.countDocuments({ role: 'Student / Parent', ...query });
    const requirementsCount = await Requirement.countDocuments(query);
    const activeBidsCount = await Bid.countDocuments({ status: 'Pending', ...query });
    const demosCount = await Demo.countDocuments(query);

    const transactions = await Transaction.find(query);
    const totalRevenue = transactions.filter(t => t.type === 'Credit' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const totalRefunds = transactions.filter(t => t.type === 'Debit' && (t.description || '').toLowerCase().includes('refund')).reduce((sum, t) => sum + t.amount, 0);

    const payouts = await Payout.find(query);
    const pendingPayouts = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalUsers,
      tutorsCount,
      studentsCount,
      requirementsCount,
      activeBidsCount,
      demosCount,
      totalRevenue,
      totalRefunds,
      pendingPayouts
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
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
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



exports.authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    // If the role is explicitly 'Super Admin' or 'Superadmin', grant all access
    if (req.admin.role === 'Super Admin' || req.admin.role === 'Superadmin') {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query = { question: { $regex: search, $options: 'i' } };
    }

    const total = await Mcq.countDocuments(query);
    const mcqs = await Mcq.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ data: mcqs, total, page, totalPages: Math.ceil(total / limit) });
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
    await Mcq.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'MCQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Requirements Management ---
exports.getAllRequirements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { classLevel: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Requirement.countDocuments(query);
    const requirements = await Requirement.find(query).populate('student', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ data: requirements, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    await Requirement.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query = { status: { $regex: search, $options: 'i' } };
    }

    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query).populate('tutor', 'name email').populate('requirement', 'subject classLevel').sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ data: bids, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const bid = await Bid.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bid);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBid = async (req, res) => {
  try {
    await Bid.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Bid deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Demos Management ---
exports.getAllDemos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query = { status: { $regex: search, $options: 'i' } };
    }

    const total = await Demo.countDocuments(query);
    const demos = await Demo.find(query).populate('student', 'name email').populate('tutor', 'name email').populate('requirement', 'subject classLevel').sort({ scheduledAt: 1 }).skip(skip).limit(limit);

    res.json({ data: demos, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDemo = async (req, res) => {
  try {
    const demo = await Demo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(demo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDemo = async (req, res) => {
  try {
    await Demo.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { role: 'Tutor' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const paginatedTutors = await User.find(query).sort('-createdAt').skip(skip).limit(limit);

    // Calculate metrics using all tutors
    const allTutors = await User.find({ role: 'Tutor' }, 'tutorState');
    let awaitingInterview = 0;
    let liveTutors = 0;
    let mcqFailedToday = 0;
    let suspendedThisWeek = 0;

    allTutors.forEach(tutor => {
      if (tutor.tutorState === 'Interview pending') awaitingInterview++;
      if (tutor.tutorState === 'Live') liveTutors++;
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
      tutors: { data: paginatedTutors, total, page, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTutorState = async (req, res) => {
  try {
    const { action } = req.body;
    let newState;

    if (action === 'Pending') newState = 'Pending';
    else if (action === 'Pass') newState = 'Interview Passed';
    else if (action === 'Live') newState = 'Live';
    else if (action === 'Reject') newState = 'Rejected';
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
    const admins = await Admin.find({ deletedAt: null }).select('-password');
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

// --- New Modules (Transactions, Payouts, Tickets, Schedules, CMS) ---
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ deletedAt: null }).populate('user', 'name email role');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ deletedAt: null }).populate('tutor', 'name email');
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ deletedAt: null }).populate('user', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ deletedAt: null })
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('requirement', 'subject');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllCmsPages = async (req, res) => {
  try {
    const pages = await CmsPage.find({ deletedAt: null });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- New CRUD Handlers ---

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updatePayout = async (req, res) => {
  try {
    const payout = await Payout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.create(req.body);
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Category Management ---
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query).sort({ type: 1, name: 1 }).skip(skip).limit(limit);

    // Always return as an array if no pagination requested, else object
    // Wait, let's keep it simple: if ?page is present, paginate, else return all (for dropdowns)
    if (req.query.page) {
      res.json({ data: categories, total, page, totalPages: Math.ceil(total / limit) });
    } else {
      // Return all for dropdowns
      const allCategories = await Category.find({ deletedAt: null }).sort({ type: 1, name: 1 });
      res.json(allCategories);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Category name already exists' });
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Category name already exists' });
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// --- Master Data Management ---
exports.getMasterData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await MasterData.countDocuments(query);
    const data = await MasterData.find(query).sort({ type: 1, name: 1 }).skip(skip).limit(limit);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createMasterData = async (req, res) => {
  try {
    const { type, name, isActive } = req.body;
    const existing = await MasterData.findOne({ type, name });
    if (existing) return res.status(400).json({ message: 'Entry already exists' });

    const entry = new MasterData({ type, name, isActive });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMasterData = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    // Note: Do not allow changing type.
    const entry = await MasterData.findByIdAndUpdate(req.params.id, { name, isActive }, { new: true });
    res.json(entry);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Entry name already exists for this type' });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMasterData = async (req, res) => {
  try {
    await MasterData.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// --- Chat Monitoring Management ---
exports.getChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Message.countDocuments(query);
    const data = await Message.find(query)
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.flagChat = async (req, res) => {
  try {
    const chat = await Message.findByIdAndUpdate(req.params.id, { isFlagged: true }, { new: true });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Ratings & Reviews Management ---
exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { deletedAt: null };
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Rating.countDocuments(query);
    const data = await Rating.find(query)
      .populate('fromUser', 'name role')
      .populate('toUser', 'name role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Rating.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Rating.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// --- Phase 2: KYC, Leads, Notifications, AuditLogs, Coupons ---

exports.getAllKyc = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
    const total = await Kyc.countDocuments({ deletedAt: null });
    const data = await Kyc.find({ deletedAt: null }).populate('tutor', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
    const total = await Lead.countDocuments({ deletedAt: null });
    const data = await Lead.find({ deletedAt: null }).populate('tutor', 'name email').populate('requirement').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
    const total = await Notification.countDocuments({ deletedAt: null });
    const data = await Notification.find({ deletedAt: null }).populate('recipient', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAllAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
    const total = await AuditLog.countDocuments({ deletedAt: null });
    const data = await AuditLog.find({ deletedAt: null }).populate('admin', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};


// --- Leads CRUD ---
exports.createLead = async (req, res) => {
  try { const lead = await Lead.create(req.body); res.status(201).json(lead); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateLead = async (req, res) => {
  try { const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(lead); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteLead = async (req, res) => {
  try { await Lead.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- Master Data CRUD ---
exports.createMasterData = async (req, res) => {
  try { const md = await require('../models/MasterData').create(req.body); res.status(201).json(md); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateMasterData = async (req, res) => {
  try { const md = await require('../models/MasterData').findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(md); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteMasterData = async (req, res) => {
  try { await require('../models/MasterData').findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- Chats CRUD (Message Model) ---
exports.updateChat = async (req, res) => {
  try { const chat = await require('../models/Message').findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(chat); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteChat = async (req, res) => {
  try { await require('../models/Message').findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- Reviews CRUD (Rating Model) ---
exports.createReview = async (req, res) => {
  try { 
    // Schema expects toUser, fromUser, rating, review (comment)
    const { tutorId, reviewerId, rating, review } = req.body;
    const payload = {
      toUser: tutorId,
      fromUser: reviewerId,
      rating: Number(rating),
      comment: review
    };
    const newReview = await require('../models/Rating').create(payload);
    res.status(201).json(newReview);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Server error' }); 
  }
};

exports.updateReview = async (req, res) => {
  try { const review = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(review); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteReview = async (req, res) => {
  try { await Rating.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- KYC CRUD ---
exports.createKyc = async (req, res) => {
  try { const kyc = await Kyc.create(req.body); res.status(201).json(kyc); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateKyc = async (req, res) => {
  try { const kyc = await Kyc.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(kyc); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteKyc = async (req, res) => {
  try { await Kyc.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- Notifications CRUD ---
exports.createNotification = async (req, res) => {
  try { const notif = await Notification.create(req.body); res.status(201).json(notif); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateNotification = async (req, res) => {
  try { const notif = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(notif); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.deleteNotification = async (req, res) => {
  try { await Notification.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- New Modules CRUD ---
exports.updateKycStatus = async (req, res) => {
  try {
    const kyc = await Kyc.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(kyc);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllMcqAttempts = async (req, res) => {
  try { const data = await McqAttempt.find({ deletedAt: null }).populate('tutorId', 'name email'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllSearchAnalytics = async (req, res) => {
  try { const data = await SearchAnalytics.find({ deletedAt: null }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllDemoCancellations = async (req, res) => {
  try { const data = await DemoCancellation.find({ deletedAt: null }).populate('demoId'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.waiveDemoPenalty = async (req, res) => {
  try { const data = await DemoCancellation.findByIdAndUpdate(req.params.id, { waiverIssued: true }, { new: true }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllCommunicationMaskings = async (req, res) => {
  try { const data = await CommunicationMasking.find({ deletedAt: null }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.severCommunicationMask = async (req, res) => {
  try { const data = await CommunicationMasking.findByIdAndUpdate(req.params.id, { status: 'Severed' }, { new: true }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllChatThreads = async (req, res) => {
  try { const data = await ChatThread.find({ deletedAt: null }).populate('participants', 'name'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.dispatchBlastNotification = async (req, res) => {
  try { 
    const { title, body, targetAudience, channels } = req.body;
    const User = require('../models/User');
    
    let query = {};
    if (targetAudience === 'All Tutors') query.role = 'Tutor';
    else if (targetAudience === 'All Parents') query.role = 'Student'; // Assuming Parents/Students share similar role or use Student
    
    const users = await User.find(query).select('_id');
    if(users.length === 0) {
      return res.status(200).json({ message: 'No target users found', sent: 0 });
    }

    const notifs = [];
    for (const user of users) {
      const channel = (channels && channels.length > 0) ? channels[0] : 'In-App';
      notifs.push({
        recipient: user._id,
        title,
        body,
        type: 'System',
        channel,
        deliveryStatus: 'Sent'
      });
    }
    
    await require('../models/Notification').insertMany(notifs);
    res.status(201).json({ message: 'Blast notification sent', count: notifs.length });
  }
  catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Server error' }); 
  }
};
exports.toggleReviewVisibility = async (req, res) => {
  try { const data = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllDisputes = async (req, res) => {
  try { const data = await Dispute.find({ deletedAt: null }).populate('raisedBy', 'name email'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.resolveDispute = async (req, res) => {
  try { const data = await Dispute.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllRefundRequests = async (req, res) => {
  try { const data = await RefundRequest.find({ deletedAt: null }).populate('userId', 'name email'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.createRefundRequest = async (req, res) => {
  try { const data = await RefundRequest.create(req.body); res.status(201).json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.processRefund = async (req, res) => {
  try { const data = await RefundRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.getAllTutorPerformances = async (req, res) => {
  try { const data = await TutorPerformance.find({ deletedAt: null }).populate('tutorId', 'name email'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.createAdminUser = async (req, res) => {
  try { const admin = await Admin.create(req.body); res.status(201).json(admin); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateAdminRole = async (req, res) => {
  try { const admin = await Admin.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }); res.json(admin); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.toggleAdminStatus = async (req, res) => {
  try { const admin = await Admin.findByIdAndUpdate(req.params.id, { activeStatus: req.body.activeStatus }, { new: true }); res.json(admin); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// --- Module 21: Auto-Bid Engine ---
exports.getAllAutoBids = async (req, res) => {
  try { const data = await require('../models/AutoBidLog').find({ deletedAt: null }).populate('requirementId'); res.json(data); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.updateAutoBidSettings = async (req, res) => {
  try { 
    const setting = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true }); 
    res.json(setting); 
  }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
