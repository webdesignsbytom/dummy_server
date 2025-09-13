import 'dotenv/config';
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.HZS3_REGION,
  endpoint: process.env.HZS3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.HZS3_ACCESS_KEY,
    secretAccessKey: process.env.HZS3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const params = {
  Bucket: process.env.HZS3_BUCKET,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
        ],
        ExposeHeaders: ['ETag', 'x-amz-request-id'],
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

(async () => {
  try {
    await s3.send(new PutBucketCorsCommand(params));
    console.log('✅ CORS applied to bucket:', process.env.HZS3_BUCKET);

    const out = await s3.send(new GetBucketCorsCommand({ Bucket: process.env.HZS3_BUCKET }));
    console.log('CORSRules now:', out.CORSRules);
  } catch (err) {
    console.error('❌ Error setting CORS:', err);
  }
})();