# SafePaste Gateway (Node.js + Express)

The **Gateway** is a Node.js/Express service that:

- Proxies requests from the Chrome Extension to the Python **Processor**.
- Logs **only aggregated counts** of redacted entities (MERN-style, via MongoDB + Mongoose).

It never stores raw secrets.

---

## 1. Prerequisites

- Node.js 18+ and npm
- Local MongoDB instance (e.g. running on `mongodb://127.0.0.1:27017`)

---

## 2. Install dependencies

From the project root:

```powershell
cd gateway
npm install
```

---

## 3. Environment configuration (`.env`)

Create a file named `.env` in the `gateway` directory with:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/safepaste
PROCESSOR_BASE_URL=http://localhost:8001
```

- **`MONGODB_URI`**: points to your local MongoDB server and database `safepaste`.
- **`PROCESSOR_BASE_URL`**: URL for the Python FastAPI processor.

If `MONGODB_URI` is **not** set, the gateway will still run, but redaction logs will not be persisted.

---

## 4. Running the gateway

```powershell
cd gateway
npm run dev
```

The gateway listens by default on port **8080**:

- Health check: `GET http://localhost:8080/health`
- Proxy to analyzer: `POST http://localhost:8080/proxy/analyze`
- Proxy to anonymizer: `POST http://localhost:8080/proxy/anonymize`
- Redaction log stats: `GET http://localhost:8080/logs/redactions`

---

## 5. Example request

```bash
curl -X POST http://localhost:8080/proxy/anonymize ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"My card is 4111 1111 1111 1111\"}"
```

The gateway will:

1. Forward the text to the Python processor `/anonymize`.
2. Receive the `masked_text`, `ghost_map`, and `entities`.
3. Increment MongoDB counts per `entity_type` (no raw values stored).
4. Return the processor’s JSON response to the client.


