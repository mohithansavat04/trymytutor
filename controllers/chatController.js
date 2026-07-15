const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    }).sort('createdAt');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    // Basic implementation: find all unique users the current user has chatted with
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .sort('-createdAt');

    // Filter to get unique conversation partners
    const chatPartnersMap = new Map();
    
    messages.forEach(msg => {
      const partner = msg.sender._id.toString() === req.user._id.toString() 
        ? msg.receiver 
        : msg.sender;
        
      if (!chatPartnersMap.has(partner._id.toString())) {
        chatPartnersMap.set(partner._id.toString(), {
          user: partner,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          unread: msg.receiver._id.toString() === req.user._id.toString() && !msg.read
        });
      }
    });

    res.json(Array.from(chatPartnersMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
