import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side persistent storage for multi-device sync (laptop & phone)
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "journal_store.json");

function getStoredData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Fout bij lezen store:", err);
  }
  return { entries: [], settings: null };
}

function saveStoredData(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Fout bij wegschrijven store:", err);
  }
}

// Data synchronization endpoints for cross-device support
app.get("/api/entries", (req, res) => {
  const data = getStoredData();
  res.json({ entries: data.entries || [] });
});

app.post("/api/entries", (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: "Invalid entries array" });
  }
  const currentData = getStoredData();
  currentData.entries = entries;
  saveStoredData(currentData);
  res.json({ status: "ok", count: entries.length });
});

app.get("/api/settings", (req, res) => {
  const data = getStoredData();
  res.json({ settings: data.settings || null });
});

app.post("/api/settings", (req, res) => {
  const { settings } = req.body;
  const currentData = getStoredData();
  currentData.settings = settings;
  saveStoredData(currentData);
  res.json({ status: "ok" });
});

// Lazy AI Client initializer
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    } catch (err) {
      console.error("Fout bij initialiseren Gemini AI:", err);
    }
  }
  return aiClient;
}

// 1. AI Journal Prompts endpoint
app.post("/api/ai/prompt", async (req, res) => {
  try {
    const { category, currentText } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Intelligente fallback prompts in het Nederlands
      const fallbackPrompts = [
        "Waar ben je vandaag het meest dankbaar voor en waarom gaf dat je energie?",
        "Wat was een klein moment van rust of verwondering tijdens je dag?",
        "Welke uitdaging kwam je tegen, en wat leerde je over je eigen reactie daarop?",
        "Als je vandaag één ding kon herbeleven of juist veranderen, wat zou dat zijn?",
        "Wie heeft vandaag een positieve invloed op je gehad, en heb je dat diegene laten weten?",
      ];
      const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
      return res.json({ prompt: randomPrompt, source: "fallback" });
    }

    const systemInstruction =
      "Je bent een empathische, inspirerende mindfulness- en dagboekcoach. Genereer precies één gerichte, prikkelende en warme vraag of schrijfinspiratie (journal prompt) in het Nederlands. Houd het beknopt (1-2 zinnen), uitnodigend en introspectief.";
    
    let promptContent = "Bedenk een inspirerende vraag om over te schrijven in een persoonlijk dagboek.";
    if (category) {
      promptContent += ` Thema: ${category}.`;
    }
    if (currentText) {
      promptContent += ` De gebruiker is al begonnen met: "${currentText.slice(0, 300)}...". Help de gebruiker verder na te denken.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const generatedPrompt = response.text?.trim() || "Waar sta je vandaag even bij stil?";
    return res.json({ prompt: generatedPrompt, source: "gemini" });
  } catch (error) {
    console.error("AI Prompt fout:", error);
    return res.status(500).json({
      error: "Kon geen prompt genereren",
      fallback: "Welke gedachte of gebeurtenis bleef vandaag het langst in je hoofd hangen?",
    });
  }
});

// 2. AI Emotion & Mood Analysis endpoint
app.post("/api/ai/analyze-mood", async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Geen tekst opgegeven voor analyse" });
    }

    const ai = getAIClient();

    if (!ai) {
      // Heuristic fallback mood detectie
      const lower = text.toLowerCase();
      let mood = "Kalm";
      let emoji = "🌿";
      let sentiment = "Neutraal";

      if (lower.includes("blij") || lower.includes("vrolijk") || lower.includes("geweldig") || lower.includes("succes") || lower.includes("feest") || lower.includes("trots")) {
        mood = "Vreugdevol";
        emoji = "☀️";
        sentiment = "Positief";
      } else if (lower.includes("moe") || lower.includes("stress") || lower.includes("druk") || lower.includes("spanning") || lower.includes("zorgen")) {
        mood = "Gestrest";
        emoji = "🌧️";
        sentiment = "Spanning";
      } else if (lower.includes("dankbaar") || lower.includes("liefde") || lower.includes("warm") || lower.includes("fijn") || lower.includes("gezellig")) {
        mood = "Dankbaar";
        emoji = "💖";
        sentiment = "Positief";
      } else if (lower.includes("focus") || lower.includes("werk") || lower.includes("studie") || lower.includes("productief")) {
        mood = "Gefocust";
        emoji = "💻";
        sentiment = "Productief";
      } else if (lower.includes("nadenken") || lower.includes("twijfel") || lower.includes("waarom") || lower.includes("misschien")) {
        mood = "Peinzend";
        emoji = "🤔";
        sentiment = "Reflectief";
      }

      return res.json({
        mood,
        emoji,
        sentiment,
        insight: "Mooie reflectie vastgelegd in je dagboek.",
        source: "heuristic",
      });
    }

    const promptText = `Analyseer het volgende dagboekbericht en bepaal de stemming en emotionele ondertoon.
Titel: ${title || "Geen titel"}
Tekst:
"""
${text}
"""

Geef het antwoord in strict JSON-formaat met de volgende structuur:
{
  "mood": "één woord in het Nederlands, bijv. Kalm, Vreugdevol, Dankbaar, Gefocust, Peinzend, Gestrest, Melancholisch, Energiek of Opgelucht",
  "emoji": "één bijpassende emoji",
  "sentiment": "Positief | Neutraal | Zorgelijk | Reflectief | Energiek",
  "insight": "één korte bemoedigende of inzichtelijke zin van max 15 woorden over de emotie in dit bericht"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      mood: parsed.mood || "Kalm",
      emoji: parsed.emoji || "✨",
      sentiment: parsed.sentiment || "Neutraal",
      insight: parsed.insight || "Inzicht vastgelegd.",
      source: "gemini",
    });
  } catch (error) {
    console.error("AI Mood Analyse fout:", error);
    return res.json({
      mood: "Kalm",
      emoji: "🌿",
      sentiment: "Neutraal",
      insight: "Fijn dat je de tijd hebt genomen om te schrijven.",
      source: "fallback",
    });
  }
});

