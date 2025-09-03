const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Mammoth API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Convert from file upload
app.post('/api/convert/file', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file provided',
        message: 'Please upload a .docx file'
      });
    }

    const options = parseOptions(req.body);
    
    const result = await mammoth.convertToHtml({
      buffer: req.file.buffer
    }, options);

    res.json({
      success: true,
      html: result.value,
      messages: result.messages,
      filename: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('File conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Convert from base64 string
app.post('/api/convert/base64', async (req, res) => {
  try {
    const { base64, filename, options } = req.body;

    if (!base64) {
      return res.status(400).json({
        error: 'Missing base64 data',
        message: 'Please provide a base64 string'
      });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    
    const conversionOptions = parseOptions(options);
    
    const result = await mammoth.convertToHtml({
      buffer: buffer
    }, conversionOptions);

    res.json({
      success: true,
      html: result.value,
      messages: result.messages,
      filename: filename || 'document.docx',
      size: buffer.length
    });

  } catch (error) {
    console.error('Base64 conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Convert from hex string
app.post('/api/convert/hex', async (req, res) => {
  try {
    const { hex, filename, options } = req.body;

    if (!hex) {
      return res.status(400).json({
        error: 'Missing hex data',
        message: 'Please provide a hex string'
      });
    }

    // Convert hex to buffer
    const buffer = Buffer.from(hex.replace(/\s/g, ''), 'hex');
    
    const conversionOptions = parseOptions(options);
    
    const result = await mammoth.convertToHtml({
      buffer: buffer
    }, conversionOptions);

    res.json({
      success: true,
      html: result.value,
      messages: result.messages,
      filename: filename || 'document.docx',
      size: buffer.length
    });

  } catch (error) {
    console.error('Hex conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Convert from binary data (array of bytes)
app.post('/api/convert/bytes', async (req, res) => {
  try {
    const { bytes, filename, options } = req.body;

    if (!Array.isArray(bytes)) {
      return res.status(400).json({
        error: 'Invalid bytes data',
        message: 'Please provide an array of bytes'
      });
    }

    // Convert bytes array to buffer
    const buffer = Buffer.from(bytes);
    
    const conversionOptions = parseOptions(options);
    
    const result = await mammoth.convertToHtml({
      buffer: buffer
    }, conversionOptions);

    res.json({
      success: true,
      html: result.value,
      messages: result.messages,
      filename: filename || 'document.docx',
      size: buffer.length
    });

  } catch (error) {
    console.error('Bytes conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Convert from raw buffer (base64 encoded)
app.post('/api/convert/buffer', async (req, res) => {
  try {
    const { buffer, filename, options } = req.body;

    if (!buffer) {
      return res.status(400).json({
        error: 'Missing buffer data',
        message: 'Please provide a buffer (base64 encoded)'
      });
    }

    // Convert base64 buffer to actual buffer
    const documentBuffer = Buffer.from(buffer, 'base64');
    
    const conversionOptions = parseOptions(options);
    
    const result = await mammoth.convertToHtml({
      buffer: documentBuffer
    }, conversionOptions);

    res.json({
      success: true,
      html: result.value,
      messages: result.messages,
      filename: filename || 'document.docx',
      size: documentBuffer.length
    });

  } catch (error) {
    console.error('Buffer conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Helper function to parse conversion options
function parseOptions(options) {
  if (!options) return {};
  
  const parsed = {};
  
  if (options.styleMap) {
    parsed.styleMap = options.styleMap;
  }
  
  if (options.ignoreEmptyParagraphs !== undefined) {
    parsed.ignoreEmptyParagraphs = options.ignoreEmptyParagraphs;
  }
  
  if (options.idPrefix) {
    parsed.idPrefix = options.idPrefix;
  }
  
  if (options.transformDocument) {
    parsed.transformDocument = options.transformDocument;
  }
  
  return parsed;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mammoth API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/convert/file - Convert uploaded file`);
  console.log(`  POST /api/convert/base64 - Convert from base64 string`);
  console.log(`  POST /api/convert/hex - Convert from hex string`);
  console.log(`  POST /api/convert/bytes - Convert from bytes array`);
  console.log(`  POST /api/convert/buffer - Convert from base64 buffer`);
});
