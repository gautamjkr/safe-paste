require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*", // tighten this once you have specific origins for the extension/dashboard
  })
);
app.use(express.json());

// --- MongoDB / Mongoose setup (Redaction Log) ---
const mongoUri = process.env.MONGODB_URI || "";

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB for redaction logs");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
} else {
  console.warn(
    "MONGODB_URI not set. Redaction logs will not be persisted until configured."
  );
}

const redactionLogSchema = new mongoose.Schema(
  {
    entity_type: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const RedactionLog =
  mongoose.models.RedactionLog ||
  mongoose.model("RedactionLog", redactionLogSchema);

// --- Configuration for Python Processor ---
const PROCESSOR_BASE_URL =
  process.env.PROCESSOR_BASE_URL || "http://localhost:8001";

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "safepaste-gateway" });
});

/**
 * POST /proxy/analyze
 * Forwards text to the Python processor /analyze endpoint.
 */
app.post("/proxy/analyze", async (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string") {
    return res.status(400).json({ error: "Field 'text' is required" });
  }

  try {
    const response = await axios.post(`${PROCESSOR_BASE_URL}/analyze`, {
      text,
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error proxying /analyze to processor:", err.message);
    res.status(502).json({ error: "Processor unavailable" });
  }
});

/**
 * POST /proxy/anonymize
 * Forwards text to the Python processor /anonymize endpoint,
 * and updates the RedactionLog with counts per entity type.
 *
 * Note: We NEVER store the raw secret, only aggregated counts by type.
 */
app.post("/proxy/anonymize", async (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string") {
    return res.status(400).json({ error: "Field 'text' is required" });
  }

  try {
    const response = await axios.post(`${PROCESSOR_BASE_URL}/anonymize`, {
      text,
    });

    const data = response.data;

    // entities: [{ entity_type, start, end, score }]
    if (Array.isArray(data.entities) && mongoUri) {
      const increments = data.entities.reduce((acc, ent) => {
        const type = ent.entity_type;
        if (!acc[type]) acc[type] = 0;
        acc[type] += 1;
        return acc;
      }, {});

      // Fire-and-forget updates; we don't block the main response on DB latency
      Object.entries(increments).forEach(([entity_type, increment]) => {
        RedactionLog.findOneAndUpdate(
          { entity_type },
          { $inc: { count: increment } },
          { upsert: true, new: true }
        ).catch((err) => {
          console.error("Failed to update RedactionLog", entity_type, err);
        });
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Error proxying /anonymize to processor:", err.message);
    res.status(502).json({ error: "Processor unavailable" });
  }
});

// Optional: endpoint for dashboard to read aggregate redaction stats
app.get("/logs/redactions", async (req, res) => {
  if (!mongoUri) {
    return res.status(503).json({
      error: "Redaction logging not configured (MONGODB_URI missing).",
    });
  }

  try {
    const logs = await RedactionLog.find({}).lean();
    res.json({ logs });
  } catch (err) {
    console.error("Failed to fetch redaction logs", err);
    res.status(500).json({ error: "Failed to fetch redaction logs" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`SafePaste gateway listening on port ${PORT}`);
});


