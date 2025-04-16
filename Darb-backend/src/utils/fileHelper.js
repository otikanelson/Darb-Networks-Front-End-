// src/utils/fileHelper.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const crypto = require('crypto');

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Base directory for uploads
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * Ensure upload directories exist
 */
const ensureDirectories = async () => {
  const directories = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'campaigns'),
    path.join(UPLOAD_DIR, 'profiles'),
    path.join(UPLOAD_DIR, 'documents')
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
};

/**
 * Save base64 image to file
 * @param {string} base64String - Base64 encoded image
 * @param {string} directory - Directory to save to (inside uploads)
 * @returns {Promise<string>} File path
 */
const saveBase64Image = async (base64String, directory = 'campaigns') => {
  await ensureDirectories();
  
  // Extract mime type and data
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  
  // Generate file extension from mime type
  const extension = mimeType.split('/')[1] || 'png';
  
  // Generate unique filename
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  
  // Full save path
  const savePath = path.join(UPLOAD_DIR, directory, filename);
  
  // Save file
  await writeFile(savePath, buffer);
  
  // Return relative path for storage in database
  return `/uploads/${directory}/${filename}`;
};

/**
 * Delete file from uploads
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../..', filePath);
    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const sharp = require('sharp');

/**
 * Optimize and resize an image before saving
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} Optimized image buffer
 */
const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 1200, // Default max width
    quality = 80, // Default quality
    format = 'jpeg' // Default format
  } = options;
  
  try {
    let sharpInstance = sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .toFormat(format, { quality });
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    return buffer; // Return original if optimization fails
  }
};

// Modified saveBase64Image function with optimization
const saveBase64ImageOptimized = async (base64String, directory = 'campaigns', options = {}) => {
  await ensureDirectories();
  
  // Extract mime type and data
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  
  // Only optimize images, not other file types
  let processedBuffer = buffer;
  if (mimeType.startsWith('image/')) {
    processedBuffer = await optimizeImage(buffer, options);
  }
  
  // Generate file extension from mime type
  const format = options.format || mimeType.split('/')[1] || 'jpeg';
  
  // Generate unique filename
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${format}`;
  
  // Full save path
  const savePath = path.join(UPLOAD_DIR, directory, filename);
  
  // Save file
  await writeFile(savePath, processedBuffer);
  
  // Return relative path for storage in database
  return `/uploads/${directory}/${filename}`;
};

// Export the new functions
module.exports = {
  // ... existing exports
  optimizeImage,
  saveBase64ImageOptimized
};

module.exports = {
  ensureDirectories,
  saveBase64Image,
  deleteFile,
  UPLOAD_DIR
};