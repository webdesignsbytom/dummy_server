// Sample booking
export const bookingSeedItem = {
  time: 14, // 2pm
  date: '2025-04-15T00:00:00.000Z',
  fullName: 'Jane Doe',
  phoneNumber: '123-456-7890',
  email: 'jane.doe@example.com',
  bookingApproved: true,
};

export const openingTimesSeedArray = [
  { dayOfWeek: 1, open: true, start: '09:00', end: '17:00' }, // Monday
  { dayOfWeek: 2, open: true, start: '09:00', end: '17:00' }, // Tuesday
  { dayOfWeek: 3, open: true, start: '09:00', end: '17:00' }, // Wednesday
  { dayOfWeek: 4, open: true, start: '09:00', end: '17:00' }, // Thursday
  { dayOfWeek: 5, open: true, start: '09:00', end: '17:00' }, // Friday
  { dayOfWeek: 6, open: true, start: '10:00', end: '14:00' }, // Saturday
  { dayOfWeek: 7, open: false, start: null, end: null }, // Sunday
];
