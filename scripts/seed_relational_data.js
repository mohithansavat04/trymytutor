const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const path = require('path');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const McqAttempt = require('../models/McqAttempt');
const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const Demo = require('../models/Demo');
const Schedule = require('../models/Schedule');
const Dispute = require('../models/Dispute');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const Ticket = require('../models/Ticket');
const AutoBidLog = require('../models/AutoBidLog');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/trymytutor';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    // Categories
    const cat = await Category.findOneAndUpdate({ name: 'Mathematics' }, { type: 'Subject', isActive: true }, { upsert: true, new: true });
    
    // 20 Parents
    const parents = [];
    for (let i = 0; i < 20; i++) {
      parents.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: 'Student / Parent',
        phone: faker.phone.number(),
        address: 'Jaipur, Rajasthan, 302001'
      });
    }
    const insertedParents = await User.insertMany(parents);

    // 20 Tutors
    const tutors = [];
    for (let i = 0; i < 20; i++) {
      tutors.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: 'Tutor',
        phone: faker.phone.number(),
        subjects: cat._id.toString(),
        hourlyRate: faker.number.int({ min: 200, max: 1000 })
      });
    }
    const insertedTutors = await User.insertMany(tutors);

    // 20 MCQ Attempts (Tutors)
    const mcqAttempts = [];
    for (let i = 0; i < 20; i++) {
      mcqAttempts.push({
        tutorId: insertedTutors[i]._id,
        version: 'v1',
        score: faker.number.int({ min: 40, max: 100 }),
        status: faker.helpers.arrayElement(['Passed', 'Failed']),
        passed: faker.datatype.boolean()
      });
    }
    await McqAttempt.insertMany(mcqAttempts);

    // 20 Requirements (Leads)
    const requirements = [];
    for (let i = 0; i < 20; i++) {
      requirements.push({
        student: insertedParents[i]._id,
        title: `Need a tutor for ${faker.commerce.department()}`,
        description: faker.lorem.paragraph(),
        budget: faker.number.int({ min: 100, max: 500 }).toString(),
        status: faker.helpers.arrayElement(['Open', 'Assigned', 'Closed']),
        subject: cat._id.toString(),
        classLevel: faker.helpers.arrayElement(['Class 10', 'Class 12']),
        board: faker.helpers.arrayElement(['CBSE', 'ICSE']),
        daysTime: faker.helpers.arrayElement(['Morning', 'Evening'])
      });
    }
    const insertedRequirements = await Requirement.insertMany(requirements);

    // 20 Bids
    const bids = [];
    for (let i = 0; i < 20; i++) {
      bids.push({
        requirement: insertedRequirements[i]._id,
        tutor: insertedTutors[i]._id,
        amount: faker.number.int({ min: 150, max: 600 }),
        message: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['Pending', 'Accepted', 'Rejected'])
      });
    }
    const insertedBids = await Bid.insertMany(bids);
    
    // Auto Bid Logs
    const autoBids = [];
    for (let i = 0; i < 5; i++) {
      autoBids.push({
        requirementId: insertedRequirements[i]._id,
        calculatedAveragePrice: faker.number.int({ min: 200, max: 400 }),
        injectionDelayTimer: 3,
        executionStatus: faker.helpers.arrayElement(['Dispatched', 'Failed', 'Pending'])
      });
    }
    await AutoBidLog.insertMany(autoBids);

    // 20 Demos
    const demos = [];
    for (let i = 0; i < 20; i++) {
      demos.push({
        requirement: insertedRequirements[i]._id,
        tutor: insertedTutors[i]._id,
        student: insertedParents[i]._id,
        scheduledAt: faker.date.future(),
        status: faker.helpers.arrayElement(['Scheduled', 'Completed', 'Cancelled'])
      });
    }
    const insertedDemos = await Demo.insertMany(demos);

    // 20 Schedules (Calendars)
    const schedules = [];
    for (let i = 0; i < 20; i++) {
      schedules.push({
        demo: insertedDemos[i]._id,
        requirement: insertedRequirements[i]._id,
        tutor: insertedTutors[i]._id,
        student: insertedParents[i]._id,
        date: faker.date.future(),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        status: faker.helpers.arrayElement(['Scheduled', 'Completed', 'Cancelled'])
      });
    }
    const insertedSchedules = await Schedule.insertMany(schedules);

    // 20 Disputes (Attendance Logs)
    const disputes = [];
    for (let i = 0; i < 20; i++) {
      disputes.push({
        sessionId: insertedSchedules[i]._id,
        raisedBy: insertedParents[i]._id,
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['Open', 'Under Investigation', 'Settled'])
      });
    }
    await Dispute.insertMany(disputes);

    // 20 Transactions
    const transactions = [];
    for (let i = 0; i < 20; i++) {
      transactions.push({
        user: insertedParents[i]._id,
        amount: faker.number.int({ min: 500, max: 5000 }),
        type: faker.helpers.arrayElement(['credit', 'debit']),
        purpose: faker.helpers.arrayElement(['recharge', 'tuition_fee', 'demo_fee', 'bidding_fee']),
        status: faker.helpers.arrayElement(['Completed', 'Pending', 'Failed']),
        referenceId: faker.string.uuid()
      });
    }
    await Transaction.insertMany(transactions);

    // 20 Payouts
    const payouts = [];
    for (let i = 0; i < 20; i++) {
      payouts.push({
        tutor: insertedTutors[i]._id,
        amount: faker.number.int({ min: 1000, max: 10000 }),
        status: faker.helpers.arrayElement(['Pending', 'Processed', 'Rejected']),
        bankDetails: { accountNo: faker.finance.accountNumber(), ifsc: 'HDFC0001234' }
      });
    }
    await Payout.insertMany(payouts);

    // 20 Support Tickets
    const tickets = [];
    for (let i = 0; i < 20; i++) {
      tickets.push({
        user: insertedParents[i]._id,
        subject: faker.helpers.arrayElement(['Attendance Issue', 'Payment Failure', 'Tutor Unresponsive']),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['Open', 'In Progress', 'Resolved']),
        priority: faker.helpers.arrayElement(['Low', 'Medium', 'High'])
      });
    }
    await Ticket.insertMany(tickets);

    console.log('Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
