import crypto from 'node:crypto';
import path from 'node:path';
import { s3PresignPut, s3PresignGet, s3DeleteObject } from '../../utils/bucketUtilsS3.js';

const BUCKET = process.env.HZS3_BUCKET;

// Central registry of S3 prefixes per domain
export const MEDIA_PREFIX = {
  blog: 'blog/',
  avatar: 'profile-images/',
  gallery: 'album-images/',
  task: 'task-proof/',
};

const IMAGE_TYPES = /^(image)\/(png|jpe?g|webp|gif|svg\+xml)$/i;
const VIDEO_TYPES = /^(video)\/(mp4|webm|quicktime|ogg|x-matroska)$/i;

export function assertMimeIsImageOrVideo(contentType) {
  if (!contentType || (!IMAGE_TYPES.test(contentType) && !VIDEO_TYPES.test(contentType))) {
    const err = new Error('Unsupported content type (images/videos only).');
    err.status = 400;
    throw err;
  }
}

function randomBase32(n = 16) {
  return crypto.randomBytes(n).toString('base64url').replace(/_/g, '').replace(/-/g, '');
}

export function buildObjectKey({ resource, userId, filename }) {
  const prefix = MEDIA_PREFIX[resource];
  if (!prefix) {
    const err = new Error('Unknown media resource.');
    err.status = 400;
    throw err;
  }
  const ext = (path.extname(filename || '').replace('.', '') || 'bin').toLowerCase();
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const who = userId ? String(userId) : 'anon';
  const stem = path.basename(filename || 'file', path.extname(filename || 'file'))
                .toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 64);
  const rand = randomBase32(8);
  return `${prefix}${who}/${yyyy}/${mm}/${stem || 'upload'}_${rand}.${ext}`;
}

export function cacheControlFor(contentType, variant = 'immutable') {
  if (variant === 'immutable' && (IMAGE_TYPES.test(contentType) || VIDEO_TYPES.test(contentType))) {
    return 'public, max-age=31536000, immutable';
  }
  if (variant === 'short') return 'public, max-age=60';
  return undefined;
}

export async function mintUploadUrl({ resource, userId, filename, contentType, cache = 'immutable' }) {
  assertMimeIsImageOrVideo(contentType);
  const key = buildObjectKey({ resource, userId, filename });
  const cacheControl = cacheControlFor(contentType, cache);

  const { url, expiresIn } = await s3PresignPut({
    bucket: BUCKET,
    key,
    contentType,
    cacheControl,
    expiresIn: 600,
  });

  return { url, key, expiresIn, contentType };
}

export async function signDownloadUrl({ key, ttl = 300 }) {
  const { url, expiresIn } = await s3PresignGet({
    bucket: BUCKET,
    key,
    expiresIn: Math.max(1, Math.min(ttl, 7 * 24 * 60 * 60)),
  });
  return { url, expiresIn };
}

export async function hardDeleteObject({ key }) {
  await s3DeleteObject({ bucket: BUCKET, key });
}

// tiny helper if you want to verify a key belongs to a resource
export const keyHasPrefix = (key, resource) => key?.startsWith(MEDIA_PREFIX[resource]);