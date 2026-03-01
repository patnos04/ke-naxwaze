import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required.");
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

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

  app.post("/api/questions/submit", async (req, res) => {
    const { question, options, answer, level } = req.body;
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("questions")
        .insert([
          { 
            question, 
            optionA: options[0], 
            optionB: options[1], 
            optionC: options[2], 
            optionD: options[3], 
            answer, 
            level, 
            status: 'pending' 
          }
        ]);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.get("/api/questions/pending", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("status", "pending");
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post("/api/questions/approve", async (req, res) => {
    const { id } = req.body;
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("questions")
        .update({ status: "approved" })
        .eq("id", id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post("/api/questions/reject", async (req, res) => {
    const { id } = req.body;
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.get("/api/questions/approved", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("status", "approved");
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
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
