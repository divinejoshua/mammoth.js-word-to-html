/**
 * Mammoth.js API for Browser
 * Provides programmatic access to convert Word documents to HTML from various input formats
 */

(function() {
    'use strict';

    // Check if mammoth is available
    if (typeof mammoth === 'undefined') {
        throw new Error('Mammoth.js is required. Please include mammoth.browser.js before this file.');
    }

    /**
     * Global API object for programmatic use
     * @namespace MammothAPI
     */
    window.MammothAPI = {
        /**
         * Convert a document from base64 string to HTML
         * @param {string} base64String - Base64 encoded document
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * MammothAPI.convertFromBase64('UEsDBBQAAAAIAA...')
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromBase64: function(base64String, options) {
            if (typeof base64String !== 'string') {
                return Promise.reject(new Error('Base64 string must be a string'));
            }
            
            try {
                const binaryString = atob(base64String);
                const arrayBuffer = this._stringToArrayBuffer(binaryString);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid base64 string: ' + error.message));
            }
        },

        /**
         * Convert a document from array of bytes to HTML
         * @param {Array|Uint8Array} bytes - Array of bytes or Uint8Array
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * MammothAPI.convertFromBytes([80, 75, 3, 4, ...])
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromBytes: function(bytes, options) {
            if (!Array.isArray(bytes) && !(bytes instanceof Uint8Array)) {
                return Promise.reject(new Error('Bytes must be an array or Uint8Array'));
            }
            
            try {
                const arrayBuffer = this._bytesToArrayBuffer(bytes);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid bytes: ' + error.message));
            }
        },

        /**
         * Convert a document from binary string to HTML
         * @param {string} binaryString - Binary string
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * MammothAPI.convertFromBinary('\x50\x4B\x03\x04...')
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromBinary: function(binaryString, options) {
            if (typeof binaryString !== 'string') {
                return Promise.reject(new Error('Binary string must be a string'));
            }
            
            try {
                const arrayBuffer = this._stringToArrayBuffer(binaryString);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid binary string: ' + error.message));
            }
        },

        /**
         * Convert a document from ArrayBuffer to HTML
         * @param {ArrayBuffer} arrayBuffer - ArrayBuffer containing the document
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * MammothAPI.convertFromArrayBuffer(arrayBuffer)
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromArrayBuffer: function(arrayBuffer, options) {
            if (!(arrayBuffer instanceof ArrayBuffer)) {
                return Promise.reject(new Error('Input must be an ArrayBuffer'));
            }
            
            try {
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid ArrayBuffer: ' + error.message));
            }
        },

        /**
         * Convert a document from hex string to HTML
         * @param {string} hexString - Hex string (e.g., "50 4B 03 04")
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * MammothAPI.convertFromHex('50 4B 03 04...')
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromHex: function(hexString, options) {
            if (typeof hexString !== 'string') {
                return Promise.reject(new Error('Hex string must be a string'));
            }
            
            try {
                const bytes = this._parseHexString(hexString);
                const arrayBuffer = this._bytesToArrayBuffer(bytes);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid hex string: ' + error.message));
            }
        },

        /**
         * Convert a document from File object to HTML
         * @param {File} file - File object (from file input or drag & drop)
         * @param {Object} options - Conversion options (same as mammoth.convertToHtml)
         * @returns {Promise} Promise that resolves to conversion result
         * @example
         * const fileInput = document.getElementById('file');
         * MammothAPI.convertFromFile(fileInput.files[0])
         *   .then(result => console.log(result.value))
         *   .catch(error => console.error(error));
         */
        convertFromFile: function(file, options) {
            if (!(file instanceof File)) {
                return Promise.reject(new Error('Input must be a File object'));
            }
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = function(loadEvent) {
                    const arrayBuffer = loadEvent.target.result;
                    mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options)
                        .then(resolve)
                        .catch(reject);
                };
                
                reader.onerror = function() {
                    reject(new Error('Failed to read file'));
                };
                
                reader.readAsArrayBuffer(file);
            });
        },

        // Private utility methods
        _stringToArrayBuffer: function(str) {
            const buf = new ArrayBuffer(str.length);
            const bufView = new Uint8Array(buf);
            for (let i = 0; i < str.length; i++) {
                bufView[i] = str.charCodeAt(i) & 0xFF;
            }
            return buf;
        },

        _bytesToArrayBuffer: function(bytes) {
            if (bytes instanceof Uint8Array) {
                return bytes.buffer;
            } else if (Array.isArray(bytes)) {
                return new Uint8Array(bytes).buffer;
            } else {
                throw new Error('Bytes must be an array or Uint8Array');
            }
        },

        _parseHexString: function(hexString) {
            const hex = hexString.replace(/\s/g, '');
            if (hex.length % 2 !== 0) {
                throw new Error('Hex string must have even length');
            }
            
            const bytes = [];
            for (let i = 0; i < hex.length; i += 2) {
                const byte = parseInt(hex.substr(i, 2), 16);
                if (isNaN(byte)) {
                    throw new Error('Invalid hex character');
                }
                bytes.push(byte);
            }
            return bytes;
        }
    };

    // Add version info
    window.MammothAPI.version = '1.0.0';
    
    // Log successful initialization
    console.log('MammothAPI v' + window.MammothAPI.version + ' initialized successfully');
    
})();
