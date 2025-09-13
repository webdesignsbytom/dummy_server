import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../services/s3/s3.js';

/**
 * Presign a PUT for browser upload
 */
export const s3PresignPut = async ({
  bucket,
  key,
  contentType,
  cacheControl,        // optional string like 'public, max-age=31536000, immutable'
  expiresIn = 600,     // 10 minutes
}) => {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ...(cacheControl ? { CacheControl: cacheControl } : {}),
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return { url, expiresIn };
};

/**
 * Presign a GET for reading private objects
 */
export const s3PresignGet = async ({
  bucket,
  key,
  expiresIn = 86400,   // 1 day
}) => {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return { url, expiresIn };
};

/**
 * Hard-delete an object from the bucket
 */
export const s3DeleteObject = async ({ bucket, key }) => {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};
