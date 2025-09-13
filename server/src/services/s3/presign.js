import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from './s3.js';

export async function getPutUrl({ key, contentType }) {
  if (!key) throw new Error('Missing key for presign');

  // Include ContentType only if you will also send it from the browser PUT
  const command = new PutObjectCommand({
    Bucket: process.env.HZS3_BUCKET,
    Key: key,
    ContentType: contentType || undefined,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes
  return { url, key };
}