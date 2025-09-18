// Booking engine seed data (arrays only, consumed by prisma/seed.js)

// Working timezone for Mistress D
export const RESOURCE_TZ = 'Europe/London';

// Location
export const locationSeed = {
  name: 'Dungeon – Room A',
  address: 'Secret Address, London',
  timeZone: RESOURCE_TZ,
  active: true,
};

// Tags
export const tagNames = ['Mistress', 'BDSM'];

// Resource (Mistress D)
export const resourceSeed = {
  name: 'Mistress D',
  timeZone: RESOURCE_TZ,
  capacity: 1,
  active: true,
};

// Service (1-hour session)
export const serviceSeed = {
  name: '1-Hour Session',
  defaultDuration: 60,
  bufferBefore: 15,
  bufferAfter: 15,
  minLeadMin: 120, // must book 2h ahead
  maxAdvanceDays: 120,
  sameDayCutoff: new Date('1970-01-01T09:00:00.000Z'), // TIME (ignored date)
  active: true,
};

// Helpers to produce TIME values for @db.Time(6)
function t(hh, mm = 0) {
  const HH = String(hh).padStart(2, '0');
  const MM = String(mm).padStart(2, '0');
  return new Date(`1970-01-01T${HH}:${MM}:00.000Z`);
}

// Weekday rules: Mon..Fri 09:00–17:00 (weekday: 1..5)
export const availabilityRulesSeedArray = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  startTime: t(9, 0),
  endTime: t(17, 0),
  validFrom: new Date('2025-01-01T00:00:00.000Z'),
  validTo: null,
}));

// Dated custom open windows (specific dates, local times)
export const availabilityDateWindowsSeedArray = [
  // Sep 23, 2025 → 10:00–13:00
  {
    date: new Date('2025-09-23T00:00:00.000Z'),
    startTime: t(10, 0),
    endTime: t(13, 0),
    note: 'Special morning window',
  },
  // Oct 01, 2025 → 11:00–16:00
  {
    date: new Date('2025-10-01T00:00:00.000Z'),
    startTime: t(11, 0),
    endTime: t(16, 0),
    note: 'Late start after travel',
  },
];

// Fixed exceptions (blackouts) including your 30th 12–14 example
export const availabilityExceptionsSeedArray = [
  // Full day off: Oct 10, 2025 (midnight→midnight)
  {
    startAt: new Date('2025-10-10T00:00:00.000Z'),
    endAt: new Date('2025-10-11T00:00:00.000Z'),
    reason: 'Day off',
  },
  // Partial: Sep 30, 2025 → 12:00–14:00
  {
    startAt: new Date('2025-09-30T12:00:00.000Z'),
    endAt: new Date('2025-09-30T14:00:00.000Z'),
    reason: 'Midday break',
  },
  // Partial: Nov 28, 2025 → 15:00–17:00
  {
    startAt: new Date('2025-11-28T15:00:00.000Z'),
    endAt: new Date('2025-11-28T17:00:00.000Z'),
    reason: 'Maintenance',
  },
];

// Year for random monthly day-offs (seed.js will add one per month)
export const RANDOM_DAY_OFFS_YEAR = 2025;

