# 🔒 SafePaste - Privacy-First AI Clipboard Layer

> **Intercept, analyze, and redact PII/secrets before pasting into AI assistants (ChatGPT, Gemini, etc.)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 Overview

**SafePaste** is a privacy-first Chrome extension that uses **aggressive client-side PII detection** to identify and redact sensitive information before it reaches AI text areas. It gives users granular control over what gets pasted, with an opt-in keyboard shortcut for maximum privacy.

### The Problem

When using AI assistants like ChatGPT or Google Gemini, users often paste sensitive information:
- Personal data (phone numbers, emails, SSNs, passport numbers)
- Financial information (credit cards, bank accounts, IBANs)
- API keys, passwords, JWT tokens, and private keys
- Cryptocurrency addresses and wallet information
- Confidential business information

**This data is sent to third-party AI services**, potentially violating privacy regulations (GDPR, HIPAA, etc.) and creating security risks.

### The Solution

SafePaste acts as a **privacy firewall** between your clipboard and AI assistants:
1. **Opt-in via Keyboard Shortcut**: Use `Ctrl+Alt+V` (or `Cmd+Alt+V` on Mac) to trigger SafePaste
2. **Aggressive Detection**: Comprehensive regex patterns detect 25+ types of sensitive data
3. **Client-side Processing**: All detection happens locally in your browser
4. **Granular Control**: Three paste options:
   - **Paste Masked**: Redact all detected entities
   - **Paste Original**: Paste without any redaction
   - **Custom Select**: Choose which entities to redact and which to keep
5. **100% Local**: No external API calls, no data transmission, no storage

---

## 🛡️ Security Benefits

### 1. **Privacy Protection**
- **Prevents accidental data leaks**: Sensitive information is never sent to AI services unless explicitly chosen
- **GDPR/HIPAA compliance**: Helps organizations meet regulatory requirements
- **Zero-trust approach**: Assumes all AI interactions are potentially logged/stored
- **Opt-in design**: Normal paste (`Ctrl+V`) works normally - SafePaste only activates when you use the shortcut

### 2. **Complete Privacy**
- **No external API calls**: All processing happens locally in your browser
- **No data transmission**: Nothing is sent to external servers
- **No database storage**: No logging or tracking of your data
- **Ghost Map** (placeholder → original) exists only in browser memory
- **No external libraries**: Self-contained detection logic for maximum security

### 3. **User Control**
- **Transparent process**: Users see exactly what will be redacted before pasting
- **Granular control**: Choose which specific entities to redact via Custom Select
- **Override option**: Users can choose to paste original content if needed
- **100% Local**: All analysis happens in your browser

### 4. **Chrome Web Store Compliant**
- **Self-contained**: All code bundled in the extension
- **No external dependencies**: Works offline, no backend required
- **Minimal permissions**: Only requests necessary permissions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Chrome/Chromium browser** (for extension)

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/safepaste.git
cd safepaste
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Build the Extension

```bash
npm run build
```

This will produce a build using Vite and output compiled scripts in the `dist/` folder.

#### 4. Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder

---

## 📖 Usage

### Keyboard Shortcut

- **Normal Paste**: `Ctrl+V` (or `Cmd+V` on Mac) - Works normally, no interception
- **SafePaste**: `Ctrl+Alt+V` (or `Cmd+Alt+V` on Mac) - Triggers SafePaste with PII detection

### Basic Workflow

1. **Navigate** to ChatGPT (`chatgpt.com`) or Gemini (`gemini.google.com`)
2. **Click** in a text area to focus it
3. **Copy** content containing PII to your clipboard
4. **Press `Ctrl+Alt+V`** (or `Cmd+Alt+V` on Mac) to trigger SafePaste
5. **Ghost Overlay appears** showing:
   - "X secrets detected"
   - Entity type breakdown
   - Three paste options
6. **Choose**:
   - **Paste Masked**: Inserts redacted text with placeholders (e.g., `<PHONE_NUMBER_1>`)
   - **Paste Original**: Inserts unmodified text
   - **Custom Select**: Opens entity selection UI where you can:
     - Check/uncheck individual entities to redact
     - Select All / Deselect All
     - Paste with your custom selection

### Example

**Input:**
```
My phone number is +1-555-123-4567. 
Email: alice@example.com
Credit card: 4532-1234-5678-9010
API Key: [EXAMPLE_API_KEY_PLACEHOLDER]
```

**Masked Output (Paste Masked):**
```
My phone number is <PHONE_NUMBER_1>. 
Email: <EMAIL_ADDRESS_1>
Credit card: <CREDIT_CARD_1>
API Key: <API_KEY_1>
```

**Custom Select:**
- User can choose to redact only the credit card and API key, keeping phone and email visible
- Or any combination of selections

**Ghost Map (in-memory only):**
```json
{
  "<PHONE_NUMBER_1>": "+1-555-123-4567",
  "<EMAIL_ADDRESS_1>": "alice@example.com",
  "<CREDIT_CARD_1>": "4532-1234-5678-9010",
  "<API_KEY_1>": "[EXAMPLE_API_KEY_PLACEHOLDER]"
}
```

---

## 🔧 Configuration

The extension is fully self-contained and requires no configuration. All PII detection happens client-side using built-in aggressive patterns.

### Permissions

The extension requests minimal permissions:
- `storage` - For potential future settings (currently unused)
- `clipboardRead` - Required to read clipboard content when using the keyboard shortcut
- `host_permissions` - Limited to:
  - `https://chatgpt.com/*`
  - `https://gemini.google.com/*`

**Note**: The extension uses an opt-in keyboard shortcut model. Normal paste (`Ctrl+V`) works normally without any interception.

---

## 🛠️ Development

