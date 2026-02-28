/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, Users, Phone, Split, XCircle, CheckCircle2, Loader2,
  Play, PlusCircle, Lock, Database, ArrowLeft, Trash2, CheckCircle
} from 'lucide-react';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const TRANSLATIONS = {
  ku: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye",
    start: "DEST PÊ BIKE",
    submit_q: "Pirsê Bişîne",
    admin: "Ketina Admin",
    back: "Vegere"
  },
  tr: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "İzmir Patnoslular Derneği Ürünüdür",
    start: "BAŞLA",
    submit_q: "Soru Gönder",
    admin: "Admin Girişi",
    back: "Geri"
  },
  en: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Product of Izmir Patnos Association",
    start: "START GAME",
    submit_q: "Submit Question",
    admin: "Admin Login",
    back: "Back"
  }
};

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');
  const [pending, setPending] = useState([]);
  
  const t = TRANSLATIONS[lang];

  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    setPending(data || []);
  };

  const approve = async (id) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  if (view === 'admin') {
    if (!isLogged) return (
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-white font-sans">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[40px] w-full max-w-sm text-center">
            <Lock size={48} className="mx-auto text-yellow-500 mb-6" />
            <input type="password" placeholder="Şifre" className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center outline-none border border-white/5" onChange={e => setPass(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setView('welcome')} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold uppercase">İptal</button>
              <button onClick={() => { if(pass === '1234') { setIsLogged(true); fetchPending(); } else alert("Şifre Yanlış!"); }} className="flex-1 py-4 bg-yellow-600 rounded-2xl font-bold uppercase">Giriş</button>
            </div>
          </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-[#070b14] text-white p-6 font-sans">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-bold flex items-center gap-3"><Database className="text-yellow-500"/> Sorular ({pending.length})</h1>
              <button onClick={() => setView('welcome')} className="text-slate-400">Geri Dön</button>
            </div>
            <div className="grid gap-4">
              {pending.map(q => (
                <div key={q.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
                  <p>{q.question_text}</p>
                  <button onClick={() => approve(q.id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl"><CheckCircle/></button>
                </div>
              ))}
              {pending.length === 0 && <p className="text-center py-20 text-slate-500">Bekleyen soru yok.</p>}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="bg-slate-900/60 border border-white/10 p-10 rounded-[48px] shadow-2xl backdrop-blur-md">
          <img 
            src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
            className="h-28 mx-auto mb-8 drop-shadow-lg" 
            alt="Logo" 
          />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{t.title}</h1>
          <p className="text-yellow-500 font-bold text-xs tracking-wider mb-10 uppercase opacity-80">{t.subtitle}</p>
          
          <div className="flex justify-center gap-2 mb-10">
            {['ku', 'tr', 'en'].map((l) => (
              <button 
                key={l} 
                onClick={() => setLang(l)} 
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${lang === l ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-slate-400 border-white/5'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button className="py-5 bg-yellow-600 rounded-[24px] font-black text-white text-lg tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
              <Play fill="white" size={24} /> {t.start}
            </button>
            <button className="py-4 bg-white/5 border border-white/10 rounded-[20px] font-bold text-slate-200 flex items-center justify-center gap-2">
              <PlusCircle size={20}/> {t.submit_q}
            </button>
            <button onClick={() => setView('admin')} className="text-slate-600 text-[10px] mt-6 uppercase tracking-widest font-bold">
              <Lock size={10}/> Admin Control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
