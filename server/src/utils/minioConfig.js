import { Client } from 'minio';

// Name of the bucket to store uploads
export const bucketName = process.env.MINIO_BUCKET_NAME;
export const minioPort = parseInt(process.env.MINIO_PORT);
export const minioEndpoint = process.env.MINIO_BUCKET_ENDPOINT;

// Create MinIO client
export const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Ensure that the bucket exists in MinIO
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    return console.log('Error checking bucket:', err);
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) {
        return console.log('Error creating bucket:', err);
      }
      console.log(`Bucket '${bucketName}' created successfully.`);
    });
  }
});
