/**
 * Toolbox101 - Tool Implementations
 */

const toolTemplates = {
    standard: (toolId) => `
        <div class="tool-card space-y-4">
            <div>
                <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">Input</label>
                <textarea id="input_${toolId}" class="input-area" rows="6" placeholder="Enter text here..."></textarea>
            </div>
            <div id="options_${toolId}" class="flex flex-wrap items-center gap-4"></div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-gray-300">Output</label>
                    <button onclick="copyToClipboard(document.getElementById('output_${toolId}').textContent)" class="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1">
                        <i data-lucide="copy" class="w-3 h-3"></i> Copy
                    </button>
                </div>
                <div id="output_${toolId}" class="output-area"></div>
            </div>
        </div>
    `,
    twoInput: (toolId, label1 = "Input", label2 = "Key/Option") => `
        <div class="tool-card space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">${label1}</label>
                    <textarea id="input_${toolId}" class="input-area" rows="6" placeholder="Enter text here..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">${label2}</label>
                    <textarea id="key_${toolId}" class="input-area" rows="6" placeholder="Enter key/secret here..."></textarea>
                </div>
            </div>
            <div id="options_${toolId}" class="flex flex-wrap items-center gap-4"></div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-gray-300">Output</label>
                    <button onclick="copyToClipboard(document.getElementById('output_${toolId}').textContent)" class="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1">
                        <i data-lucide="copy" class="w-3 h-3"></i> Copy
                    </button>
                </div>
                <div id="output_${toolId}" class="output-area"></div>
            </div>
        </div>
    `,
    diff: (toolId) => `
        <div class="tool-card space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">Original Text</label>
                    <textarea id="input_${toolId}" class="input-area" rows="10" placeholder="Paste original text here..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">Modified Text</label>
                    <textarea id="key_${toolId}" class="input-area" rows="10" placeholder="Paste modified text here..."></textarea>
                </div>
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2 text-slate-700 dark:text-gray-300">Difference</label>
                <div id="output_${toolId}" class="output-area bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded-xl overflow-auto max-h-[500px]"></div>
            </div>
        </div>
    `
};

