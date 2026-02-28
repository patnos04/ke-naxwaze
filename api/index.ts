import express from "express";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
const app = express();
app.use(express.json());

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

// Admin ve listeleme için gerekirse (Opsiyonel)
app.get("/api/questions/pending", async (req, res) => {
  const { data, error } = await supabase.from('questions').select('*');
  if (error) return res.status(500).json([]);
  res.json(data);
});

export default app;
