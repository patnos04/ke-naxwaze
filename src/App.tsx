import React, { useState, useEffect } from 'react';
import { Play, PlusCircle, Lock, ChevronRight, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');

  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür", admin: "ADMİN PANELİ" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye", admin: "PANELA ADMIN" }
  }[lang];

  // Soruları Veritabanından Çek
  useEffect(() => {
    async function getQuestions() {
      const { data } = await supabase.from('questions').select('*').eq('is_approved', true);
      if (data) setQuestions(data);
    }
    getQuestions();
  }, []);

  // --- OYUN EKRANI (PROFESYONEL) ---
  if (view === 'game') {
    const q = questions[currentQ];
    if (!q) return <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">Yükleniyor...</div>;

    return (
      <div className="min-h-screen bg-[#070b14] text-white p-4 font-sans flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-slate-900/50 border border-yellow-600/30 p-8 rounded-[40px] shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase">SORU {currentQ + 1} / {questions.length}</span>
            <h2 className="text-2xl font-bold mt-4 leading-tight">{q.question_text}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => (
              <button 
                key={i}
                onClick={() => {
                  if (opt === q.correct_answer) {
                    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
                    else alert("TEBRİKLER! TÜM SORULARI BİLDİNİZ!");
                  } else {
                    alert("Yanlış Cevap! Tekrar Deneyin.");
                    setView('welcome');
                    setCurrentQ(0);
                  }
                }}
                className="group relative p-5 bg-slate-800/50 border border-white/10 rounded-2xl text-left hover:border-yellow-500 transition-all active:scale-95"
              >
                <span className="text-yellow-500 font-bold mr-3">{String.fromCharCode(65 + i)}:</span>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setView('welcome')} className="mt-10 text-slate-500 flex items-center gap-2 mx-auto"><ArrowLeft size={16}/> Vazgeç</button>
        </div>
      </div>
    );
  }

  // --- ANA SAYFA (AI STUDIO TASARIMI) ---
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans selection:bg-yellow-500/30">
      <div className="w-full max-w-md">
        <div className="relative bg-slate-900/40 border border-white/10 p-10 rounded-[56px] shadow-2xl backdrop-blur-xl text-center overflow-hidden">
          {/* Neon Efektleri */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-600/10 blur-[100px] rounded-full"></div>
          
          <img 
            src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
            className="h-32 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 transition-transform duration-500" 
            alt="Logo" 
          />
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
            {t.title}
          </h1>
          <p className="text-yellow-500 font-bold text-[10px] tracking-[0.3em] mb-10 uppercase opacity-70">
            {t.subtitle}
          </p>

          <div className="flex justify-center gap-2 mb-10">
            {['ku', 'tr'].map((l) => (
              <button 
                key={l} 
                onClick={() => setLang(l)} 
                className={`px-6 py-2 rounded-2xl text-xs font-black transition-all border ${lang === l ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setView('game')}
              className="group py-5 bg-yellow-600 hover:bg-yellow-500 rounded-[28px] font-black text-white text-xl tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Play fill="white" size={24} className="group-hover:translate-x-1 transition-transform" /> 
              {t.start}
            </button>
            
            <button className="py-4 bg-white/5 border border-white/10 rounded-[22px] font-bold text-slate-200 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <PlusCircle size={20}/> {t.submit}
            </button>

            <button 
              onClick={() => {
                const p = prompt("Admin Şifresi:");
                if(p === "Mihriban04") alert("Soru onaylama paneli aktif (Geliştirme aşamasında)");
                else if(p) alert("Hatalı Şifre!");
              }}
              className="mt-6 text-slate-700 hover:text-slate-500 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <Lock size={12}/> {t.admin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
