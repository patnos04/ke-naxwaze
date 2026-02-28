import React, { useState, useEffect } from 'react';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// --- VERİTABANI BAĞLANTISI ---
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
  const [pending, setPending] = useState([]);

  // Dil Çevirileri
  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür", admin: "ADMİN PANELİ", back: "Geri Dön" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye", admin: "PANELA ADMIN", back: "Vegere" }
  }[lang === 'ku' ? 'ku' : 'tr'];

  // Soruları Supabase'den Çek
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase.from('questions').select('*').eq('is_approved', true);
      if (data) setQuestions(data);
    };
    fetchQuestions();
  }, []);

  // --- ADMIN: ONAY BEKLEYENLERİ ÇEK ---
  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    setPending(data || []);
  };

  const approveQ = async (id: any) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  // --- GÖRÜNÜM: OYUN EKRANI ---
  if (view === 'game') {
    const q = questions[currentQ];
    if (!q) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Sorular Yükleniyor...</div>;
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900/80 p-8 rounded-[40px] border border-yellow-600/30 text-center">
          <div className="text-yellow-500 font-bold mb-4 uppercase tracking-widest text-xs">Soru {currentQ + 1}</div>
          <h2 className="text-2xl font-bold mb-8">{q.question_text}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => (
              <button key={i} onClick={() => {
                if(opt === q.correct_answer) {
                  if(currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
                  else { alert("Tebrikler!"); setView('welcome'); }
                } else { alert("Yanlış!"); setView('welcome'); }
              }} className="p-5 bg-slate-800 border border-white/5 rounded-2xl hover:border-yellow-500 text-left">
                <span className="text-yellow-600 font-bold mr-2">{String.fromCharCode(65+i)}:</span> {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setView('welcome')} className="mt-8 text-slate-500 text-sm italic">{t.back}</button>
        </div>
      </div>
    );
  }

  // --- GÖRÜNÜM: ADMIN PANELİ ---
  if (view === 'admin') {
    if (!isLogged) return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <div className="bg-slate-900 p-10 rounded-[40px] border border-white/10 text-center">
          <h2 className="mb-6 font-bold uppercase tracking-widest">Mihriban Girişi</h2>
          <input type="password" placeholder="Şifreniz" className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center border-none outline-none" onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'Mihriban04') { setIsLogged(true); fetchPending(); } else alert("Hatalı!"); }} className="w-full py-4 bg-yellow-600 rounded-2xl font-bold">GİRİŞ YAP</button>
          <button onClick={() => setView('welcome')} className="mt-4 text-slate-500 block w-full text-xs">Vazgeç</button>
        </div>
      </div>
    );
    return (
      <div className="min-h-screen bg-[#070b14] text-white p-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-yellow-500">Onay Bekleyen Sorular ({pending.length})</h1>
            <div className="grid gap-4">
              {pending.map((q:any) => (
                <div key={q.id} className="bg-slate-900 p-6 rounded-2xl flex justify-between items-center border border-white/5">
                  <p>{q.question_text}</p>
                  <button onClick={() => approveQ(q.id)} className="bg-green-600 px-6 py-2 rounded-xl font-bold">ONAYLA</button>
                </div>
              ))}
              {pending.length === 0 && <p className="text-slate-500 italic">Onay bekleyen soru yok.</p>}
            </div>
            <button onClick={() => { setIsLogged(false); setView('welcome'); }} className="mt-10 text-slate-400">Panelden Çık</button>
        </div>
      </div>
    );
  }

  // --- GÖRÜNÜM: ANA SAYFA ---
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="bg-slate-900/60 border border-white/10 p-10 rounded-[48px] shadow-2xl backdrop-blur-md">
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-28 mx-auto mb-8 drop-shadow-lg" alt="Logo" />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{t.title}</h1>
          <p className="text-yellow-500 font-bold text-[10px] tracking-widest mb-10 uppercase opacity-70">{t.subtitle}</p>
          
          <div className="flex justify-center gap-2 mb-10">
            {['ku', 'tr'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-5 py-2 rounded-xl text-xs font-black border ${lang === l ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => setView('game')} className="py-5 bg-yellow-600 rounded-[24px] font-black text-white text-xl shadow-xl active:scale-95 transition-transform uppercase">
              {t.start}
            </button>
            <button onClick={() => alert("Soru gönderme formu hazırlanıyor...")} className="py-4 bg-white/5 border border-white/10 rounded-[20px] font-bold text-slate-200">
              {t.submit}
            </button>
            <button onClick={() => setView('admin')} className="text-slate-700 text-[10px] mt-6 uppercase tracking-widest font-bold">
              🔒 {t.admin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
