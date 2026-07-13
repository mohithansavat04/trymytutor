const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const roleController = require('../controllers/roleController');

// Setup (Run once to create the first admin)
router.get('/setup', adminController.setupAdmin);

// Auth
router.post('/login', adminController.login);

// User Management (Protected routes)
router.get('/metrics', adminController.protect, adminController.getMetrics);
router.get('/users', adminController.protect, adminController.authorize('view_users', 'manage_users'), adminController.getAllUsers);
router.post('/users', adminController.protect, adminController.authorize('manage_users'), adminController.createUser);
router.put('/users/:id', adminController.protect, adminController.authorize('manage_users'), adminController.updateUser);
router.get('/users/:id', adminController.protect, adminController.authorize('view_users', 'manage_users'), adminController.getUser);
router.delete('/users/:id', adminController.protect, adminController.authorize('manage_users'), adminController.deleteUser);

// Agreement MCQs (Protected routes)
router.get('/mcqs', adminController.protect, adminController.authorize('view_mcqs', 'manage_mcqs'), adminController.getAllMcqs);
router.post('/mcqs', adminController.protect, adminController.authorize('manage_mcqs'), adminController.createMcq);
router.get('/mcqs/:id', adminController.protect, adminController.authorize('view_mcqs', 'manage_mcqs'), adminController.getMcq);
router.put('/mcqs/:id', adminController.protect, adminController.authorize('manage_mcqs'), adminController.updateMcq);
router.delete('/mcqs/:id', adminController.protect, adminController.authorize('manage_mcqs'), adminController.deleteMcq);

// Requirements (Protected routes)
router.get('/requirements', adminController.protect, adminController.authorize('view_requirements', 'manage_requirements'), adminController.getAllRequirements);
router.delete('/requirements/:id', adminController.protect, adminController.authorize('manage_requirements'), adminController.deleteRequirement);

// Bids (Protected routes)
router.get('/bids', adminController.protect, adminController.authorize('view_bids', 'manage_bids'), adminController.getAllBids);
router.delete('/bids/:id', adminController.protect, adminController.authorize('manage_bids'), adminController.deleteBid);

// Demos (Protected routes)
router.get('/demos', adminController.protect, adminController.authorize('view_demos', 'manage_demos'), adminController.getAllDemos);
router.delete('/demos/:id', adminController.protect, adminController.authorize('manage_demos'), adminController.deleteDemo);

// Tutor Approvals (Protected routes)
router.get('/tutor-approvals', adminController.protect, adminController.authorize('view_tutors', 'manage_tutors'), adminController.getTutorApprovals);
router.put('/tutors/:id/state', adminController.protect, adminController.authorize('manage_tutors'), adminController.updateTutorState);

// Settings
router.get('/settings', adminController.protect, adminController.authorize('manage_settings'), adminController.getSettings);
router.put('/settings', adminController.protect, adminController.authorize('manage_settings'), adminController.updateSettings);

// Team Members
router.get('/team', adminController.protect, adminController.authorize('manage_team'), adminController.getTeamMembers);
router.post('/team', adminController.protect, adminController.authorize('manage_team'), adminController.addTeamMember);
router.put('/team/:id/role', adminController.protect, adminController.authorize('manage_team'), adminController.updateTeamMemberRole);

// Roles
router.get('/roles', adminController.protect, adminController.authorize('manage_team'), roleController.getRoles);
router.post('/roles', adminController.protect, adminController.authorize('manage_team'), roleController.createRole);
router.put('/roles/:id', adminController.protect, adminController.authorize('manage_team'), roleController.updateRole);
router.delete('/roles/:id', adminController.protect, adminController.authorize('manage_team'), roleController.deleteRole);

module.exports = router;
