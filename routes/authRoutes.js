const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-phone/request', protect, authController.changePhoneRequest);
router.post('/change-phone/verify', protect, authController.changePhoneVerify);

// Public categories
router.get('/categories', adminController.getAllCategories);

module.exports = router;
