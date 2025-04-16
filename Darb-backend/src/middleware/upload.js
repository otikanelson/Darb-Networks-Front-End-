// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { formatResponse } = require('../utils/responseFormatter');

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/campaigns',
    'uploads/profiles',
    'uploads/documents',
    'uploads/milestones',
    'uploads/teams'
  ];
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

// Create directories on startup
createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    // Determine directory based on file type/usage
    if (file.fieldname.includes('document')) {
      uploadPath = path.join(uploadPath, 'documents');
    } else if (file.fieldname.includes('profile')) {
      uploadPath = path.join(uploadPath, 'profiles');
    } else if (file.fieldname.includes('milestone')) {
      uploadPath = path.join(uploadPath, 'milestones');
    } else if (file.fieldname.includes('team')) {
      uploadPath = path.join(uploadPath, 'teams');
    } else {
      uploadPath = path.join(uploadPath, 'campaigns');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Define file filter
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.fieldname.includes('image')) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for this field'), false);
    }
    
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, GIF, and WebP images are allowed'), false);
    }
    
    return cb(null, true);
  }
  
  // Allow documents
  if (file.fieldname.includes('document') || file.fieldname.includes('plan')) {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed for documents'), false);
    }
    
    return cb(null, true);
  }
  
  // Allow videos
  if (file.fieldname.includes('video')) {
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only MP4, WebM, MOV and AVI videos are allowed'), false);
    }
    
    return cb(null, true);
  }
  
  // For any other field types, reject
  cb(new Error('Unsupported file field'), false);
};

// Configure file size limits
const maxFileSizes = {
  'image': 5 * 1024 * 1024, // 5MB for images
  'document': 10 * 1024 * 1024, // 10MB for documents
  'video': 50 * 1024 * 1024 // 50MB for videos
};

// Create multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size (this is a fallback, we use dynamic limits above)
  }
});

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return formatResponse(res, 400, 'File is too large. Maximum size limits: 5MB for images, 10MB for documents, 50MB for videos.');
    }
    
    return formatResponse(res, 400, `Upload error: ${err.message}`);
  }
  
  if (err) {
    return formatResponse(res, 400, err.message);
  }
  
  // Check file sizes manually for more specific size limits
  if (req.file) {
    for (const [type, limit] of Object.entries(maxFileSizes)) {
      if (req.file.fieldname.includes(type) && req.file.size > limit) {
        // Remove the file that exceeded the limit
        fs.unlinkSync(req.file.path);
        
        return formatResponse(res, 400, `${type.charAt(0).toUpperCase() + type.slice(1)} file exceeds maximum size of ${limit / (1024 * 1024)}MB`);
      }
    }
  }
  
  // Handle multiple files case
  if (req.files) {
    for (const fieldname in req.files) {
      for (const file of req.files[fieldname]) {
        for (const [type, limit] of Object.entries(maxFileSizes)) {
          if (file.fieldname.includes(type) && file.size > limit) {
            // Remove the file that exceeded the limit
            fs.unlinkSync(file.path);
            
            return formatResponse(res, 400, `${type.charAt(0).toUpperCase() + type.slice(1)} file '${file.originalname}' exceeds maximum size of ${limit / (1024 * 1024)}MB`);
          }
        }
      }
    }
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError,
  createUploadDirectories
};