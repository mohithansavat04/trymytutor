const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const roleController = require('../controllers/roleController');

// Setup (Run once to create the first admin)
router.get('/setup', adminController.setupAdmin);

// Auth
router.post('/login', adminController.login);

// Profile
router.get('/profile', adminController.protect, adminController.getProfile);
router.put('/profile', adminController.protect, adminController.updateProfile);

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
router.put('/bids/:id', adminController.protect, adminController.authorize('manage_bids'), adminController.updateBid);
router.delete('/bids/:id', adminController.protect, adminController.authorize('manage_bids'), adminController.deleteBid);

// Demos (Protected routes)
router.get('/demos', adminController.protect, adminController.authorize('view_demos', 'manage_demos'), adminController.getAllDemos);
router.put('/demos/:id', adminController.protect, adminController.authorize('manage_demos'), adminController.updateDemo);
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

// Categories
router.get('/categories', adminController.protect, adminController.authorize('manage_cms'), adminController.getAllCategories);
router.post('/categories', adminController.protect, adminController.authorize('manage_cms'), adminController.createCategory);
router.put('/categories/:id', adminController.protect, adminController.authorize('manage_cms'), adminController.updateCategory);
router.delete('/categories/:id', adminController.protect, adminController.authorize('manage_cms'), adminController.deleteCategory);

// Master Data
router.get('/master-data', adminController.protect, adminController.authorize('manage_cms'), adminController.getMasterData);
router.post('/master-data', adminController.protect, adminController.authorize('manage_cms'), adminController.createMasterData);
router.put('/master-data/:id', adminController.protect, adminController.authorize('manage_cms'), adminController.updateMasterData);
router.delete('/master-data/:id', adminController.protect, adminController.authorize('manage_cms'), adminController.deleteMasterData);

// Chats (Monitoring)
router.get('/chats', adminController.protect, adminController.authorize('manage_support'), adminController.getChats);
router.put('/chats/:id/flag', adminController.protect, adminController.authorize('manage_support'), adminController.flagChat);
router.delete('/chats/:id', adminController.protect, adminController.authorize('manage_support'), adminController.deleteChat);

// Reviews (Moderation)
router.get('/reviews', adminController.protect, adminController.authorize('manage_support'), adminController.getReviews);
router.put('/reviews/:id/status', adminController.protect, adminController.authorize('manage_support'), adminController.updateReviewStatus);
router.delete('/reviews/:id', adminController.protect, adminController.authorize('manage_support'), adminController.deleteReview);

// Transactions, Payouts, Tickets, Schedules, CMS
router.get('/transactions', adminController.protect, adminController.getAllTransactions);
router.post('/transactions', adminController.protect, adminController.createTransaction);

router.get('/payouts', adminController.protect, adminController.getAllPayouts);
router.put('/payouts/:id', adminController.protect, adminController.updatePayout);

router.get('/tickets', adminController.protect, adminController.getAllTickets);
router.post('/tickets', adminController.protect, adminController.createTicket);
router.put('/tickets/:id', adminController.protect, adminController.updateTicket);

// Schedules (Protected)
router.get('/schedules', adminController.protect, adminController.getAllSchedules);
router.put('/schedules/:id', adminController.protect, adminController.updateSchedule);
router.delete('/schedules/:id', adminController.protect, adminController.deleteSchedule);

router.get('/cms', adminController.protect, adminController.getAllCmsPages);
router.post('/cms', adminController.protect, adminController.createCmsPage);
router.put('/cms/:id', adminController.protect, adminController.updateCmsPage);
router.delete('/cms/:id', adminController.protect, adminController.deleteCmsPage);

// Categories (Subjects, Hobbies, etc)
router.get('/categories', adminController.protect, adminController.getAllCategories);
router.post('/categories', adminController.protect, adminController.createCategory);
router.put('/categories/:id', adminController.protect, adminController.updateCategory);
router.delete('/categories/:id', adminController.protect, adminController.deleteCategory);

