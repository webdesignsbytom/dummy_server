import dbClient from '../../utils/dbClient.js';
import { randomUUID } from 'crypto';

const waitlistSelect = {
  id: true,
  token: true,
  date: true,
  notes: true,
  createdAt: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  resourceId: true,
  serviceId: true,
};

export const createWaitlistEntry = async (
  fullName,
  email,
  phoneNumber,
  resourceId,
  serviceId,
  date,
  notes
) => {
  const wlToken = randomUUID();

  const createdWaitlistEntry = await dbClient.waitlist.create({
    data: {
      token: wlToken,
      date,
      notes: notes ?? null,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phoneNumber,
      resourceId,
      serviceId,
    },
    select: waitlistSelect,
  });

  createdWaitlistEntry.token = wlToken;
  return createdWaitlistEntry;
};

export const listWaitlistEntries = async () =>
  dbClient.waitlist.findMany({
    orderBy: { createdAt: 'desc' },
    select: waitlistSelect,
  });

export const deleteWaitlistEntryByToken = async (token) =>
  dbClient.waitlist.delete({
    where: { token },
    select: waitlistSelect,
  });

// Admin can delete by id or token (prefer id if both provided)
export const adminDeleteWaitlistEntry = async (id, token) => {
  if (id) {
    const deletedById = await dbClient.waitlist.delete({
      where: { id },
      select: waitlistSelect,
    });
    return deletedById;
  }

  if (token) {
    const deletedByToken = await dbClient.waitlist.delete({
      where: { token },
      select: waitlistSelect,
    });
    return deletedByToken;
  }
};