# SHA-256 Hasher & Bitcoin Address Generator

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Security Precautions](#security-precautions)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

**SHA-256 Hasher & Bitcoin Address Generator** is a convenient and secure web application that allows users to generate SHA-256 hashes and corresponding Bitcoin addresses derived from user-provided passphrases. Designed to operate entirely offline, this tool ensures that sensitive information such as passphrases and private keys remain secure on the user's device.

## Features

- **SHA-256 Hashing:** Generate SHA-256 hashes of your input text with customizable hashing iterations.
- **Bitcoin Address Generation:** Convert SHA-256 hashes into Bitcoin addresses using the secp256k1 elliptic curve.
- **Balance Checking:** Optionally check the Bitcoin balance of the generated address.
- **Auto-Update:** Automatically update hashes and addresses as you modify your input.
- **Offline Operation:** Ensures maximum security by processing all data locally within your browser.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Demo

Experience the application firsthand by visiting the [Live Demo](https://ikrahul.github.io/SHA256-BTC-Generater/)

## Installation

To run the **SHA-256 Hasher & Bitcoin Address Generator** locally, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ikrahul/SHA256-BTC-Generater.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd SHA256-BTC-Generater
   ```

3. **Open the Application**

   - Open the `index.html` file in your preferred web browser.
   - You can do this by double-clicking the `index.html` file or by using the command line:

## Usage

1. **Enter Text to Hash**

   - Input the text or passphrase you wish to hash in the **"Text to Hash"** field.

2. **Set Hashing Iterations**

   - Specify the number of times you want to apply the SHA-256 hash in the **"Number of Times to Hash"** field. The default value is `1`.

3. **Select Options**

   - **Auto-update Hash:** Enable this option to automatically update the hash and Bitcoin address as you modify your input.
   - **Check Balance:** Enable this to fetch and display the Bitcoin balance of the generated address.

4. **Generate Hash and Address**

   - Click the **"Hash"** button to generate the SHA-256 hash and the corresponding Bitcoin address.

5. **View Results**

   - The generated SHA-256 hash, Bitcoin address, and optionally the Bitcoin balance will be displayed below the input fields.

## Security Precautions

While the **SHA-256 Hasher & Bitcoin Address Generator** is designed with security in mind, it's crucial to follow best practices to ensure the safety of your data:

1. **Use Strong Passphrases**

   - When generating a Bitcoin address (brainwallet), ensure that your passphrase is long, complex, and random. Weak passphrases can be susceptible to brute-force attacks, potentially compromising your Bitcoin wallet.

2. **Offline Usage Recommended**

   - For optimal security, use the application in an offline environment. Although the application performs computations locally, certain features like fetching Bitcoin balances and GitHub stars require internet access. Consider disabling these features when operating offline.

3. **Do Not Use for Significant Funds**

   - **This tool is intended for educational and experimental purposes.** If you plan to manage substantial Bitcoin holdings, use reputable and well-audited wallet solutions.

4. **Browser Security**

   - Ensure that your browser is up-to-date to protect against known vulnerabilities. Avoid using the application in browsers with questionable security practices.

5. **Private Key Confidentiality**

   - The generated Bitcoin address is derived from a private key based on your input. **Never share your private key or passphrase with anyone.** If someone gains access to your private key, they can control your Bitcoin funds.

6. **Clear Input After Use**

   - After generating your hash and Bitcoin address, clear the input fields and close the browser tab to prevent potential exposure of your sensitive data.

## Technologies Used

- **HTML5 & CSS3:** Structure and styling of the web application.
- **JavaScript:** Core functionality including hashing and Bitcoin address generation.
- **[Elliptic](https://github.com/indutny/elliptic):** JavaScript library for elliptic curve cryptography.
- **[Crypto-JS](https://github.com/brix/crypto-js):** JavaScript library for cryptographic algorithms.
- **[Blockchain.info API](https://www.blockchain.com/api/blockchain_api):** Fetching Bitcoin address balances.
- **CDNs:** External libraries are included via Content Delivery Networks for efficient loading.

## Contributing

Contributions are welcome! If you'd like to enhance the **SHA-256 Hasher & Bitcoin Address Generator**, please follow these steps:

1. **Fork the Repository**

   Click the [Fork](https://github.com/ikrahul/SHA256-BTC-Generater/fork) button at the top right of this page.

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

   Navigate to the original repository and click the **"Compare & pull request"** button.

### Bug Reports and Feature Requests

- Please open an [issue](https://github.com/ikrahul/SHA256-BTC-Generater/issues) to report any bugs or request new features. Provide as much detail as possible to assist in the troubleshooting process.

## License

This project is licensed under the [MIT License](https://github.com/ikrahul/SHA256-BTC-Generater/blob/main/LICENSE). You are free to use, modify, and distribute this software with proper attribution.

## Contact

**Rahul Ban**

- **Email:** [rahulban@live.in](mailto:rahulban@live.in)
- **GitHub:** [ikrahul](https://github.com/ikrahul)
- **Support:** [1PqDbd9XRmEGfwYK6rnsYYTshdb3PguKuG](bitcoin:1PqDbd9XRmEGfwYK6rnsYYTshdb3PguKuG)
Feel free to reach out for any queries, feedback, or collaborations!

---
© 2024 Rahul Ban. All rights reserved.