// 3. AI Weekly Summary & Reflection endpoint
app.post("/api/ai/weekly-summary", async (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "Geen dagboekberichten gevonden voor een samenvatting" });
    }

    const ai = getAIClient();

    if (!ai) {
      return res.json({
        summary: "Je hebt de afgelopen week mooie momenten vastgelegd. Je reflecties tonen rust en toewijding aan persoonlijke groei.",
        keyThemes: ["Persoonlijke groei", "Rust & Natuur", "Productiviteit"],
        moodTrend: "Overwegend kalm en evenwichtig",
        encouragement: "Blijf elke dag een paar minuten stilstaan bij hoe je je voelt!",
        source: "fallback",
      });
    }

    const compiledText = entries
      .slice(0, 15)
      .map((e: any, idx: number) => `[Bericht ${idx + 1} - ${e.date || "onbekende datum"} | Stemming: ${e.mood || "onbekend"}]: ${e.title ? e.title + " - " : ""}${e.content}`)
      .join("\n\n");

    const promptText = `Hier zijn de dagboekberichten van de afgelopen week:
${compiledText}

Schrijf een warme, empathische en opbouwende wekelijkse AI-samenvatting in het Nederlands. Analyseer de rode draad, emotionele ontwikkelingen en hoogtepunten.
Geef je antwoord strikt als JSON met:
{
  "summary": "Een vloeiende samenvattende paragraaf (circa 2-4 zinnen) die de week treffend omschrijft.",
  "keyThemes": ["thema 1", "thema 2", "thema 3"],
  "moodTrend": "Korte beschrijving van de stemmingstrend over de week",
  "encouragement": "Een warme, inspirerende zin voor de komende week"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      summary: parsed.summary || "Je hebt waardevolle gedachten en ervaringen toevertrouwd aan je dagboek deze week.",
      keyThemes: parsed.keyThemes || ["Reflectie", "Herinneringen"],
      moodTrend: parsed.moodTrend || "Stabiel en reflectief",
      encouragement: parsed.encouragement || "Ga zo door met je dagelijkse reflectiemoment!",
      source: "gemini",
    });
  } catch (error) {
    console.error("AI Wekelijkse samenvatting fout:", error);
    return res.status(500).json({
      error: "Kon wekelijkse samenvatting niet genereren",
      fallback: "Je week kende waardevolle reflectiemomenten.",
    });
  }
});

const MOTIVATIONAL_FALLBACK_QUOTES = [
  {
    text: "Geluk in je leven hangt af van de kwaliteit van je gedachten.",
    author: "Marcus Aurelius",
    theme: "Zelfreflectie",
    reflection: "Welke gedachte bracht je vandaag rust of juist onrust?",
  },
  {
    text: "We lijden vaker in onze verbeelding dan in de werkelijkheid.",
    author: "Seneca",
    theme: "Gemoedsrust",
    reflection: "Welke zorg van vandaag bleek achteraf minder zwaar dan je dacht?",
  },
  {
    text: "Een reis van duizend mijl begint met een enkele stap.",
    author: "Lao Tzu",
    theme: "Beginnen",
    reflection: "Welke kleine stap kun je vandaag zetten voor jezelf?",
  },
  {
    text: "Wat je zoekt, zoekt ook jou.",
    author: "Rumi",
    theme: "Verlangen",
    reflection: "Waar verlangt je hart op dit moment het meest naar?",
  },
  {
    text: "Dankbaarheid verandert wat we hebben in genoeg.",
    author: "Aesopus",
    theme: "Dankbaarheid",
    reflection: "Noem drie eenvoudige dingen waar je vandaag dankbaar voor bent.",
  },
  {
    text: "Niet wat je overkomt bepaalt je leven, maar hoe je erop reageert.",
    author: "Epictetus",
    theme: "Veerkracht",
    reflection: "Hoe reageerde je vandaag op een onverwachte gebeurtenis?",
  },
  {
    text: "De beste tijd om een boom te planten was 20 jaar geleden. De op één na beste tijd is nu.",
    author: "Chinees Spreekwoord",
    theme: "Daadkracht",
    reflection: "Welke kans kun je vandaag direct met beide handen aangrijpen?",
  },
  {
    text: "Moed is niet de afwezigheid van angst, maar het besef dat iets anders belangrijker is.",
    author: "Nelson Mandela",
    theme: "Moed",
    reflection: "Waar heb je vandaag een beetje extra moed voor nodig?",
  },
];

// 4. Daily Wisdom & AI Quote endpoint
app.post("/api/ai/quote", async (req, res) => {
  const { theme } = req.body || {};
  try {
    const ai = getAIClient();

    if (!ai) {
      const selected = MOTIVATIONAL_FALLBACK_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_FALLBACK_QUOTES.length)];
      return res.json({
        ...selected,
        id: `quote-${Date.now()}`,
        source: "fallback",
      });
    }

    const aiPromise = (async () => {
      const promptText = `Genereer één krachtige, energieke en motiverende spreuk (dagelijkse wijsheid of motiverend citaat) in het Nederlands. Deze spreuk is bedoeld om iemand positief, doelgericht en vol energie te motiveren voor de dag (denk aan thema's als actie, moed, veerkracht, kansen grijpen, doorzettingsvermogen en zelfvertrouwen). Dit kan een bekend citaat zijn van een groot denker, leider of filosoof, of een krachtige hedendaagse motiverende wijsheid.
${theme ? `Thema: ${theme}.` : "Thema: Dagelijkse Motivatie & Energie."}

Geef je antwoord strikt als JSON:
{
  "text": "De motiverende spreuk zelf (krachtig, beknopt, 1 tot 2 zinnen, zonder aanhalingstekens)",
  "author": "De auteur of bron (bijv. Marcus Aurelius, Steve Jobs, Eleanor Roosevelt, Seneca, Nelson Mandela, etc.)",
  "theme": "Eén woord voor het motiverende thema (bijv. Moed, Daadkracht, Focus, Veerkracht, Energie)",
  "reflection": "Eén korte motiverende gedachte of vraag van maximaal 15 woorden om de dag krachtig te starten"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      let rawText = response.text || "{}";
      rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(rawText);
      return {
        id: `quote-${Date.now()}`,
        text: parsed.text || "Geluk in je leven hangt af van de kwaliteit van je gedachten.",
        author: parsed.author || "Marcus Aurelius",
        theme: parsed.theme || "Zelfreflectie",
        reflection: parsed.reflection || "Wat betekent deze spreuk voor jou vandaag?",
        source: "gemini",
      };
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), 3500)
    );

    const quote = (await Promise.race([aiPromise, timeoutPromise])) as any;
    return res.json(quote);
  } catch (error) {
    console.error("AI Quote endpoint fallback:", error);
    const selected = MOTIVATIONAL_FALLBACK_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_FALLBACK_QUOTES.length)];
    return res.json({
      ...selected,
      id: `quote-${Date.now()}`,
      source: "fallback",
    });
  }
});

// Vite middleware setup
async function startServer() {
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
    console.log(`Server draait op http://0.0.0.0:${PORT}`);
  });
}

startServer();
