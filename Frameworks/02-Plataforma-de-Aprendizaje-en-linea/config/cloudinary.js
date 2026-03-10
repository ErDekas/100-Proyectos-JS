const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage para avatares
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'edulearn/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
  }
});

// Storage para thumbnails de cursos
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'edulearn/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }]
  }
});

// Storage para archivos de lecciones
const lessonFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'edulearn/lessons',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  }
});

// Storage para entregas de tareas
const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'edulearn/submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  }
});

exports.uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadThumbnail = multer({ storage: thumbnailStorage, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadLessonFile = multer({ storage: lessonFileStorage, limits: { fileSize: 50 * 1024 * 1024 } });
exports.uploadSubmission = multer({ storage: submissionStorage, limits: { fileSize: 20 * 1024 * 1024 } });
exports.cloudinary = cloudinary;