const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processImageWithGemini } = require('../utils/geminiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Edit image endpoint
router.post('/edit-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!req.body.prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const imagePath = req.file.path;
    const prompt = req.body.prompt;

    // Call Gemini API to process the image
    const outputImagePath = await processImageWithGemini(imagePath, prompt);
    
    // Create URL for the output image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = outputImagePath.replace(path.join(__dirname, '..', 'public'), '');
    const editedImageUrl = `${baseUrl}${relativePath.replace(/\\/g, '/')}`;

    res.json({ editedImageUrl });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;
