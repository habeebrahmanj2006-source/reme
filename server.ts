import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google Gen AI server-side using the correct SDK and headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Endpoint: Summarize study notes using gemini-3.5-flash
app.post("/api/ai/summarize", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { content, format } = req.body;
    if (!content) {
      res.status(400).json({ error: "Content is required for summarization." });
      return;
    }

    const systemInstruction = "You are an expert academic tutor and summarization assistant. Summarize the provided document or notes into highly-focused study key points with organized bullet points. Avoid fluff, prioritize key concepts.";
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Subject material/Notes:\n${content}\n\nRequested detail format: ${format || 'standard summary'}.\nSummarize now:`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("AI summarization failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary from AI model." });
  }
});

// API Endpoint: Smart Advice endpoint (generates personalized health/productivity score tips)
app.post("/api/ai/advice", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { stats } = req.body;
    const systemInstruction = "You are a professional life coach and health counselor. Based on the user's daily telemetry, provide one concise, encouraging, actionable tip of 2-3 sentences. Focus strictly on either their sleep, work productivity or hydration.";
    
    const telemetryText = JSON.stringify(stats || {});
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User daily telemetry stats:\n${telemetryText}\n\nGive one high-impact actionable suggestion:`,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error("AI health/productivity advice failed:", error);
    res.status(500).json({ error: error.message || "Failed to get advice from Gemini." });
  }
});

// Setup Vite Development / Static serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`REME Server listening on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server:", err);
});
