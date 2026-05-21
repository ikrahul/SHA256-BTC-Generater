/**
 * SHA-256 Hasher & Bitcoin Address Generator
 * Modernized Script
 */

// Initialize elliptic curve
const EC = elliptic.ec;
const ec = new EC('secp256k1');

// Base58 character set
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// QR Code Instance
let qrcodeInstance = null;

/**
 * Converts a hexadecimal string to a byte array.
 */
function hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes);
}

/**
 * Encodes a byte array into a Base58 string.
 */
function base58Encode(bytes) {
    const digits = [0];
    for (let i = 0; i < bytes.length; i++) {
        let carry = bytes[i];
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] << 8;
            digits[j] = carry % 58;
            carry = (carry / 58) | 0;
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }
    let result = '';
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) result += '1';
    for (let i = digits.length - 1; i >= 0; i--) result += BASE58_ALPHABET[digits[i]];
    return result;
}

/**
 * Parses the balance value to BTC.
 */
function parseBalance(value) {
    if (typeof value === 'number') {
        return (value / 1e8).toFixed(8);
    } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) throw new Error('Balance value is not a valid number.');
        return (parsed / 1e8).toFixed(8);
    } else {
        throw new Error('Invalid balance value type.');
    }
}

/**
 * Fetches the Bitcoin balance using the appropriate API.
 */
async function fetchBalance(address, customApiUrl = null, customApiKey = null) {
    const balanceDiv = document.getElementById('btcBalance');
    balanceDiv.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-primary-500"></i> <span class="text-slate-500">Fetching...</span>`;
    lucide.createIcons();

    try {
        let balanceBTC;
        if (customApiUrl && customApiKey) {
            const apiUrl = customApiUrl.replace('${address}', encodeURIComponent(address));
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const responseData = await response.json();
            if (!(customApiKey in responseData)) throw new Error(`Key "${customApiKey}" not found.`);
            balanceBTC = parseBalance(responseData[customApiKey]);
        } else {
            const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const balanceSatoshi = await response.text();
            balanceBTC = (parseInt(balanceSatoshi, 10) / 1e8).toFixed(8);
        }

        balanceDiv.innerHTML = `<span class="text-primary-600 dark:text-primary-400 font-bold">${balanceBTC} BTC</span>`;

        if (parseFloat(balanceBTC) > 0) {
            downloadBalanceFile(address, balanceBTC);
        }
        return balanceBTC;
    } catch (error) {
        console.error('Error fetching balance:', error);
        balanceDiv.innerHTML = `<span class="text-red-500 text-xs italic">Error fetching balance. Rate limited or invalid API.</span>`;
        return null;
    }
}

function downloadBalanceFile(address, balanceBTC) {
    const resultDiv = document.getElementById('result');
    const content = `Hash/Private Key: ${resultDiv.textContent}\nAddress: ${address}\nBalance: ${balanceBTC} BTC`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `balance_${address.substring(0, 8)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Computes the SHA-256 hash of a given message.
 */
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Performs the hashing process and updates the UI accordingly.
 */
async function performHashing() {
    const textInput = document.getElementById('inputText').value;
    const times = parseInt(document.getElementById('hashTimes').value, 10);
    const resultDiv = document.getElementById('result');
    const btcAddressDiv = document.getElementById('btcAddress');
    const btcBalanceDiv = document.getElementById('btcBalance');
    const checkBalance = document.getElementById('checkBalance').checked;
    const hashButton = document.getElementById('hashButton');

    if (!textInput) {
        resultDiv.textContent = 'Waiting for input...';
        btcAddressDiv.textContent = 'Address will appear here...';
        btcBalanceDiv.innerHTML = '<span class="text-slate-400 italic">Not checked</span>';
        updateQRCode(null);
        return;
    }

    if (times < 1) {
        resultDiv.textContent = 'Iterations must be at least 1.';
        return;
    }

    // Set loading state
    const originalBtnContent = hashButton.innerHTML;
    hashButton.disabled = true;
    hashButton.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Generating...`;
    lucide.createIcons();

    try {
        let currentHash = textInput;
        // If iterations are very high, this might block the UI thread even with await if not careful
        // but for reasonable numbers it's fine.
        // For very high numbers, we could use a Web Worker or setImmediate pattern.
        for (let i = 0; i < times; i++) {
            currentHash = await sha256(currentHash);
        }

        resultDiv.textContent = currentHash;
        generateBitcoinAddress(currentHash, btcAddressDiv, btcBalanceDiv, checkBalance);
    } finally {
        hashButton.disabled = false;
        hashButton.innerHTML = originalBtnContent;
        lucide.createIcons();
    }
}

