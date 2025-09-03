# Mammoth.js Browser Demo & API

This demo shows how to use Mammoth.js in the browser to convert Word documents to HTML, with both a visual interface and a programmatic API.

## Features

- **File Upload Demo**: Traditional file input for uploading .docx files
- **API Demo**: Interactive interface for testing different input formats
- **Programmatic API**: JavaScript API for integrating into your own applications

## Setup

1. Include the required files in your HTML:
```html
<script src="../mammoth.browser.js"></script>
<script src="mammoth-api.js"></script>
```

2. Open `index.html` in your browser

## API Usage

### Basic Conversion

```javascript
// Convert from base64 string
MammothAPI.convertFromBase64('UEsDBBQAAAAIAA...')
  .then(result => {
    console.log('HTML:', result.value);
    console.log('Messages:', result.messages);
  })
  .catch(error => console.error('Error:', error));

// Convert from array of bytes
MammothAPI.convertFromBytes([80, 75, 3, 4, ...])
  .then(result => console.log(result.value))
  .catch(error => console.error(error));

// Convert from binary string
MammothAPI.convertFromBinary('\x50\x4B\x03\x04...')
  .then(result => console.log(result.value))
  .catch(error => console.error(error));

// Convert from ArrayBuffer
MammothAPI.convertFromArrayBuffer(arrayBuffer)
  .then(result => console.log(result.value))
  .catch(error => console.error(error));

// Convert from hex string
MammothAPI.convertFromHex('50 4B 03 04...')
  .then(result => console.log(result.value))
  .catch(error => console.error(error));

// Convert from File object
MammothAPI.convertFromFile(fileInput.files[0])
  .then(result => console.log(result.value))
  .catch(error => console.error(error));
```

### With Options

All conversion methods accept the same options as the original `mammoth.convertToHtml`:

```javascript
MammothAPI.convertFromBase64(base64String, {
  styleMap: [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh"
  ],
  ignoreEmptyParagraphs: true
})
.then(result => console.log(result.value))
.catch(error => console.error(error));
```

### Error Handling

```javascript
MammothAPI.convertFromBase64(invalidBase64)
  .then(result => {
    // Success
    console.log(result.value);
  })
  .catch(error => {
    // Handle errors
    if (error.message.includes('Invalid base64')) {
      console.error('Invalid base64 string provided');
    } else {
      console.error('Conversion failed:', error.message);
    }
  });
```

## Input Formats

### Base64 String
A base64-encoded representation of the document:
```
UEsDBBQAAAAIAA...
```

### Byte Array
An array of numbers representing the document bytes:
```javascript
[80, 75, 3, 4, 20, 0, 6, 0, ...]
```

### Hex String
A space-separated hex string:
```
50 4B 03 04 20 00 06 00 ...
```

### Binary String
A string containing binary data:
```javascript
'\x50\x4B\x03\x04\x20\x00\x06\x00...'
```

### ArrayBuffer
A JavaScript ArrayBuffer object containing the document data.

### File Object
A File object from a file input or drag & drop event.

## Demo Interface

The demo provides three input methods:

1. **Base64 Input**: Paste a base64 string and click "Convert Base64"
2. **Array Input**: Paste a hex array and click "Convert Array"  
3. **Binary Input**: Paste a binary string and click "Convert Binary"

Each method will display the converted HTML in the output area and any conversion messages in the messages panel.

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires `mammoth.browser.js` to be loaded first
- Uses `atob()` for base64 decoding (available in all modern browsers)

## Integration Examples

### In a React Component

```jsx
import React, { useState } from 'react';

function DocumentConverter() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const convertBase64 = async (base64String) => {
    setLoading(true);
    try {
      const result = await MammothAPI.convertFromBase64(base64String);
      setHtml(result.value);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        placeholder="Paste base64 string here..."
        onChange={(e) => convertBase64(e.target.value)}
      />
      {loading && <div>Converting...</div>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
```

### In a Vue Component

```vue
<template>
  <div>
    <textarea v-model="base64Input" placeholder="Paste base64 string here..." />
    <button @click="convert" :disabled="loading">
      {{ loading ? 'Converting...' : 'Convert' }}
    </button>
    <div v-html="html"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      base64Input: '',
      html: '',
      loading: false
    };
  },
  methods: {
    async convert() {
      this.loading = true;
      try {
        const result = await MammothAPI.convertFromBase64(this.base64Input);
        this.html = result.value;
      } catch (error) {
        console.error('Conversion failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Troubleshooting

- **"Mammoth.js is required"**: Make sure `mammoth.browser.js` is loaded before `mammoth-api.js`
- **"Invalid base64 string"**: Check that your base64 string is valid and complete
- **"Invalid hex format"**: Ensure hex string has even length and contains only valid hex characters
- **Conversion fails**: Check browser console for detailed error messages from Mammoth.js

## License

Same as Mammoth.js - MIT License.
