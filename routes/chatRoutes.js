const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', chatController.getMyChats);
router.get('/:userId', chatController.getConversation);
router.post('/', chatController.sendMessage);

module.exports = router;
