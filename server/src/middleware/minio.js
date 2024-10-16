import multer from 'multer';
import { extname } from 'path';
import { Readable } from 'stream';
// Config
import {
  minioClient,
  bucketName,
  minioEndpoint,
  minioPort,
} from '../utils/minioConfig.js';

// Custom Multer storage engine for MinIO
const minioStorage = multer.memoryStorage();

// Middelware component
export const uploadToMinio = multer({
  storage: minioStorage,
}).any(); // This will capture any file under any field name

export const uploadFileToMinIO = async (fileBuffer, folder) => {
  try {
    console.log('');
    console.log('333333333333333333333', fileBuffer);
    const fileName = `${folder}${Date.now()}-${fileBuffer.originalname}`;
    console.log('>>>>> FILE NAME :', fileName);
    const fileStream = Readable.from(fileBuffer.buffer);

    await minioClient.putObject(
      bucketName,
      fileName,
      fileStream,
      fileBuffer.size,
      {
        'Content-Type': fileBuffer.mimetype,
      }
    );

    // Return the public URL of the uploaded file
    return `http://${minioEndpoint}:${minioPort}/${bucketName}${fileName}`;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    return null;
  }
};

// Middleware to upload files to MinIO
// export const uploadToMinio = multer({ storage: minioStorage }).single('thumbnail');
// export const uploadToMinio = multer({
//   storage: minioStorage,
// }).fields([
//   { name: 'thumbnail', maxCount: 1 },
// ]);

// Function to upload a file to MinIO
export const uploadFileToMinio = (file, cb) => {
  const uniqueName = `${extname(file.originalname)}-${Date.now()}`;
  const fileStream = Readable.from(file.buffer);

  minioClient.putObject(
    bucketName,
    uniqueName,
    fileStream,
    file.size,
    (err, etag) => {
      if (err) {
        return cb(err);
      }
      cb(null, { filename: uniqueName, etag });
    }
  );
};