window.renderToolUI = function(toolId) {
    const container = document.getElementById('toolUI');
    const tool = toolsRegistry.find(t => t.id === toolId);

    if (toolId === 'diff-checker') {
        container.innerHTML = toolTemplates.diff(toolId);
    } else if (toolId.includes('encrypt') || toolId.includes('decrypt') || toolId.includes('hmac') || ['pbkdf2-gen', 'scrypt-gen', 'argon2-gen'].includes(toolId)) {
        container.innerHTML = toolTemplates.twoInput(toolId);
    } else {
        container.innerHTML = toolTemplates.standard(toolId);
    }

    const input = document.getElementById(`input_${toolId}`);
    const keyInput = document.getElementById(`key_${toolId}`);
    const output = document.getElementById(`output_${toolId}`);
    const options = document.getElementById(`options_${toolId}`);

    const addOption = (label, id, type = 'number', value = '1') => {
        const wrap = document.createElement('div');
        wrap.className = "flex items-center gap-2";
        wrap.innerHTML = `
            <label class="text-xs font-bold text-slate-500 uppercase">${label}</label>
            <input type="${type}" id="${id}" value="${value}" class="w-20 px-2 py-1 bg-slate-100 dark:bg-gray-800 border-none rounded text-sm">
        `;
        options.appendChild(wrap);
        return wrap.querySelector('input');
    };

    let iterationsInput;
    if (toolId.startsWith('sha') || toolId === 'md5' || toolId === 'pbkdf2-gen') {
        iterationsInput = addOption('Iterations', `iter_${toolId}`, 'number', toolId === 'pbkdf2-gen' ? '1000' : '1');
        iterationsInput.addEventListener('input', () => process());
    }

    const ALPHABET_B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const b58_encode = (hex) => {
        let bytes = []; for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
        let digits = [0];
        for (let i = 0; i < bytes.length; i++) {
            let carry = bytes[i];
            for (let j = 0; j < digits.length; j++) {
                carry += digits[j] << 8;
                digits[j] = carry % 58;
                carry = (carry / 58) | 0;
            }
            while (carry) {
                digits.push(carry % 58);
                carry = (carry / 58) | 0;
            }
        }
        let res = '';
        for (let i = 0; i < bytes.length && bytes[i] === 0; i++) res += '1';
        for (let i = digits.length - 1; i >= 0; i--) res += ALPHABET_B58[digits[i]];
        return res;
    };

    const process = async () => {
        const val = input.value;
        const key = keyInput ? keyInput.value : '';
        if (!val && !['password-gen', 'uuid-v4', 'uuid-v1', 'lorem-ipsum', 'bitcoin-gen', 'ethereum-gen', 'bip39-gen', 'mac-gen', 'secure-token-gen', 'credit-card-gen', 'ulid-gen', 'fake-data-gen', 'lorem-markdown'].includes(toolId)) {
            output.textContent = '';
            if (toolId === 'diff-checker') output.innerHTML = '';
            return;
        }

        try {
            switch(toolId) {
                // Hashing
                case 'md5': case 'sha1': case 'sha256': case 'sha512': case 'sha384':
                    let hash;
                    const iters = parseInt(iterationsInput.value) || 1;
                    if (toolId === 'md5') hash = CryptoJS.MD5(val);
                    else if (toolId === 'sha1') hash = CryptoJS.SHA1(val);
                    else if (toolId === 'sha256') hash = CryptoJS.SHA256(val);
                    else if (toolId === 'sha512') hash = CryptoJS.SHA512(val);
                    else if (toolId === 'sha384') hash = CryptoJS.SHA384(val);
                    for(let i = 1; i < iters; i++) {
                        hash = (toolId === 'md5') ? CryptoJS.MD5(hash) :
                               (toolId === 'sha1') ? CryptoJS.SHA1(hash) :
                               (toolId === 'sha256') ? CryptoJS.SHA256(hash) :
                               (toolId === 'sha512') ? CryptoJS.SHA512(hash) :
                               CryptoJS.SHA384(hash);
                    }
                    output.textContent = hash.toString();
                    break;
                case 'sha3-256': output.textContent = CryptoJS.SHA3(val, { outputLength: 256 }).toString(); break;
                case 'sha3-512': output.textContent = CryptoJS.SHA3(val, { outputLength: 512 }).toString(); break;
                case 'ripemd160': output.textContent = CryptoJS.RIPEMD160(val).toString(); break;
                case 'hmac-sha256': output.textContent = CryptoJS.HmacSHA256(val, key).toString(); break;
                case 'hmac-sha512': output.textContent = CryptoJS.HmacSHA512(val, key).toString(); break;
                case 'keccak-256': output.textContent = CryptoJS.SHA3(val, { outputLength: 256 }).toString(); break;
                case 'whirlpool': output.textContent = CryptoJS.Whirlpool(val).toString(); break;
                case 'crc32':
                    let crc32_tab = Array(256).fill().map((_, i) => {
                        let c = i;
                        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
                        return c;
                    });
                    let crc = 0xFFFFFFFF;
                    for (let i = 0; i < val.length; i++) crc = crc32_tab[(crc ^ val.charCodeAt(i)) & 0xFF] ^ (crc >>> 8);
                    output.textContent = ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase();
                    break;
                case 'adler32':
                    let a = 1, b_a = 0;
                    for (let i = 0; i < val.length; i++) { a = (a + val.charCodeAt(i)) % 65521; b_a = (b_a + a) % 65521; }
                    output.textContent = ((b_a << 16) | a).toString(16).toUpperCase();
                    break;

                // Encoding
                case 'base64-encode': output.textContent = btoa(val); break;
                case 'base64-decode': output.textContent = atob(val); break;
                case 'base64url-encode': output.textContent = btoa(val).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); break;
                case 'base64url-decode':
                    let b64 = val.replace(/-/g, '+').replace(/_/g, '/');
                    while (b64.length % 4) b64 += '=';
                    output.textContent = atob(b64);
                    break;
                case 'hex-encode': output.textContent = val.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''); break;
                case 'hex-decode': output.textContent = val.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join(''); break;
                case 'url-encode': output.textContent = encodeURIComponent(val); break;
                case 'url-decode': output.textContent = decodeURIComponent(val); break;
                case 'html-encode': const el_enc = document.createElement('div'); el_enc.textContent = val; output.textContent = el_enc.innerHTML; break;
                case 'html-decode': const el_dec = document.createElement('div'); el_dec.innerHTML = val; output.textContent = el_dec.textContent; break;
                case 'rot13': output.textContent = val.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)); break;
                case 'rot47': output.textContent = val.replace(/[!-~]/g, c => String.fromCharCode(33 + (c.charCodeAt(0) + 14) % 94)); break;
                case 'binary-encode': output.textContent = val.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); break;
                case 'binary-decode': output.textContent = val.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join(''); break;
                case 'base32-encode':
                    const b32_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
                    let b32_bits = ""; let b32_res = "";
                    for(let i=0; i<val.length; i++) b32_bits += val.charCodeAt(i).toString(2).padStart(8, '0');
                    for(let i=0; i<b32_bits.length; i+=5) b32_res += b32_alphabet[parseInt(b32_bits.substr(i, 5).padEnd(5, '0'), 2)];
                    output.textContent = b32_res;
                    break;
                case 'base32-decode':
                    const b32_alphabet_inv = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
                    let b32_bits_dec = "";
                    for(let i=0; i<val.length; i++) {
                        let idx = b32_alphabet_inv.indexOf(val[i].toUpperCase());
                        if(idx !== -1) b32_bits_dec += idx.toString(2).padStart(5, '0');
                    }
                    let b32_res_dec = "";
                    for(let i=0; i+8<=b32_bits_dec.length; i+=8) b32_res_dec += String.fromCharCode(parseInt(b32_bits_dec.substr(i, 8), 2));
                    output.textContent = b32_res_dec;
                    break;
                case 'base58-encode':
                    let b58_hex = ""; for(let i=0; i<val.length; i++) b58_hex += val.charCodeAt(i).toString(16).padStart(2, '0');
                    output.textContent = b58_encode(b58_hex);
                    break;
                case 'base58-decode': output.textContent = "Base58 decoding is optimized for Bitcoin addresses. Standard string decode coming soon."; break;
                case 'morse-encode':
                    const morse = { 'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
                    output.textContent = val.toLowerCase().split('').map(c => morse[c] || c).join(' ');
                    break;
                case 'morse-decode':
                    const morse_inv = { '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0', '/': ' ' };
                    output.textContent = val.split(' ').map(c => morse_inv[c] || c).join('');
                    break;

                // Cryptography
                case 'aes-encrypt': output.textContent = CryptoJS.AES.encrypt(val, key).toString(); break;
                case 'aes-decrypt': output.textContent = CryptoJS.AES.decrypt(val, key).toString(CryptoJS.enc.Utf8); break;
                case 'triple-des-encrypt': output.textContent = CryptoJS.TripleDES.encrypt(val, key).toString(); break;
                case 'triple-des-decrypt': output.textContent = CryptoJS.TripleDES.decrypt(val, key).toString(CryptoJS.enc.Utf8); break;
                case 'rc4-encrypt': output.textContent = CryptoJS.RC4.encrypt(val, key).toString(); break;
                case 'rc4-decrypt': output.textContent = CryptoJS.RC4.decrypt(val, key).toString(CryptoJS.enc.Utf8); break;
                case 'rabbit-encrypt': output.textContent = CryptoJS.Rabbit.encrypt(val, key).toString(); break;
                case 'rabbit-decrypt': output.textContent = CryptoJS.Rabbit.decrypt(val, key).toString(CryptoJS.enc.Utf8); break;
                case 'pbkdf2-gen':
                    const salt = CryptoJS.lib.WordArray.random(128/8);
                    output.textContent = CryptoJS.PBKDF2(val, salt, { keySize: 256/32, iterations: parseInt(iterationsInput.value) || 1000 }).toString();
                    break;

                // Generators
                case 'uuid-v4': output.textContent = crypto.randomUUID(); break;
                case 'password-gen':
                    const chars_pw = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
                    let pw = ""; for(let i=0; i<16; i++) pw += chars_pw.charAt(Math.floor(Math.random() * chars_pw.length));
                    output.textContent = pw;
                    break;
                case 'secure-token-gen':
                    const array_tk = new Uint8Array(32); crypto.getRandomValues(array_tk);
                    output.textContent = Array.from(array_tk, byte => byte.toString(16).padStart(2, '0')).join('');
                    break;
                case 'ulid-gen': output.textContent = ulid.ulid(); break;
                case 'mac-gen': output.textContent = "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))); break;
                case 'credit-card-gen': output.textContent = "4xxx-xxxx-xxxx-xxxx".replace(/x/g, () => Math.floor(Math.random() * 10)); break;
                case 'docker-gen':
                    output.textContent = `version: '3.8'\nservices:\n  app:\n    image: node:18-alpine\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n    volumes:\n      - .:/app`;
                    break;
                case 'fake-data-gen':
                    const names = ["John Doe", "Jane Smith", "Alex Rivera", "Maria Garcia"];
                    const cities = ["New York", "London", "Tokyo", "Berlin"];
                    output.textContent = `Name: ${names[Math.floor(Math.random()*names.length)]}\nEmail: user${Math.floor(Math.random()*1000)}@example.com\nCity: ${cities[Math.floor(Math.random()*cities.length)]}\nIP: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.0.1`;
                    break;

                // Formatters
                case 'json-format': output.textContent = JSON.stringify(JSON.parse(val), null, 4); break;
                case 'json-minify': output.textContent = JSON.stringify(JSON.parse(val)); break;
                case 'js-format': output.textContent = js_beautify(val); break;
                case 'css-format': output.textContent = css_beautify(val); break;
                case 'html-format': output.textContent = html_beautify(val); break;
                case 'yaml-json': output.textContent = JSON.stringify(jsyaml.load(val), null, 4); break;
                case 'json-yaml': output.textContent = jsyaml.dump(JSON.parse(val)); break;
                case 'csv-json':
                    const lines_csv = val.split('\n'); const headers = lines_csv[0].split(',');
                    const result_csv = lines_csv.slice(1).map(line => {
                        const obj = {}; const currentline = line.split(',');
                        headers.forEach((h, i) => obj[h.trim()] = currentline[i] ? currentline[i].trim() : '');
                        return obj;
                    });
                    output.textContent = JSON.stringify(result_csv, null, 4);
                    break;
                case 'json-csv':
                    const json_data = JSON.parse(val); const csv_headers = Object.keys(json_data[0]);
                    output.textContent = [csv_headers.join(','), ...json_data.map(obj => csv_headers.map(h => obj[h]).join(','))].join('\n');
                    break;
                case 'xml-format':
                    output.textContent = html_beautify(val, { indent_size: 2, wrap_line_length: 0, preserve_newlines: true });
                    break;

                // Converters
                case 'unix-timestamp': output.textContent = new Date(parseInt(val) * 1000).toUTCString(); break;
                case 'date-unix': output.textContent = Math.floor(new Date(val).getTime() / 1000); break;
                case 'bin-dec': output.textContent = parseInt(val, 2).toString(10); break;
                case 'dec-bin': output.textContent = parseInt(val, 10).toString(2); break;
                case 'hex-dec': output.textContent = parseInt(val, 16).toString(10); break;
                case 'dec-hex': output.textContent = parseInt(val, 10).toString(16).toUpperCase(); break;
                case 'base-converter':
                    const n = parseInt(val);
                    output.textContent = `Bin: ${n.toString(2)}\nOct: ${n.toString(8)}\nDec: ${n.toString(10)}\nHex: ${n.toString(16).toUpperCase()}`;
                    break;
                case 'temp-converter':
                    const t = parseFloat(val);
                    output.textContent = `Celsius: ${t}°C\nFahrenheit: ${(t * 9/5 + 32).toFixed(2)}°F\nKelvin: ${(t + 273.15).toFixed(2)}K`;
                    break;
                case 'byte-converter':
                    const b = parseFloat(val);
                    output.textContent = `Bytes: ${b}\nKB: ${(b/1024).toFixed(2)}\nMB: ${(b/1024/1024).toFixed(2)}\nGB: ${(b/1024/1024/1024).toFixed(2)}`;
                    break;
                case 'length-converter':
                    const l = parseFloat(val);
                    output.textContent = `Meters: ${l}m\nFeet: ${(l * 3.28084).toFixed(2)}ft\nInches: ${(l * 39.3701).toFixed(2)}in\nKM: ${(l/1000).toFixed(2)}km`;
                    break;
                case 'weight-converter':
                    const w = parseFloat(val);
                    output.textContent = `KG: ${w}kg\nLbs: ${(w * 2.20462).toFixed(2)}lbs\nOunces: ${(w * 35.274).toFixed(2)}oz`;
                    break;
                case 'color-converter':
                    const hex_c = val.startsWith('#') ? val : '#' + val;
                    const r_c = parseInt(hex_c.substr(1,2), 16); const g_c = parseInt(hex_c.substr(3,2), 16); const b_c = parseInt(hex_c.substr(5,2), 16);
                    output.textContent = `RGB: rgb(${r_c}, ${g_c}, ${b_c})\nHEX: ${hex_c.toUpperCase()}`;
                    break;

                // Dev Utils
                case 'jwt-decode':
                    const parts = val.split('.');
                    const decodeBase64Url = (str) => {
                        str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '=';
                        return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    };
                    output.textContent = `Header: ${decodeBase64Url(parts[0])}\n\nPayload: ${decodeBase64Url(parts[1])}`;
                    break;
                case 'user-agent': output.textContent = JSON.stringify(new UAParser(val).getResult(), null, 4); break;
                case 'markdown-preview': output.innerHTML = marked.parse(val); return;
                case 'html-to-markdown': output.textContent = new TurndownService().turndown(val); break;
                case 'markdown-to-html': output.textContent = marked.parse(val); break;
                case 'json-validator': JSON.parse(val); output.textContent = "Valid JSON ✅"; break;
                case 'yaml-validator': jsyaml.load(val); output.textContent = "Valid YAML ✅"; break;
                case 'ascii-hex': output.textContent = val.split('').map(c => c.charCodeAt(0).toString(16)).join(' '); break;
                case 'hex-ascii': output.textContent = val.split(' ').map(h => String.fromCharCode(parseInt(h, 16))).join(''); break;
                case 'url-parser':
                    const u = new URL(val);
                    output.textContent = `Protocol: ${u.protocol}\nHost: ${u.host}\nPath: ${u.pathname}\nSearch: ${u.search}\nHash: ${u.hash}`;
                    break;
                case 'diff-checker':
                    const diff = Diff.diffChars(input.value, keyInput.value); output.innerHTML = '';
                    diff.forEach((part) => {
                        const span = document.createElement('span');
                        span.className = part.added ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                         part.removed ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through' : 'text-slate-600 dark:text-gray-400';
                        span.textContent = part.value; output.appendChild(span);
                    });
                    return;
                case 'http-status':
                    output.textContent = `200: OK\n201: Created\n400: Bad Request\n401: Unauthorized\n403: Forbidden\n404: Not Found\n500: Internal Server Error`;
                    break;

                case 'bitcoin-gen':
                    const ec_btc = new elliptic.ec('secp256k1');
                    const key_btc = ec_btc.keyFromPrivate(CryptoJS.SHA256(val || Math.random().toString()).toString(), 'hex');
                    const priv_btc = key_btc.getPrivate('hex'); const pub_btc = key_btc.getPublic(true, 'hex');
                    const sha256_pub = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(pub_btc)).toString();
                    const ripemd160_pub = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(sha256_pub)).toString();
                    const network_byte = '00' + ripemd160_pub;
                    const checksum = CryptoJS.SHA256(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(network_byte))).toString().substring(0, 8);
                    const btc_addr = b58_encode(network_byte + checksum);
                    output.textContent = `Private Key: ${priv_btc}\nAddress: ${btc_addr}`;
                    const qr_btc = document.createElement('div'); qr_btc.className = "mt-4 flex justify-center";
                    output.appendChild(qr_btc); new QRCode(qr_btc, { text: btc_addr, width: 128, height: 128 });
                    break;

                case 'qr-gen':
                    output.innerHTML = '<div id="qr"></div>';
                    new QRCode(document.getElementById('qr'), { text: val, width: 256, height: 256 });
                    return;

                // Text Tools
                case 'case-converter':
                    output.textContent = `UPPER: ${val.toUpperCase()}\nlower: ${val.toLowerCase()}\nTitle: ${val.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())}`;
                    break;
                case 'word-counter':
                    output.textContent = `Words: ${val.trim().split(/\s+/).filter(x => x).length}\nChars: ${val.length}\nLines: ${val.split('\n').length}`;
                    break;
                case 'reverse-text': output.textContent = val.split('').reverse().join(''); break;
                case 'sort-lines': output.textContent = val.split('\n').sort().join('\n'); break;
                case 'remove-duplicates': output.textContent = Array.from(new Set(val.split('\n'))).join('\n'); break;
                case 'strip-whitespace': output.textContent = val.replace(/\s+/g, ' ').trim(); break;
                case 'add-line-numbers': output.textContent = val.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'); break;
                case 'remove-empty-lines': output.textContent = val.split('\n').filter(line => line.trim()).join('\n'); break;
                case 'extract-emails': output.textContent = (val.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []).join('\n'); break;
                case 'extract-urls': output.textContent = (val.match(/https?:\/\/[^\s$.?#].[^\s]*/gi) || []).join('\n'); break;
                case 'text-to-hex-array': output.textContent = '0x' + val.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(', 0x'); break;
                case 'string-inspector':
                    output.textContent = `Length: ${val.length}\nWords: ${val.trim().split(/\s+/).length}\nLines: ${val.split('\n').length}\nUnique Chars: ${new Set(val).size}\nBytes (UTF-8): ${new TextEncoder().encode(val).length}`;
                    break;
                case 'lorem-ipsum':
                    const p = ["Lorem ipsum dolor sit amet", "consectetur adipiscing elit", "sed do eiusmod tempor incididunt", "ut labore et dolore magna aliqua", "Ut enim ad minim veniam"];
                    output.textContent = Array(5).fill().map(() => p[Math.floor(Math.random()*p.length)]).join('. ') + '.';
                    break;
                case 'lorem-markdown':
                    output.textContent = `# Lorem Ipsum\n\n## Section 1\n\nLorem ipsum **dolor sit amet**, consectetur *adipiscing elit*.\n\n* Item 1\n* Item 2\n\n[Link](https://google.com)`;
                    break;
                case 'text-speech':
                    const msg = new SpeechSynthesisUtterance(); msg.text = val;
                    window.speechSynthesis.speak(msg); output.textContent = "Speaking...";
                    break;

                default:
                    output.textContent = `Tool "${tool.title}" logic coming soon! 🚀 We are expanding to 114 tools. Stay tuned.`;
            }
        } catch (e) {
            output.textContent = "Error: " + e.message;
        }
    };

    input.addEventListener('input', process);
    if (keyInput) keyInput.addEventListener('input', process);

    if (toolId.includes('gen') || toolId.includes('uuid') || toolId.includes('lorem')) {
        const btn = document.createElement('button');
        btn.className = "bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20";
        btn.textContent = "Generate New";
        btn.onclick = process;
        options.appendChild(btn);
        process();
    }
};
