import winston from 'winston';
import path from 'path';
import * as url from 'url';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFileName = 'main'

// Set up winston logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '..', `${logFileName}.log`),
    }),
  ],
});

// USE //
// logger.info('uploadNewCatVideo called');
