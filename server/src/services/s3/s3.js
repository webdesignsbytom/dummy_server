import 'dotenv/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.HZS3_REGION,
  endpoint: process.env.HZS3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.HZS3_ACCESS_KEY,
    secretAccessKey: process.env.HZS3_SECRET_KEY
  },
  forcePathStyle: true // important for Hetzner
});

export async function signGetObject({ bucket, key, contentType, expiresIn = 300 }) {
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    // Helps browsers choose correct player/preview
    ResponseContentType: contentType || undefined,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export default s3;
