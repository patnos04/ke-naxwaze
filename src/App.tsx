import React, { useState, useEffect } from 'react';
import { Play, PlusCircle, Lock, Database, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';
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
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');
  const [pending, setPending] = useState([]);

  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür", back: "Geri" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye", back: "Vegere" }
  }[lang];

  // Admin Soruları Çekme
  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    setPending(data || []);
  };

  const approve = async (id) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  // --- GÖRÜNÜMLER ---

  // 1. ADMIN GİRİŞ VE PANELİ
  if (view === 'admin') {
    if (!isLogged) return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#0f172a] border border-white/10 p-10 rounded-[40px] w-full max-w-sm text-center shadow-2xl">
          <Lock size={48} className="mx-auto text-yellow-500 mb-6" />
          <h2 className="mb-6 font-bold">Admin Girişi</h2>
          <input type="password" placeholder="Şifre" className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center outline-none border border-white/5" onChange={e => setPass(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => setView('welcome')} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold">İPTAL</button>
            <button onClick={() => { if(pass === '1234') { setIsLogged(true); fetchPending(); } else alert("Hatalı!"); }} className="flex-1 py-4 bg-yellow-600 rounded-2xl font-bold">GİRİŞ</button>
          </div>
        </div>
      </div>
    );
    return (
      <div className="min-h-screen bg-[#070b14] text-white p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold flex items-center gap-3"><Database className="text-yellow-500"/> Onay Bekleyenler ({pending.length})</h1>
            <button onClick={() => { setIsLogged(false); setView('welcome'); }} className="text-slate-400 font-bold">Çıkış Yap</button>
          </div>
          <div className="grid gap-4">
            {pending.map(q => (
              <div key={q.id} className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex justify-between items-center">
                <p className="text-lg">{q.question_text}</p>
                <button onClick={() => approve(q.id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-colors"><CheckCircle/></button>
              </div>
            ))}
            {pending.length === 0 && <p className="text-center py-20 text-slate-500 italic">Bekleyen soru bulunamadı.</p>}
          </div>
        </div>
      </div>
    );
  }

  // 2. ANA SAYFA
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#0f172a] border border-white/10 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
          {/* Süsleme için hafif bir ışık */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-600/10 blur-[100px]"></div>
          
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-28 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" alt="Logo" />
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{t.title}</h1>
          <p className="text-yellow-500 font-bold text-[10px] tracking-[0.2em] mb-10 uppercase opacity-80">{t.subtitle}</p>
          
          <div className="flex justify-center gap-3 mb-10">
            {['ku', 'tr'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all border ${lang === l ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button className="group py-5 bg-yellow-600 hover:bg-yellow-500 rounded-[24px] font-black text-white text-xl tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
              <Play fill="white" size={24} className="group-hover:scale-110 transition-transform" /> {t.start}
            </button>
            
            <button className="py-4 bg-white/5 border border-white/10 rounded-[22px] font-bold text-slate-200 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <PlusCircle size={20}/> {t.submit}
            </button>

            {/* Gizli Admin Girişi - Küçük ve Altta */}
            <button onClick={() => setView('admin')} className="mt-6 text-slate-700 hover:text-slate-500 text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1 transition-colors">
              <Lock size={10}/> Admin Control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
