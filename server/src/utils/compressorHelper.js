import sharp from 'sharp';

export const compressImageHelper = async (imageBuffer) => {
    try {
      // Compress the image and return the compressed buffer
      return await sharp(imageBuffer)
        .resize({ width: 800 }) // Resize to 800px width, keeping the aspect ratio
        .jpeg({ quality: 70 }) // Compress to JPEG format with 70% quality
        .toBuffer(); // Return a buffer instead of writing to disk
    } catch (error) {
      console.error('Error during image compression:', error);
      throw error;
    }
  };