// Phase 2 Routes
router.get('/kyc', adminController.protect, adminController.getAllKyc);
router.get('/leads', adminController.protect, adminController.getAllLeads);
router.get('/notifications', adminController.protect, adminController.getAllNotifications);
router.get('/audit-logs', adminController.protect, adminController.getAllAuditLogs);


// Leads CRUD
router.post('/leads', adminController.protect, adminController.createLead);
router.put('/leads/:id', adminController.protect, adminController.updateLead);
router.delete('/leads/:id', adminController.protect, adminController.deleteLead);

// Master Data CRUD
router.post('/master-data', adminController.protect, adminController.createMasterData);
router.put('/master-data/:id', adminController.protect, adminController.updateMasterData);
router.delete('/master-data/:id', adminController.protect, adminController.deleteMasterData);

// Chats CRUD
router.put('/chats/:id', adminController.protect, adminController.updateChat);
router.delete('/chats/:id', adminController.protect, adminController.deleteChat);

// Reviews CRUD
router.post('/reviews', adminController.protect, adminController.authorize('manage_support'), adminController.createReview);
router.put('/reviews/:id', adminController.protect, adminController.updateReview);
router.delete('/reviews/:id', adminController.protect, adminController.deleteReview);

// KYC CRUD
router.post('/kyc', adminController.protect, adminController.createKyc);
router.put('/kyc/:id', adminController.protect, adminController.updateKyc);
router.delete('/kyc/:id', adminController.protect, adminController.deleteKyc);

// Notifications CRUD
router.post('/notifications', adminController.protect, adminController.createNotification);
router.put('/notifications/:id', adminController.protect, adminController.updateNotification);
router.delete('/notifications/:id', adminController.protect, adminController.deleteNotification);

// --- New Modules Routes ---

// Module 4: KYC Update
router.put('/kyc/:id/status', adminController.protect, adminController.updateKycStatus);

// Module 16: MCQ Attempts
router.get('/mcq-attempts', adminController.protect, adminController.getAllMcqAttempts);

// Module 18: Search Analytics
router.get('/search-analytics', adminController.protect, adminController.getAllSearchAnalytics);

// Module 20: Demo Cancellations
router.get('/demo-cancellations', adminController.protect, adminController.getAllDemoCancellations);
router.put('/demo-cancellations/:id/waive', adminController.protect, adminController.waiveDemoPenalty);

// Module 21: Communication Masking
router.get('/communication-masking', adminController.protect, adminController.getAllCommunicationMaskings);
router.put('/communication-masking/:id/sever', adminController.protect, adminController.severCommunicationMask);

// Module 22: Chat Threads
router.get('/chat-threads', adminController.protect, adminController.getAllChatThreads);

// Module 23: Push Notifications (Blast)
router.post('/notifications/blast', adminController.protect, adminController.dispatchBlastNotification);

// Module 24: Reviews Visibility
router.put('/reviews/:id/visibility', adminController.protect, adminController.toggleReviewVisibility);

// Module 25: Disputes
router.get('/disputes', adminController.protect, adminController.getAllDisputes);
router.put('/disputes/:id', adminController.protect, adminController.resolveDispute);

// Module 26/23: Refunds & Account Closures
router.get('/refunds', adminController.protect, adminController.getAllRefundRequests);
router.post('/refunds', adminController.protect, adminController.createRefundRequest);
router.put('/refunds/:id/process', adminController.protect, adminController.processRefund);

// Module 21 (New): Auto-Bid Engine Controller
router.get('/auto-bids', adminController.protect, adminController.getAllAutoBids);
router.put('/auto-bids/settings', adminController.protect, adminController.updateAutoBidSettings);

// Module 28: Admin Staff Roles
router.post('/admin-staff', adminController.protect, adminController.createAdminUser);
router.put('/admin-staff/:id/role', adminController.protect, adminController.updateAdminRole);
router.put('/admin-staff/:id/status', adminController.protect, adminController.toggleAdminStatus);

// Module 29: Tutor Performance Audit
router.get('/tutor-performance', adminController.protect, adminController.getAllTutorPerformances);

module.exports = router;