/**
 * Generates a Bitcoin address from a given private key.
 */
function generateBitcoinAddress(privateKeyHex, displayDiv, balanceDiv, checkBalance) {
    try {
        const key = ec.keyFromPrivate(privateKeyHex, 'hex');
        const publicKey = key.getPublic(true, 'hex');
        const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey)).toString(CryptoJS.enc.Hex);
        const ripemd160Hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(sha256Hash)).toString(CryptoJS.enc.Hex);
        const networkByte = '00';
        const extendedRipemd160 = networkByte + ripemd160Hash;
        const firstSHA = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(extendedRipemd160)).toString(CryptoJS.enc.Hex);
        const secondSHA = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(firstSHA)).toString(CryptoJS.enc.Hex);
        const checksum = secondSHA.substring(0, 8);
        const binaryAddress = extendedRipemd160 + checksum;
        const addressBytes = hexToBytes(binaryAddress);
        const btcAddress = base58Encode(addressBytes);

        displayDiv.textContent = btcAddress;
        updateQRCode(btcAddress);

        if (checkBalance) {
            const useCustomApi = document.getElementById('useCustomApi').checked;
            let customApiUrl = null, customApiKey = null;
            if (useCustomApi) {
                customApiUrl = document.getElementById('customApiUrl').value.trim();
                customApiKey = document.getElementById('customApiKey').value.trim();
            }
            fetchBalance(btcAddress, customApiUrl, customApiKey);
        } else {
            balanceDiv.innerHTML = '<span class="text-slate-400 italic">Not checked</span>';
        }
    } catch (error) {
        displayDiv.textContent = 'Error generating address.';
        console.error(error);
    }
}

/**
 * Updates the QR code for the given Bitcoin address.
 */
function updateQRCode(address) {
    const qrcodeDiv = document.getElementById('qrcode');
    if (!address) {
        qrcodeDiv.innerHTML = '';
        qrcodeDiv.classList.add('bg-slate-200');
        return;
    }
    qrcodeDiv.classList.remove('bg-slate-200');
    qrcodeDiv.innerHTML = '';

    new QRCode(qrcodeDiv, {
        text: address,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

/**
 * Copies text to clipboard with a toast notification.
 */
window.copyToClipboard = function(elementId) {
    const text = document.getElementById(elementId).textContent.trim();
    if (text === 'Waiting for input...' || text === 'Address will appear here...') return;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
};

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

/**
 * Dark/Light Mode Toggle
 */
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    html.classList.toggle('dark', savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

/**
 * Fetches GitHub stars.
 */
async function fetchGitHubStars() {
    const repo = 'ikrahul/SHA256-BTC-Generater';
    const starCountSpans = document.querySelectorAll('#star-count, #footer-star-count');
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const repoData = await response.json();
        starCountSpans.forEach(span => {
            span.textContent = repoData.stargazers_count;
        });
    } catch (error) {
        console.error('Error fetching GitHub stars:', error);
        starCountSpans.forEach(span => span.textContent = 'N/A');
    }
}

/**
 * Initialize
 */
window.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    fetchGitHubStars();

    const inputText = document.getElementById('inputText');
    const hashTimes = document.getElementById('hashTimes');
    const autoUpdate = document.getElementById('autoUpdate');
    const useCustomApi = document.getElementById('useCustomApi');
    const customApiInputs = document.getElementById('customApiInputs');
    const hashButton = document.getElementById('hashButton');

    const handleInputChange = () => {
        if (autoUpdate.checked) performHashing();
    };

    inputText.addEventListener('input', handleInputChange);
    hashTimes.addEventListener('input', handleInputChange);

    autoUpdate.addEventListener('change', () => {
        if (autoUpdate.checked) performHashing();
    });

    useCustomApi.addEventListener('change', () => {
        customApiInputs.classList.toggle('hidden', !useCustomApi.checked);
    });

    hashButton.addEventListener('click', performHashing);
});