// Sample bookings
export const bookingsSeedArray = [
  {
    id: 'bkg-1',
    status: 'CONFIRMED',
    startAt: new Date('2025-04-15T14:00:00.000Z'),
    endAt: new Date('2025-04-15T15:00:00.000Z'),
    timeZone: RESOURCE_TZ,
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '+44 7000 000001',
    token: 'tok_b1_confirmed_0415',
    headcount: 1,
    notes: 'First-time session',
  },
  {
    id: 'bkg-2',
    status: 'PENDING',
    startAt: new Date('2025-05-01T10:00:00.000Z'),
    endAt: new Date('2025-05-01T11:00:00.000Z'),
    timeZone: RESOURCE_TZ,
    fullName: 'Alice Example',
    email: 'alice@example.com',
    phoneNumber: '+44 7000 000002',
    token: 'tok_b2_pending_0501',
    headcount: 1,
    expiresAt: new Date('2025-04-30T23:00:00.000Z'),
  },
  {
    id: 'bkg-3',
    status: 'CONFIRMED',
    startAt: new Date('2025-07-22T16:00:00.000Z'),
    endAt: new Date('2025-07-22T17:00:00.000Z'),
    timeZone: RESOURCE_TZ,
    fullName: 'Bob Client',
    email: 'bob.client@example.com',
    phoneNumber: '+44 7000 000003',
    token: 'tok_b3_confirmed_0722',
    headcount: 1,
  },
  {
    id: 'bkg-4',
    status: 'CONFIRMED',
    // during Oct 1 custom window
    startAt: new Date('2025-10-01T12:00:00.000Z'),
    endAt: new Date('2025-10-01T13:00:00.000Z'),
    timeZone: RESOURCE_TZ,
    fullName: 'Dana Example',
    email: 'dana@example.com',
    phoneNumber: '+44 7000 000004',
    token: 'tok_b4_confirmed_1001',
    headcount: 1,
  },
];

// Booking histories (by booking id)
export const bookingHistoriesSeedArray = [
  {
    bookingId: 'bkg-1',
    fromStatus: 'PENDING',
    toStatus: 'CONFIRMED',
    note: 'Auto-confirmed after payment',
    actor: 'system',
  },
  {
    bookingId: 'bkg-2',
    fromStatus: null,
    toStatus: 'PENDING',
    note: 'Hold created; awaiting payment',
    actor: 'system',
  },
];

// Payments (by booking id)
export const paymentsSeedArray = [
  {
    bookingId: 'bkg-1',
    provider: 'stripe',
    providerRef: 'pi_123_b1',
    amountCents: 15000,
    currency: 'GBP',
    status: 'CAPTURED',
    capturedAt: new Date('2025-04-01T10:00:00.000Z'),
    payload: { note: 'seed payment b1' },
  },
  {
    bookingId: 'bkg-3',
    provider: 'stripe',
    providerRef: 'pi_456_b3',
    amountCents: 12000,
    currency: 'GBP',
    status: 'CAPTURED',
    capturedAt: new Date('2025-07-01T09:00:00.000Z'),
  },
];

// Notifications (by booking id)
export const notificationsSeedArray = [
  {
    bookingId: 'bkg-1',
    channel: 'EMAIL',
    status: 'SENT',
    toAddress: 'jane.doe@example.com',
    sentAt: new Date('2025-04-15T13:00:00.000Z'),
    templateKey: 'booking_confirm',
    payload: { bookingId: 'bkg-1' },
  },
  {
    bookingId: 'bkg-1',
    channel: 'EMAIL',
    status: 'QUEUED',
    toAddress: 'jane.doe@example.com',
    sendAt: new Date('2025-04-14T14:00:00.000Z'),
    templateKey: 'reminder_24h',
  },
  {
    bookingId: 'bkg-2',
    channel: 'EMAIL',
    status: 'QUEUED',
    toAddress: 'alice@example.com',
    sendAt: new Date('2025-04-30T09:00:00.000Z'),
    templateKey: 'payment_link',
  },
];

// Screening (by booking id)
export const screeningSeedArray = [
  {
    bookingId: 'bkg-1',
    answers: {
      experience: 'beginner',
      limits: ['no marks'],
    },
  },
];

// Waitlist (desire specific day)
export const waitlistsSeedArray = [
  {
    desiredDate: new Date('2025-08-05T00:00:00.000Z'), // normalized date-only
    fullName: 'Charlie Hopeful',
    email: 'charlie@example.com',
    phoneNumber: '+44 7000 009999',
    notes: 'Any time works',
  },
];

// External calendar connection (for future sync)
export const externalCalendarsSeedArray = [
  {
    provider: 'google',
    externalId: 'mistress.d.calendar.id',
    syncToken: null,
    lastSyncedAt: new Date('2025-01-01T00:00:00.000Z'),
  },
];
