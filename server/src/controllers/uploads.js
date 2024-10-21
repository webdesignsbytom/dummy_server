import path from 'path';
import fs from 'fs';
import * as url from 'url';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
// Constants
import { uploadVideoUrl } from '../utils/constants.js';
import { logger } from '../log/utils/loggerUtil.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, '..', 'media', uploadVideoUrl);

let uploadedVideos = fs
  .readdirSync(uploadDirectory)
  .filter((file) => file.endsWith('.mp4'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single('video');

export const uploadNewCatVideo = async (req, res) => {
  logger.info('uploadNewCatVideo called');

  upload(req, res, (err) => {
    if (err) {
      logger.error(`Error uploading video: ${err.message}`);
      return res.status(500).json({ message: 'Error uploading video' });
    }

    logger.info(`req.file: ${JSON.stringify(req.file)}`);

    const filePath = req.file.path;
    logger.info(`filePath: ${filePath}`);

    let random = Math.floor(Math.random() * 100000);

    const outputPath = path.join(
      uploadDirectory,
      `${Date.now()}-compressed.mp4`
    );

    logger.info(`outputPath: ${outputPath}`);

    // Use ffmpeg to compress the video
    ffmpeg(filePath)
      .noAudio()
      .output(outputPath)
      .videoCodec('libx264')
      .size('640x?')
      .format('mp4')
      .on('end', () => {
        // Delete the original file
        fs.unlinkSync(filePath);
        // Refresh the video list
        uploadedVideos = fs
          .readdirSync(uploadDirectory)
          .filter((file) => file.endsWith('.mp4'));
        logger.info('Video uploaded and compressed successfully');
        res.json({
          message: 'Video uploaded and compressed successfully',
          url: outputPath,
        });
      })
      .on('error', (err) => {
        logger.error(`Error compressing video: ${err.message}`);
        res.status(500).json({ message: 'Error compressing video' });
      })
      .run();
  });
};
