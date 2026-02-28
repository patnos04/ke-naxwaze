import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
const app = express();
app.use(express.json());

// Soru Gönder (Tam Uyumlu Mod)
app.post("/api/questions/submit", async (req, res) => {
  const { question, options, answer, level } = req.body;
  try {
    // Supabase'deki tablo yapına (questions) tam uyum sağlıyoruz
    const { error } = await supabase
      .from('questions')
      .insert([{ 
        question_text: question, 
        option_a: options[0], // Eğer tablonu option_a diye kurduysan burası önemli
        option_b: options[1],
        option_c: options[2],
        option_d: options[3],
        options: options,      // JSON olarak tüm liste
        correct_answer: answer, 
        difficulty: level.toString()
      }]);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
} );

// Diğer rotalar (Admin vb.) olduğu gibi kalsın
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

export default app;
