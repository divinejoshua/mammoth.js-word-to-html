# Mammoth API Server Documentation

A Node.js HTTP API server that converts Word documents (.docx) to HTML using Mammoth.js.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server-api
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

3. **Server will run on:** `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health`
- **Description:** Check if the service is running
- **Response:**
  ```json
  {
    "status": "OK",
    "service": "Mammoth API",
    "version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

### Convert from File Upload
- **POST** `/api/convert/file`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `document`: File (.docx file)
  - `styleMap` (optional): Array of style mapping rules
  - `ignoreEmptyParagraphs` (optional): Boolean
  - `idPrefix` (optional): String
- **Example (cURL):**
  ```bash
  curl -X POST \
    -F "document=@/path/to/document.docx" \
    -F "ignoreEmptyParagraphs=true" \
    http://localhost:3000/api/convert/file
  ```
- **Response:**
  ```json
  {
    "success": true,
    "html": "<h1>Document Title</h1><p>Content...</p>",
    "messages": [],
    "filename": "document.docx",
    "size": 12345
  }
  ```

### Convert from Base64 String
- **POST** `/api/convert/base64`
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "base64": "UEsDBBQAAAAIAA...",
    "filename": "document.docx",
    "options": {
      "styleMap": ["p[style-name='Heading 1'] => h1:fresh"],
      "ignoreEmptyParagraphs": true
    }
  }
  ```
- **Example (cURL):**
  ```bash
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"base64":"UEsDBBQAAAAIAA..."}' \
    http://localhost:3000/api/convert/base64
  ```

### Convert from Hex String
- **POST** `/api/convert/hex`
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "hex": "50 4B 03 04 20 00 06 00...",
    "filename": "document.docx",
    "options": {
      "ignoreEmptyParagraphs": false
    }
  }
  ```
- **Example (cURL):**
  ```bash
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"hex":"50 4B 03 04 20 00 06 00"}' \
    http://localhost:3000/api/convert/hex
  ```

### Convert from Bytes Array
- **POST** `/api/convert/bytes`
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "bytes": [80, 75, 3, 4, 32, 0, 6, 0],
    "filename": "document.docx",
    "options": {
      "idPrefix": "doc-"
    }
  }
  ```
- **Example (cURL):**
  ```bash
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"bytes":[80,75,3,4,32,0,6,0]}' \
    http://localhost:3000/api/convert/bytes
  ```

### Convert from Buffer
- **POST** `/api/convert/buffer`
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "buffer": "UEsDBBQAAAAIAA...",
    "filename": "document.docx",
    "options": {
      "styleMap": [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh"
      ]
    }
  }
  ```

## Conversion Options

All endpoints support the following options:

### styleMap
Array of style mapping rules to customize HTML output:
```json
{
  "styleMap": [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Quote'] => blockquote:fresh",
    "p[style-name='Code'] => pre:fresh"
  ]
}
```

### ignoreEmptyParagraphs
Boolean to control whether empty paragraphs are included:
```json
{
  "ignoreEmptyParagraphs": true
}
```

### idPrefix
String prefix for generated IDs:
```json
{
  "idPrefix": "doc-"
}
```

### transformDocument
Function to transform the document before conversion (advanced usage).

## Response Format

### Success Response
```json
{
  "success": true,
  "html": "<h1>Document Title</h1><p>Content...</p>",
  "messages": [
    {
      "type": "info",
      "message": "Document converted successfully"
    }
  ],
  "filename": "document.docx",
  "size": 12345
}
```

### Error Response
```json
{
  "error": "Conversion failed",
  "message": "Detailed error message"
}
```

## Error Codes

- **400 Bad Request:** Invalid input data
- **404 Not Found:** Endpoint doesn't exist
- **500 Internal Server Error:** Server-side error during conversion

## Client Examples

### JavaScript (Fetch API)
```javascript
// Convert from base64
async function convertFromBase64(base64String) {
  try {
    const response = await fetch('http://localhost:3000/api/convert/base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: base64String,
        options: {
          ignoreEmptyParagraphs: true
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('HTML:', result.html);
      return result.html;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}

// Convert from file
async function convertFromFile(file) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('ignoreEmptyParagraphs', 'true');
  
  try {
    const response = await fetch('http://localhost:3000/api/convert/file', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.html;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}
```

### Python (requests)
```python
import requests
import base64

# Convert from base64
def convert_from_base64(base64_string):
    url = "http://localhost:3000/api/convert/base64"
    data = {
        "base64": base64_string,
        "options": {
            "ignoreEmptyParagraphs": True
        }
    }
    
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        result = response.json()
        if result["success"]:
            return result["html"]
        else:
            raise Exception(result["message"])
    else:
        raise Exception(f"HTTP {response.status_code}: {response.text}")

# Convert from file
def convert_from_file(file_path):
    url = "http://localhost:3000/api/convert/file"
    
    with open(file_path, 'rb') as f:
        files = {'document': f}
        data = {'ignoreEmptyParagraphs': 'true'}
        
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        if result["success"]:
            return result["html"]
        else:
            raise Exception(result["message"])
    else:
        raise Exception(f"HTTP {response.status_code}: {response.text}")
```

### cURL Examples
```bash
# Health check
curl http://localhost:3000/health

# Convert file
curl -X POST \
  -F "document=@/path/to/document.docx" \
  -F "ignoreEmptyParagraphs=true" \
  http://localhost:3000/api/convert/file

# Convert base64
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"base64":"UEsDBBQAAAAIAA..."}' \
  http://localhost:3000/api/convert/base64

# Convert hex
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"hex":"50 4B 03 04 20 00 06 00"}' \
  http://localhost:3000/api/convert/hex
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### File Size Limits
- Maximum file size: 10MB
- Maximum JSON payload: 50MB

### CORS
CORS is enabled by default. Configure in `server.js` if needed.

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2
```bash
npm install -g pm2
pm2 start server.js --name "mammoth-api"
pm2 save
pm2 startup
```

### Environment Variables
```bash
export PORT=8080
export NODE_ENV=production
node server.js
```

## Security Considerations

- File upload validation (only .docx files)
- File size limits
- Input sanitization
- CORS configuration
- Error message sanitization

## Monitoring

- Health check endpoint for load balancers
- Structured logging
- Error tracking
- Performance metrics

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Run `npm install` to install dependencies

2. **Port already in use:**
   - Change PORT environment variable
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

3. **File upload fails:**
   - Check file size (max 10MB)
   - Ensure file is .docx format
   - Check file permissions

4. **Conversion errors:**
   - Verify document is valid .docx
   - Check server logs for detailed errors
   - Ensure document isn't corrupted

### Logs
Server logs show:
- Request details
- Conversion errors
- Performance metrics
- System information
