import dbClient from '../../utils/dbClient.js';

export const findAllServices = () =>
  dbClient.service.findMany({
    orderBy: { createdAt: 'desc' },
    include: { resource: true },
  });

export const findServiceById = (serviceId) =>
  dbClient.service.findFirst({
    where: { id: serviceId },
    include: { resource: true },
  });

export const createNewService = (data) =>
  dbClient.service.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price ?? null,
      duration: data.duration ?? null,
      resourceId: data.resourceId ?? null,
    },
    include: { resource: true },
  });

export const updateExistingService = (serviceId, updates) =>
  dbClient.service.update({
    where: { id: serviceId },
    data: {
      name: updates.name ?? undefined,
      description: updates.description ?? undefined,
      price: updates.price ?? undefined,
      duration: updates.duration ?? undefined,
      resourceId: updates.resourceId ?? undefined,
    },
    include: { resource: true },
  });

export const deleteExistingService = (serviceId) =>
  dbClient.service.delete({
    where: { id: serviceId },
  });
