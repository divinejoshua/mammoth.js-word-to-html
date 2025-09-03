(function() {
    // File upload demo
    document.getElementById("document")
        .addEventListener("change", handleFileSelect, false);

    // API demo event listeners
    document.getElementById("convertBase64").addEventListener("click", handleBase64Convert);
    document.getElementById("convertArray").addEventListener("click", handleArrayConvert);
    document.getElementById("convertBinary").addEventListener("click", handleBinaryConvert);

    // Global API object for programmatic use
    window.MammothAPI = {
        /**
         * Convert a document from base64 string to HTML
         * @param {string} base64String - Base64 encoded document
         * @param {Object} options - Conversion options
         * @returns {Promise} Promise that resolves to conversion result
         */
        convertFromBase64: function(base64String, options) {
            try {
                const binaryString = atob(base64String);
                const arrayBuffer = stringToArrayBuffer(binaryString);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid base64 string: ' + error.message));
            }
        },

        /**
         * Convert a document from array of bytes to HTML
         * @param {Array|Uint8Array} bytes - Array of bytes or Uint8Array
         * @param {Object} options - Conversion options
         * @returns {Promise} Promise that resolves to conversion result
         */
        convertFromBytes: function(bytes, options) {
            try {
                const arrayBuffer = bytesToArrayBuffer(bytes);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid bytes: ' + error.message));
            }
        },

        /**
         * Convert a document from binary string to HTML
         * @param {string} binaryString - Binary string
         * @param {Object} options - Conversion options
         * @returns {Promise} Promise that resolves to conversion result
         */
        convertFromBinary: function(binaryString, options) {
            try {
                const arrayBuffer = stringToArrayBuffer(binaryString);
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid binary string: ' + error.message));
            }
        },

        /**
         * Convert a document from ArrayBuffer to HTML
         * @param {ArrayBuffer} arrayBuffer - ArrayBuffer containing the document
         * @param {Object} options - Conversion options
         * @returns {Promise} Promise that resolves to conversion result
         */
        convertFromArrayBuffer: function(arrayBuffer, options) {
            try {
                return mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
            } catch (error) {
                return Promise.reject(new Error('Invalid ArrayBuffer: ' + error.message));
            }
        }
    };

    function handleFileSelect(event) {
        readFileInputEventAsArrayBuffer(event, function(arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                .then(displayResult, function(error) {
                    console.error(error);
                });
        });
    }

    function handleBase64Convert() {
        const base64Input = document.getElementById("base64Input").value.trim();
        if (!base64Input) {
            alert("Please enter a base64 string");
            return;
        }

        const button = document.getElementById("convertBase64");
        button.disabled = true;
        button.textContent = "Converting...";

        window.MammothAPI.convertFromBase64(base64Input)
            .then(displayResult)
            .catch(function(error) {
                console.error(error);
                displayError(error.message);
            })
            .finally(function() {
                button.disabled = false;
                button.textContent = "Convert Base64";
            });
    }

    function handleArrayConvert() {
        const arrayInput = document.getElementById("arrayInput").value.trim();
        if (!arrayInput) {
            alert("Please enter a hex array");
            return;
        }

        const button = document.getElementById("convertArray");
        button.disabled = true;
        button.textContent = "Converting...";

        try {
            const bytes = parseHexString(arrayInput);
            window.MammothAPI.convertFromBytes(bytes)
                .then(displayResult)
                .catch(function(error) {
                    console.error(error);
                    displayError(error.message);
                })
                .finally(function() {
                    button.disabled = false;
                    button.textContent = "Convert Array";
                });
        } catch (error) {
            displayError("Invalid hex format: " + error.message);
            button.disabled = false;
            button.textContent = "Convert Array";
        }
    }

    function handleBinaryConvert() {
        const binaryInput = document.getElementById("binaryInput").value.trim();
        if (!binaryInput) {
            alert("Please enter a binary string");
            return;
        }

        const button = document.getElementById("convertBinary");
        button.disabled = true;
        button.textContent = "Converting...";

        window.MammothAPI.convertFromBinary(binaryInput)
            .then(displayResult)
            .catch(function(error) {
                console.error(error);
                displayError(error.message);
            })
            .finally(function() {
                button.disabled = false;
                button.textContent = "Convert Binary";
            });
    }

    function displayResult(result) {
        document.getElementById("output").innerHTML = result.value;

        var messageHtml = result.messages.map(function(message) {
            return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
        }).join("");

        document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
    }

    function displayError(errorMessage) {
        document.getElementById("output").innerHTML = '<div style="color: red;">Error: ' + escapeHtml(errorMessage) + '</div>';
        document.getElementById("messages").innerHTML = "";
    }

    function readFileInputEventAsArrayBuffer(event, callback) {
        var file = event.target.files[0];

        var reader = new FileReader();

        reader.onload = function(loadEvent) {
            var arrayBuffer = loadEvent.target.result;
            callback(arrayBuffer);
        };

        reader.readAsArrayBuffer(file);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Utility functions
    function stringToArrayBuffer(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    function bytesToArrayBuffer(bytes) {
        if (bytes instanceof Uint8Array) {
            return bytes.buffer;
        } else if (Array.isArray(bytes)) {
            return new Uint8Array(bytes).buffer;
        } else {
            throw new Error('Bytes must be an array or Uint8Array');
        }
    }

    function parseHexString(hexString) {
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
})();