### Project Structure

```
safepaste/
├── src/
│   ├── contentScript.tsx    # Main content script with keyboard shortcut handler
│   ├── piiDetector.ts       # Aggressive client-side PII detection
│   ├── background.ts        # Background service worker
│   ├── overlayMount.tsx     # Overlay mounting logic
│   └── overlay/
│       └── GhostOverlay.tsx # Overlay UI component with Custom Select
├── dist/                    # Built extension (after npm run build)
├── manifest.json            # Extension manifest
├── package.json
└── README.md
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Building

```bash
npm run build
```

The built extension will be in the `dist/` folder.

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | React 18, TypeScript, Vite, Tailwind CSS |
| PII Detection | Aggressive client-side regex patterns and heuristics |
| Build Tool | Vite |

---

## 🔐 Security Considerations

### What SafePaste Does

✅ Opt-in keyboard shortcut (`Ctrl+Alt+V`) for SafePaste  
✅ Aggressive PII detection with 25+ entity types  
✅ Detects PII/secrets using comprehensive client-side regex patterns  
✅ Provides user control over what gets pasted  
✅ Processes all data locally in your browser  
✅ Never sends data to external servers  
✅ Never stores data in databases  
✅ No external libraries - self-contained detection logic  
✅ Chrome Web Store compliant  

### What SafePaste Doesn't Do

❌ Intercept normal paste operations (`Ctrl+V` works normally)  
❌ Store raw secrets or PII  
❌ Send data to third-party services  
❌ Make external API calls  
❌ Require backend infrastructure  
❌ Track user behavior  
❌ Use external libraries (security-first approach)  

---

## 📊 Detected Entity Types

The aggressive PII detector can identify **25+ types** of sensitive information:

### Personal Information
- **Phone Numbers**: Various formats (US, international, with/without separators)
- **Email Addresses**: Standard email formats with subdomains
- **SSNs**: US Social Security Numbers (multiple formats)
- **Passport Numbers**: International passport formats
- **Driver License**: Driver license numbers
- **Date of Birth**: Specific DOB patterns
- **Person Names**: Capitalized name patterns with titles/suffixes

### Financial Information
- **Credit Cards**: Visa, Mastercard, Amex, Discover (with Luhn validation)
- **Bank Accounts**: Account numbers (8-17 digits)
- **IBAN**: International bank account numbers (with checksum validation)
- **SWIFT Codes**: Bank identifier codes
- **Bitcoin Addresses**: Legacy and Bech32 formats
- **Ethereum Addresses**: 0x-prefixed addresses

### Network & System
- **IP Addresses**: IPv4 addresses (public and private)
- **IPv6 Addresses**: IPv6 address formats
- **MAC Addresses**: Network interface addresses
- **URLs**: Web URLs and links

### Security & Authentication
- **API Keys**: Generic and service-specific (Stripe, AWS, Google)
- **Passwords**: Password fields and values
- **JWT Tokens**: JSON Web Tokens
- **AWS Keys**: AWS access key IDs and secret keys
- **Private Keys**: RSA, DSA, EC, OpenSSH, PGP private keys

### Other
- **UUIDs**: Universally unique identifiers
- **Dates**: Various date formats (ISO, US, international)
- **Locations**: Street addresses, ZIP codes, postal codes, coordinates

---

## 🧪 Testing

### Test the Extension

1. Build the extension: `npm run build`
2. Load `dist/` folder in Chrome
3. Navigate to `chatgpt.com` or `gemini.google.com`
4. Copy text containing various types of PII to clipboard
5. Press `Ctrl+Alt+V` (or `Cmd+Alt+V` on Mac) to trigger SafePaste
6. Verify the overlay appears and detection works
7. Test all three paste options:
   - Paste Masked
   - Paste Original
   - Custom Select

### Test Cases

Try pasting content with:
- Phone numbers in various formats
- Email addresses
- Credit card numbers
- API keys (Stripe, AWS, etc.)
- Private keys (RSA, SSH)
- JWT tokens
- Cryptocurrency addresses
- Bank account numbers
- Passport numbers

---

## 🐛 Troubleshooting

### Extension not working?

1. Check that the extension is enabled in `chrome://extensions`
2. Verify you're on a supported site (`chatgpt.com` or `gemini.google.com`)
3. Make sure you're using the keyboard shortcut `Ctrl+Alt+V` (not just `Ctrl+V`)
4. Check the browser console for errors (F12)
5. Ensure you're focused in a text area or contenteditable element when using the shortcut

### Detection not working?

- The detector uses aggressive regex patterns and may have some false positives
- Very short or unusual formats may not be detected
- Some false positives are possible (especially for names and dates)
- The detector prioritizes privacy protection over perfect accuracy

### Keyboard shortcut not working?

- Make sure you're pressing `Ctrl+Alt+V` (or `Cmd+Alt+V` on Mac) - not just `Ctrl+V`
- Ensure the text area is focused (click in it first)
- Check browser console for any errors
- Try reloading the extension in `chrome://extensions`

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React** and **Vite** for modern frontend tooling
- **Tailwind CSS** for styling
- **TypeScript** for type safety

---

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] Support for more AI platforms (Claude, Perplexity, etc.)
- [ ] Custom entity recognizers (user-defined patterns)
- [ ] Export redaction statistics (local only)
- [ ] Multi-language support
- [ ] Browser extension for Firefox/Edge
- [ ] Improved name detection accuracy
- [ ] Configurable detection sensitivity levels

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+V` / `Cmd+V` | Normal paste (works as usual) |
| `Ctrl+Alt+V` / `Cmd+Alt+V` | SafePaste (triggers PII detection) |

---

**Built with 🔒 for privacy-first AI interactions.**
