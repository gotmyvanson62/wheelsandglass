/**
 * File Upload Middleware
 * Handles multipart/form-data file uploads using multer
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    cb(null, `${Date.now()}-${uniqueSuffix}-${safeName}${ext ? '' : '.bin'}`);
  }
});

// Allowed file types for quote submissions
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File filter function
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: images, PDF, Word documents.`));
  }
};

// Create multer instance with configuration
const uploadConfig = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Maximum 5 files per request
  },
  fileFilter
});

// Export configured upload middleware
export const upload = {
  // Single file upload
  single: (fieldName: string) => uploadConfig.single(fieldName),

  // Multiple files with same field name
  array: (fieldName: string, maxCount: number = 5) => uploadConfig.array(fieldName, maxCount),

  // Multiple fields with different names
  fields: (fields: multer.Field[]) => uploadConfig.fields(fields),

  // Any files
  any: () => uploadConfig.any(),

  // No files (just parse form data)
  none: () => uploadConfig.none()
};

// Helper to get file info for storage
export interface UploadedFileInfo {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export function getFileInfo(file: Express.Multer.File): UploadedFileInfo {
  return {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedAt: new Date().toISOString()
  };
}

// Helper to clean up uploaded files on error
export async function cleanupFiles(files: Express.Multer.File[]): Promise<void> {
  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${file.path}:`, error);
    }
  }
}

export default upload;
