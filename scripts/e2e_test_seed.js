require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const Admin = require('../models/Admin');
const User = require('../models/User');
const Role = require('../models/Role');
const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Demo = require('../models/Demo');
const Schedule = require('../models/Schedule');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const Ticket = require('../models/Ticket');
const CmsPage = require('../models/CmsPage');
const Rating = require('../models/Rating');

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trymytutor';

async function seedAndTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Role.deleteMany({}),
      Requirement.deleteMany({}),
      Bid.deleteMany({}),
      Demo.deleteMany({}),
      Schedule.deleteMany({}),
      Transaction.deleteMany({}),
      Payout.deleteMany({}),
      Ticket.deleteMany({}),
      CmsPage.deleteMany({}),
      Rating.deleteMany({})
    ]);
    console.log('Database cleared.');

    // --- 0. Roles ---
    console.log('Seeding Roles...');
    await Role.create({
      name: 'Admin',
      description: 'Standard Admin with operational access',
      permissions: ['view_users', 'manage_users', 'view_tutors', 'manage_tutors', 'view_requirements', 'manage_requirements', 'view_bids', 'manage_bids', 'view_demos', 'manage_demos']
    });
    await Role.create({
      name: 'Finance Manager',
      description: 'Manages all financial transactions and payouts',
      permissions: [] // Currently finance APIs don't use authorize middleware, but we can add if needed
    });

    // --- 1. Admins ---
    console.log('Seeding Admins...');
    await Admin.create({ email: 'admin1@trymytutor.com', password: 'password123', role: 'Admin', name: 'Admin One' });
    await Admin.create({ email: 'admin2@trymytutor.com', password: 'password123', role: 'Admin', name: 'Admin Two' });
    await Admin.create({ email: 'finance1@trymytutor.com', password: 'password123', role: 'Finance Manager', name: 'Finance One' });
    await Admin.create({ email: 'finance2@trymytutor.com', password: 'password123', role: 'Finance Manager', name: 'Finance Two' });

    // --- 2. Students & Tutors ---
    console.log('Seeding Users (5 Students, 5 Tutors)...');
    const students = [];
    for (let i = 1; i <= 5; i++) {
      students.push(await User.create({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: 'password123',
        role: 'Student / Parent',
        phone: `987654321${i}`,
        status: 'Active'
      }));
    }

    const tutors = [];
    for (let i = 1; i <= 5; i++) {
      tutors.push(await User.create({
        name: `Tutor ${i}`,
        email: `tutor${i}@example.com`,
        password: 'password123',
        role: 'Tutor',
        phone: `123456789${i}`,
        status: 'Active' // Manually approved for test
      }));
    }

    // --- 3. Requirements ---
    console.log('Seeding Requirements...');
    const requirements = [];
    const subjects = ['Mathematics', 'Physics', 'English', 'History', 'Computer Science'];
    for (let i = 0; i < 5; i++) {
      requirements.push(await Requirement.create({
        student: students[i]._id,
        subject: subjects[i],
        classLevel: `Class ${10 - i}`,
        board: 'CBSE',
        budget: 500 + (i * 100),
        mode: i % 2 === 0 ? 'Online' : 'Offline',
        address: i % 2 === 0 ? undefined : '123 Test St, City',
        description: 'Need a good tutor for my child.',
        daysTime: 'Weekends, Morning',
        status: 'Open'
      }));
    }

    // --- 4. Bids ---
    console.log('Seeding Bids...');
    const bids = [];
    for (let i = 0; i < 5; i++) {
      // Each tutor bids on multiple requirements to simulate a marketplace
      bids.push(await Bid.create({
        requirement: requirements[i]._id,
        tutor: tutors[i]._id,
        amount: String(requirements[i].budget - 50),
        message: `I am an expert in ${requirements[i].subject}. Let's have a demo!`,
        status: 'Pending'
      }));
      // Tutor 1 also bids on other reqs
      if (i > 0) {
         await Bid.create({
          requirement: requirements[i]._id,
          tutor: tutors[0]._id,
          amount: String(requirements[i].budget),
          message: `I have 5 years experience teaching this.`,
          status: 'Pending'
        });
      }
    }

    // --- 5. Accept Bids & Schedule Demos ---
    console.log('Accepting Bids and Scheduling Demos...');
    // Student 1 accepts Tutor 1's bid
    bids[0].status = 'Accepted';
    await bids[0].save();
    requirements[0].status = 'Demo Scheduled';
    await requirements[0].save();

    const demo = await Demo.create({
      requirement: requirements[0]._id,
      student: students[0]._id,
      tutor: tutors[0]._id,
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      status: 'Scheduled'
    });

    // --- 6. Schedules (Classes) ---
    console.log('Seeding Schedules (Confirmed Classes)...');
    // Student 2 has confirmed classes with Tutor 2
    bids[1].status = 'Accepted';
    await bids[1].save();
    requirements[1].status = 'Closed';
    await requirements[1].save();

    const schedule = await Schedule.create({
      requirement: requirements[1]._id,
      student: students[1]._id,
      tutor: tutors[1]._id,
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      status: 'Completed',
      attendanceStatus: 'Present'
    });

    // --- 7. Ratings ---
    console.log('Seeding Ratings...');
    await Rating.create({
      fromUser: students[1]._id,
      toUser: tutors[1]._id,
      schedule: schedule._id,
      rating: 5,
      reviewText: "Excellent tutor, explained concepts clearly!"
    });

    // --- 8. Finance (Transactions & Payouts) ---
    console.log('Seeding Finance (Transactions & Payouts)...');
    // Student recharges wallet
    await Transaction.create({
      user: students[1]._id,
      amount: 5000,
      type: 'credit',
      purpose: 'recharge',
      status: 'Completed',
      referenceId: 'TXN123456789'
    });
    // Student pays for session
    await Transaction.create({
      user: students[1]._id,
      amount: 500,
      type: 'debit',
      purpose: 'tuition_fee',
      status: 'Completed'
    });
    // Tutor gets paid
    await Transaction.create({
      user: tutors[1]._id,
      amount: 450, // After platform commission
      type: 'credit',
      purpose: 'payout',
      status: 'Completed'
    });

    // Tutor requests payout
    await Payout.create({
      tutor: tutors[1]._id,
      amount: 2000,
      status: 'Pending',
      bankDetails: {
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        accountHolderName: 'Tutor Two',
        upiId: 'tutor2@upi'
      }
    });

    // --- 9. Support Tickets ---
    console.log('Seeding Support Tickets...');
    await Ticket.create({
      user: students[2]._id,
      subject: 'Issue with Demo Booking',
      description: 'The app crashed when I tried to book a demo.',
      type: 'complaint',
      status: 'Open',
      priority: 'High'
    });
    await Ticket.create({
      user: tutors[3]._id,
      subject: 'Payout delayed',
      description: 'My last week payout is not reflecting in bank.',
      type: 'billing',
      status: 'In Progress',
      priority: 'Medium'
    });

    // --- 10. CMS Pages (Test CRUD manually via Script) ---
    console.log('Testing CMS Page CRUD Flow...');
    // Create
    let cms = await CmsPage.create({
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: '<p>Our privacy policy...</p>',
      status: 'Draft'
    });
    console.log('  CMS Created:', cms.slug);
    // Edit
    cms.status = 'Published';
    cms.content = '<p>Updated Privacy Policy content</p>';
    await cms.save();
    console.log('  CMS Edited:', cms.status);
    // Create a dummy to delete
    let dummyCms = await CmsPage.create({
      slug: 'dummy',
      title: 'Dummy',
      content: 'To be deleted'
    });
    // Delete
    await CmsPage.findByIdAndDelete(dummyCms._id);
    console.log('  CMS Deleted: dummy');

    console.log('----------------------------------------------------');
    console.log('✅ E2E Seed & Test Complete! All modules populated successfully.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during E2E Seed & Test:', error);
    process.exit(1);
  }
}

seedAndTest();
