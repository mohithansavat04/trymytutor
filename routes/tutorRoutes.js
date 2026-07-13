const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorizeRoles('Tutor'));

router.get('/requirements', tutorController.getOpenRequirements);
router.post('/requirements/:id/bid', tutorController.submitBid);
router.get('/bids', tutorController.getMyBids);

router.get('/schedules', tutorController.getMySchedules);
router.post('/wallet/payout', tutorController.requestPayout);

module.exports = router;
