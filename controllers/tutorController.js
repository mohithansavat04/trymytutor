const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Schedule = require('../models/Schedule');
const Payout = require('../models/Payout');

// --- Requirements & Bidding ---
exports.getOpenRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ status: 'Open' })
      .populate('student', 'name')
      .sort('-createdAt');
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitBid = async (req, res) => {
  try {
    const reqId = req.params.id;
    const { message, amount } = req.body;

    const requirement = await Requirement.findById(reqId);
    if (!requirement || requirement.status !== 'Open') {
      return res.status(404).json({ message: 'Requirement not available' });
    }

    const existingBid = await Bid.findOne({ requirement: reqId, tutor: req.user._id });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this requirement' });
    }

    const bid = await Bid.create({
      requirement: reqId,
      tutor: req.user._id,
      message,
      amount
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ tutor: req.user._id })
      .populate({
        path: 'requirement',
        populate: { path: 'student', select: 'name' }
      })
      .sort('-createdAt');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Schedules ---
exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ tutor: req.user._id })
      .populate('student', 'name address')
      .populate('requirement', 'subject')
      .sort('date');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Payouts ---
exports.requestPayout = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const payout = await Payout.create({
      tutor: req.user._id,
      amount,
      bankDetails
    });
    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
