const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorizeRoles('Student / Parent'));

router.get('/tutors', studentController.searchTutors);
router.post('/requirements', studentController.postRequirement);
router.get('/requirements', studentController.getMyRequirements);
router.get('/requirements/:id/bids', studentController.getBidsForRequirement);
router.post('/bids/:id/accept', studentController.acceptBid);

router.get('/schedules', studentController.getMySchedules);
router.post('/schedules/:id/attendance', studentController.markAttendance);
router.post('/wallet/recharge', studentController.rechargeWallet);
router.post('/tickets', studentController.createTicket);
router.post('/ratings', studentController.rateTutor);

module.exports = router;
