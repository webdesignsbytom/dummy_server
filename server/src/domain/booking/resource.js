// domain/resource.js
import dbClient from '../../utils/dbClient.js';

export const findAllResources = () =>
  dbClient.resource.findMany({
    orderBy: { createdAt: 'desc' },
  });

export const findResourceById = (resourceId) =>
  dbClient.resource.findFirst({
    where: { id: resourceId },
  });

export const createNewResource = (data) =>
  dbClient.resource.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      capacity: data.capacity ?? null,
      isActive: data.isActive ?? true,
      metadata: data.metadata ?? {},
    },
  });

export const updateResourceById = (resourceId, data) =>
  dbClient.resource.update({
    where: { id: resourceId },
    data: {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      isActive: data.isActive,
      metadata: data.metadata,
    },
  });

export const deleteResourceById = (resourceId) =>
  dbClient.resource.delete({
    where: { id: resourceId },
  });

  export const attachTagsToResource = (resourceId, tags) =>
  dbClient.resource.update({
    where: { id: resourceId },
    data: {
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });

export const findResourceByIdWithTags = (resourceId) =>
  dbClient.resource.findFirst({
    where: { id: resourceId },
    include: { tags: true },
  });


export const detachTagFromResource = (resourceId, tagId) =>
  dbClient.resource.update({
    where: { id: resourceId },
    data: {
      tags: {
        disconnect: { id: tagId },
      },
    },
    include: { tags: true },
  });
