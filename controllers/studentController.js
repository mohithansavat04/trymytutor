const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Schedule = require('../models/Schedule');
const Ticket = require('../models/Ticket');
const Rating = require('../models/Rating');

// --- Requirements ---
exports.postRequirement = async (req, res) => {
  try {
    const { subject, classLevel, board, budget, mode, address, frequency } = req.body;
    const requirement = await Requirement.create({
      student: req.user._id,
      subject,
      classLevel,
      board,
      budget,
      mode,
      address,
      frequency
    });
    res.status(201).json(requirement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ student: req.user._id }).sort('-createdAt');
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBidsForRequirement = async (req, res) => {
  try {
    const reqId = req.params.id;
    // Verify requirement belongs to user
    const requirement = await Requirement.findOne({ _id: reqId, student: req.user._id });
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    const bids = await Bid.find({ requirement: reqId }).populate('tutor', 'name email subjects status');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.acceptBid = async (req, res) => {
  try {
    const bidId = req.params.id;
    const bid = await Bid.findById(bidId).populate('requirement');
    
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.requirement.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'Accepted';
    await bid.save();

    // Mark requirement as Demo Scheduled
    bid.requirement.status = 'Demo Scheduled';
    await bid.requirement.save();

    // In a full app, this would also create a Demo document
    // and deduct bidding fee from tutor's wallet.

    res.json({ message: 'Bid accepted', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Schedules ---
exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ student: req.user._id })
      .populate('tutor', 'name')
      .populate('requirement', 'subject')
      .sort('date');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Wallet ---
exports.rechargeWallet = async (req, res) => {
  try {
    // Mocking recharge logic
    const { amount } = req.body;
    res.json({ message: `Wallet recharged successfully by ${amount}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Tickets ---
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, type } = req.body;
    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      description,
      type
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Ratings ---
exports.rateTutor = async (req, res) => {
  try {
    const { tutorId, rating, reviewText } = req.body;
    const review = await Rating.create({
      fromUser: req.user._id,
      toUser: tutorId,
      rating,
      reviewText
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
