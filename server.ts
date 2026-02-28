import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("questions.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    optionA TEXT NOT NULL,
    optionB TEXT NOT NULL,
    optionC TEXT NOT NULL,
    optionD TEXT NOT NULL,
    answer TEXT NOT NULL,
    level INTEGER NOT NULL,
    status TEXT DEFAULT 'pending'
  )
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === "Mihriban04") {
      res.json({ success: true, token: "admin-token-123" });
    } else {
      res.status(401).json({ success: false, message: "Şîfre şaş e!" });
    }
  });

  app.post("/api/questions/submit", (req, res) => {
    const { question, options, answer, level } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO questions (question, optionA, optionB, optionC, optionD, answer, level, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `);
      stmt.run(question, options[0], options[1], options[2], options[3], answer, level);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.get("/api/questions/pending", (req, res) => {
    // In a real app, we'd check the auth token
    const questions = db.prepare("SELECT * FROM questions WHERE status = 'pending'").all();
    res.json(questions);
  });

  app.post("/api/questions/approve", (req, res) => {
    const { id } = req.body;
    try {
      db.prepare("UPDATE questions SET status = 'approved' WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/questions/reject", (req, res) => {
    const { id } = req.body;
    try {
      db.prepare("DELETE FROM questions WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.get("/api/questions/approved", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions WHERE status = 'approved'").all();
    res.json(questions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
