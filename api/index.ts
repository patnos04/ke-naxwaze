import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Bağlantısı
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = process.env.PORT || 3000;

  // API: Admin Girişi
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === "Mihriban04") {
      res.json({ success: true, token: "admin-token-123" });
    } else {
      res.status(401).json({ success: false, message: "Şîfre şaş e!" });
    }
  });

  // API: Soru Gönder (Supabase'e kaydeder)
  app.post("/api/questions/submit", async (req, res) => {
    const { question, options, answer, level } = req.body;
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{ 
          question_text: question, 
          options: options, 
          correct_answer: answer, 
          difficulty: level.toString(),
          category: 'Genel'
        }]);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Onay Bekleyen Soruları Getir
  app.get("/api/questions/pending", async (req, res) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    if (error) return res.status(500).json([]);
    res.json(data);
  });

  // Vite ve Statik Dosyalar
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

  app.listen(PORT, () => {
    console.log(`Server running`);
  });
}

startServer();
