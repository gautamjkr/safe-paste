# SafePaste Processor (Python + FastAPI + Presidio)

This service performs PII/secret detection and anonymization for SafePaste using **FastAPI** and **Microsoft Presidio**.

It exposes two endpoints:

- `POST /analyze` – returns a list of detected entities.
- `POST /anonymize` – returns a masked string plus a **Ghost Map** (`placeholder -> original value`).

---

## 1. Prerequisites

- Python 3.10+ installed
- On Windows, run commands in **PowerShell** or **Command Prompt**

---

## 2. Setup (Windows-friendly)

From the project root:

```powershell
cd processor

# (Optional but recommended) Create a virtual environment
python -m venv .venv

# Activate the venv
.\.venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

If the `en_core_web_lg` model is not downloaded automatically, run:

```powershell
python -m spacy download en_core_web_lg
```

---

## 3. Fixing the "uvicorn not recognized" error

If you see:

> `uvicorn : The term 'uvicorn' is not recognized as the name of a cmdlet...`

that means `uvicorn` is not on your PATH.

The easiest fix is to run `uvicorn` **via Python**:

```powershell
cd processor
.\.venv\Scripts\activate  # if using a venv
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

This uses the `uvicorn` installed in your virtual environment without needing a global PATH entry.

---

## 4. Endpoints

### `POST /analyze`

**Request body:**

```json
{
  "text": "My phone is +1-555-123-4567 and my email is alice@example.com."
}
```

**Response:**

```json
{
  "entities": [
    { "entity_type": "PHONE_NUMBER", "start": 12, "end": 27, "score": 0.99 },
    { "entity_type": "EMAIL_ADDRESS", "start": 46, "end": 65, "score": 0.98 }
  ]
}
```

### `POST /anonymize`

**Request body:**

```json
{
  "text": "My phone is +1-555-123-4567 and my email is alice@example.com."
}
```

**Response:**

```json
{
  "masked_text": "My phone is <PHONE_NUMBER_1> and my email is <EMAIL_ADDRESS_1>.",
  "ghost_map": {
    "<PHONE_NUMBER_1>": "+1-555-123-4567",
    "<EMAIL_ADDRESS_1>": "alice@example.com"
  },
  "entities": [
    { "entity_type": "PHONE_NUMBER", "start": 12, "end": 27, "score": 0.99 },
    { "entity_type": "EMAIL_ADDRESS", "start": 46, "end": 65, "score": 0.98 }
  ]
}
```

---

## 5. Running locally

```powershell
cd processor
.\.venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at: `http://localhost:8001`


