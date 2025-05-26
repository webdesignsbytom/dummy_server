import bcrypt from 'bcrypt';
import dbClient from '../src/utils/dbClient.js';

// Seed data
const users = [
  { email: 'tom@gmail.com', id: 'test', role: 'USER' },
  { email: 'admin@admin.com', role: 'ADMIN', id: 'admin' },
  { email: 'dev@dev.com', role: 'DEVELOPER', id: 'dev' },
];

const events = [
  {
    type: 'ERROR',
    topic: 'Test event',
    code: 500,
    content: '500 test content',
  },
  { type: 'USER', topic: 'Test event', code: 200, content: '200 test content' },
  {
    type: 'ADMIN',
    topic: 'Test event',
    code: 201,
    content: '201 test content',
  },
  {
    type: 'VISITOR',
    topic: 'Test event',
    code: 201,
    content: '201 test content',
  },
  {
    type: 'DEVELOPER',
    topic: 'Test event',
    code: 201,
    content: '201 test content',
  },
];

// Sample booking
const booking = {
  time: 14, // 2pm
  date: '2025-04-15T00:00:00.000Z',
  fullName: 'Jane Doe',
  phoneNumber: '123-456-7890',
  email: 'jane.doe@example.com',
  bookingApproved: true,
};

const contactForms = [
  {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    message:
      'Hi, I’d like to inquire about your services for an upcoming event.',
    phoneNumber: '555-123-4567',
    location: 'London, UK',
    businessName: 'Smith Events',
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    message:
      'Can I get a quote for monthly maintenance for my business website?',
    phoneNumber: '555-987-6543',
    location: 'Manchester, UK',
    businessName: 'Johnson Solutions',
  },
  {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    message:
      'Hi, I’d like to inquire about your services for an upcoming event.',
    phoneNumber: '555-123-4567',
    location: 'London, UK',
    businessName: 'Smith Events',
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    message:
      'Can I get a quote for monthly maintenance for my business website?',
    phoneNumber: '555-987-6543',
    location: 'Manchester, UK',
    businessName: 'Johnson Solutions',
  },
  {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    message:
      'Hi, I’d like to inquire about your services for an upcoming event.',
    phoneNumber: '555-123-4567',
    location: 'London, UK',
    businessName: 'Smith Events',
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    message:
      'Can I get a quote for monthly maintenance for my business website?',
    phoneNumber: '555-987-6543',
    location: 'Manchester, UK',
    businessName: 'Johnson Solutions',
  },
];

const callbackForms = [
  {
    fullName: 'Charlie Daniels',
    phoneNumber: '444-111-2222',
  },
  {
    fullName: 'Diana Prince',
    phoneNumber: '333-222-1111',
  },
  {
    fullName: 'Charlie Daniels',
    phoneNumber: '444-111-2222',
  },
  {
    fullName: 'Diana Prince',
    phoneNumber: '333-222-1111',
  },
  {
    fullName: 'Charlie Daniels',
    phoneNumber: '444-111-2222',
  },
  {
    fullName: 'Diana Prince',
    phoneNumber: '333-222-1111',
  },
];

// Opening times
const openingTimes = [
  { dayOfWeek: 1, open: true, start: '09:00', end: '17:00' }, // Monday
  { dayOfWeek: 2, open: true, start: '09:00', end: '17:00' }, // Tuesday
  { dayOfWeek: 3, open: true, start: '09:00', end: '17:00' }, // Wednesday
  { dayOfWeek: 4, open: true, start: '09:00', end: '17:00' }, // Thursday
  { dayOfWeek: 5, open: true, start: '09:00', end: '17:00' }, // Friday
  { dayOfWeek: 6, open: true, start: '10:00', end: '14:00' }, // Saturday
  { dayOfWeek: 7, open: false, start: null, end: null }, // Sunday
];

// Seed data for reviews
const reviews = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    rating: 5,
    message:
      'Excellent service! Highly recommend for anyone looking for quality and reliability.',
    createdAt: new Date(),
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    rating: 4,
    message: 'Great experience, but the response time could be improved.',
    createdAt: new Date(),
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    rating: 3,
    message: 'Good service, but I expected better follow-up communication.',
    createdAt: new Date(),
  },
  {
    firstName: 'Bob',
    lastName: 'Brown',
    email: 'bob.brown@example.com',
    rating: 5,
    message:
      'Absolutely fantastic! They exceeded my expectations in every way.',
    createdAt: new Date(),
  },
  {
    firstName: 'Charlie',
    lastName: 'Davis',
    email: 'charlie.davis@example.com',
    rating: 2,
    message: 'Service was okay, but the quality didn’t match the price.',
    createdAt: new Date(),
  },
];

const newsletterSubs = [
  { email: 'subscriber1@example.com' },
  { email: 'subscriber2@example.com' },
  { email: 'subscriber3@example.com' },
];

async function seed() {
  try {
    // Validate environment variables
    if (!process.env.SEED_PASSWORD || !process.env.SALT_ROUNDS) {
      throw new Error(
        'Environment variables SEED_PASSWORD and SALT_ROUNDS are required'
      );
    }

    // Hash the seed password
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const password = await bcrypt.hash(process.env.SEED_PASSWORD, saltRounds);

    // Create users
    for (const user of users) {
      await dbClient.user.create({
        data: {
          id: user.id,
          email: user.email,
          password,
          role: user.role || 'USER',
        },
      });
    }

    // Create reviews
    for (const review of reviews) {
      await dbClient.review.create({
        data: review,
      });
    }

    // Create events
    for (const event of events) {
      await dbClient.event.create({
        data: event,
      });
    }

    // Create a booking
    await dbClient.bookingItem.create({
      data: booking,
    });

    // Create opening times
    for (const time of openingTimes) {
      await dbClient.openingTime.upsert({
        where: { dayOfWeek: time.dayOfWeek },
        update: {},
        create: time,
      });
    }

    // Create contact forms
    for (const contact of contactForms) {
      await dbClient.contactForm.create({
        data: contact,
      });
    }
    
    // Create newsletter subscriptions
    for (const sub of newsletterSubs) {
      await dbClient.newsletterSubscriber.create({
        data: sub,
      });
    }

    // Create callback forms
    for (const callback of callbackForms) {
      await dbClient.callbackForm.create({
        data: callback,
      });
    }

    // Create random day offs (one per month)
    const currentYear = 2025;
    for (let month = 0; month < 12; month++) {
      const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28
      const date = new Date(currentYear, month, randomDay);

      await dbClient.dayClosed.upsert({
        where: { date },
        update: {},
        create: {
          date,
          reason: 'Scheduled Day Off',
        },
      });
    }

    console.log('🌱 Seed completed.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await dbClient.$disconnect();
  }
}

seed().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
