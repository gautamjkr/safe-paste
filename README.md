# 🔒 SafePaste - Privacy-First AI Clipboard Layer

> **Intercept, analyze, and redact PII/secrets before pasting into AI assistants (ChatGPT, Gemini, etc.)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

---

## 🎯 Overview

**SafePaste** is a privacy-first Chrome extension that intercepts clipboard content before it reaches AI text areas, automatically detects and redacts Personally Identifiable Information (PII) and secrets using Microsoft Presidio, and gives users control over what gets pasted.

### The Problem

When using AI assistants like ChatGPT or Google Gemini, users often paste sensitive information:
- Personal data (phone numbers, emails, SSNs)
- Financial information (credit cards, bank details)
- API keys, passwords, and tokens
- Confidential business information

**This data is sent to third-party AI services**, potentially violating privacy regulations (GDPR, HIPAA, etc.) and creating security risks.

### The Solution

SafePaste acts as a **privacy firewall** between your clipboard and AI assistants:
1. **Intercepts** paste events on AI text areas
2. **Analyzes** content using advanced NER (Named Entity Recognition)
3. **Redacts** sensitive information with placeholders
4. **Empowers** users to choose: paste masked or original
5. **Logs** only aggregated statistics (never raw secrets)

---

## 🛡️ Security Benefits

### 1. **Privacy Protection**
- **Prevents accidental data leaks**: Sensitive information is never sent to AI services unless explicitly chosen
- **GDPR/HIPAA compliance**: Helps organizations meet regulatory requirements
- **Zero-trust approach**: Assumes all AI interactions are potentially logged/stored

### 2. **Data Minimization**
- Only **aggregated counts** are stored (e.g., "5 phone numbers detected")
- **No raw secrets** are ever logged or transmitted beyond the local gateway
- **Ghost Map** (placeholder → original) exists only in browser memory

### 3. **User Control**
- **Transparent process**: Users see exactly what will be redacted before pasting
- **Override option**: Users can choose to paste original content if needed
- **Local processing**: All analysis happens on your infrastructure

### 4. **Enterprise-Ready**
- **On-premise deployment**: Run processor and gateway on your servers
- **Audit trail**: Track redaction statistics without storing sensitive data
- **Scalable architecture**: Microservices design for high availability

---

## 🏗️ Architecture

SafePaste follows a **microservices architecture** with three main components:

```
┌─────────────────┐
│ Chrome Extension│  (React + TypeScript + Vite)
│  Content Script │
└────────┬────────┘
         │ HTTP (via Background Service Worker)
         ▼
┌─────────────────┐
│  Node.js Gateway │  (Express + MongoDB)
│  Port: 8080     │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Python Processor │  (FastAPI + Presidio)
│  Port: 8001     │
└─────────────────┘
```

### Component Breakdown

#### 1. **Chrome Extension** (`/extension`)
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Manifest V3**: Modern Chrome extension architecture
- **Content Script**: Intercepts paste events on `chatgpt.com` and `gemini.google.com`
- **Ghost Overlay**: Glassmorphism UI showing redaction results
- **Background Service Worker**: Proxies API calls to avoid CORS issues

**Key Features:**
- Paste event interception with `preventDefault()`
- Real-time overlay with entity detection summary
- Ghost Map visualization (placeholder → original)
- User choice: Paste Masked or Paste Original

#### 2. **Node.js Gateway** (`/gateway`)
- **Technology**: Express.js + MongoDB + Mongoose
- **Role**: Proxy between extension and Python processor
- **Security**: Helmet.js, CORS configuration
- **Logging**: Aggregated redaction statistics (counts only, no raw data)

**Endpoints:**
- `POST /proxy/analyze` - Forward to processor for entity detection
- `POST /proxy/anonymize` - Forward to processor for anonymization + log counts
- `GET /logs/redactions` - Retrieve aggregated statistics
- `GET /health` - Health check

**Data Model:**
```javascript
{
  entity_type: String,  // e.g., "PHONE_NUMBER"
  count: Number,        // Total redactions of this type
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Python Processor** (`/processor`)
- **Technology**: FastAPI + Microsoft Presidio + spaCy
- **Role**: PII/secret detection and anonymization
- **Model**: `en_core_web_lg` (spaCy large English model)

**Endpoints:**
- `POST /analyze` - Returns detected entities (type, start, end, score)
- `POST /anonymize` - Returns masked text + Ghost Map

**Detection Capabilities:**
- Phone numbers
- Email addresses
- Credit card numbers
- Social Security Numbers (SSN)
- IP addresses
- URLs
- Dates
- Person names
- Locations
- And more (via Presidio's extensible recognizers)

**Anonymization Format:**
```
Original: "Call me at +1-555-123-4567"
Masked:   "Call me at <PHONE_NUMBER_1>"
Ghost Map: { "<PHONE_NUMBER_1>": "+1-555-123-4567" }
```

#### 4. **Dashboard** (`/dashboard`) - Optional
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Purpose**: Real-time visualization of redaction statistics
- **Features**: Auto-refresh, entity breakdown, progress bars

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (for processor)
- **Node.js 18+** (for gateway and extension/dashboard)
- **MongoDB** (local or remote instance)
- **Chrome/Chromium browser** (for extension)

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/safepaste.git
cd safepaste
```

#### 2. Start the Python Processor

```bash
cd processor
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_lg
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The processor will be available at `http://localhost:8001`

#### 3. Start the Node.js Gateway

```bash
cd gateway
npm install

# Create .env file
echo "MONGODB_URI=mongodb://127.0.0.1:27017/safepaste" > .env
echo "PROCESSOR_BASE_URL=http://localhost:8001" >> .env

npm run dev
```

The gateway will be available at `http://localhost:8080`

#### 4. Build and Load the Chrome Extension

```bash
cd extension
npm install
npm run build
```

Then in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist` folder

#### 5. (Optional) Start the Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:3000` to view redaction statistics.

---

## 📖 Usage

### Basic Workflow

1. **Navigate** to ChatGPT (`chatgpt.com`) or Gemini (`gemini.google.com`)
2. **Click** in a text area
3. **Paste** content containing PII (e.g., "My phone is +1-555-123-4567")
4. **Ghost Overlay appears** showing:
   - "X secrets detected"
   - Entity type breakdown
   - Ghost Map (placeholder → original)
5. **Choose**:
   - **Paste Masked**: Inserts redacted text (`<PHONE_NUMBER_1>`)
   - **Paste Original**: Inserts unmodified text

### Example

**Input:**
```
My phone number is +1-555-123-4567. 
Email: alice@example.com
Credit card: 4111 1111 1111 1111
```

**Masked Output:**
```
My phone number is <PHONE_NUMBER_1>. 
Email: <EMAIL_ADDRESS_1>
Credit card: <CREDIT_CARD_1>
```

**Ghost Map (in-memory only):**
```json
{
  "<PHONE_NUMBER_1>": "+1-555-123-4567",
  "<EMAIL_ADDRESS_1>": "alice@example.com",
  "<CREDIT_CARD_1>": "4111 1111 1111 1111"
}
```

---

## 🔧 Configuration

### Environment Variables

#### Gateway (`gateway/.env`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/safepaste
PROCESSOR_BASE_URL=http://localhost:8001
PORT=8080
```

#### Dashboard (`dashboard/.env`)
```env
VITE_GATEWAY_URL=http://localhost:8080
```

### Extension Configuration

The extension uses the gateway URL from the build environment or defaults to `http://localhost:8080`. To change it:

```bash
cd extension
SAFEPASTE_GATEWAY_URL=http://your-gateway:8080 npm run build
```

---

## 🧪 Testing

### Test the Processor

```bash
curl -X POST http://localhost:8001/anonymize \
  -H "Content-Type: application/json" \
  -d '{"text": "My phone is +1-555-123-4567"}'
```

### Test the Gateway

```bash
curl -X POST http://localhost:8080/proxy/anonymize \
  -H "Content-Type: application/json" \
  -d '{"text": "My phone is +1-555-123-4567"}'
```

### View Redaction Logs

```bash
curl http://localhost:8080/logs/redactions
```

---

## 📊 Dashboard Features

The dashboard provides real-time insights:

- **Total Redactions**: Cumulative count of all redactions
- **Entity Types**: Number of unique entity types detected
- **Most Redacted**: Entity type with highest count
- **Detailed Table**: Breakdown with percentages and progress bars
- **Auto-refresh**: Updates every 5 seconds

---

## 🔐 Security Considerations

### What SafePaste Does

✅ Intercepts paste events before they reach AI services  
✅ Detects PII/secrets using industry-standard NER  
✅ Provides user control over what gets pasted  
✅ Logs only aggregated statistics (never raw data)  
✅ Processes data on your infrastructure  

### What SafePaste Doesn't Do

❌ Store raw secrets or PII  
❌ Send data to third-party services (except your own gateway/processor)  
❌ Modify content without user consent  
❌ Track user behavior beyond redaction counts  

### Deployment Recommendations

1. **Run on-premise**: Deploy processor and gateway on your servers
2. **Use HTTPS**: Encrypt traffic between extension and gateway
3. **Network isolation**: Keep processor/gateway on internal networks
4. **Access control**: Implement authentication for gateway endpoints
5. **Audit logging**: Monitor redaction statistics for compliance

---

## 🛠️ Development

### Project Structure

```
safepaste/
├── extension/          # Chrome extension (React + TypeScript)
│   ├── src/
│   │   ├── contentScript.tsx
│   │   ├── background.ts
│   │   └── overlay/
│   └── dist/          # Built extension
├── gateway/            # Node.js gateway (Express)
│   └── src/
│       └── index.js
├── processor/         # Python processor (FastAPI)
│   └── main.py
└── dashboard/         # React dashboard (optional)
    └── src/
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | React 18, TypeScript, Vite, Tailwind CSS |
| Gateway | Node.js, Express, MongoDB, Mongoose |
| Processor | Python 3.10+, FastAPI, Presidio, spaCy |
| Dashboard | React 18, TypeScript, Vite, Tailwind CSS |

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Microsoft Presidio** for PII detection capabilities
- **spaCy** for NLP processing
- **FastAPI** for the Python web framework
- **React** and **Vite** for modern frontend tooling

---

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] Support for more AI platforms (Claude, Perplexity, etc.)
- [ ] Custom entity recognizers
- [ ] User-configurable redaction rules
- [ ] Export redaction statistics
- [ ] Multi-language support
- [ ] Enterprise SSO integration
- [ ] Browser extension for Firefox/Edge

---

**Built with 🔒 for privacy-first AI interactions.**

