/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Phone, Split, XCircle, CheckCircle2, Loader2,
  ChevronRight, RotateCcw, Play, X, List, Timer, Clock,
  PlusCircle, Lock, Database, ArrowLeft, Trash2, CheckCircle
} from 'lucide-react';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// --- OYUN SABİTLERİ (SENİN ORİJİNAL KODUNDAN) ---
const RANK_TITLES = {
  ku: ["Nûhat", "Zana", "Pispor", "Ustad", "Dahî", "Serzan", "Zanyar", "Mamoste", "Aqilmend", "Zîrek", "Sîmurg", "Bêhempa"],
  tr: ["Çaylak", "Bilgin", "Uzman", "Üstad", "Deha", "Ordinaryüs", "Alim", "Hoca", "Bilge", "Zeki", "Anka", "Eşsiz"],
  en: ["Novice", "Scholar", "Expert", "Master", "Genius", "Academic", "Sage", "Professor", "Wise", "Brilliant", "Phoenix", "Unique"]
};

const TRANSLATIONS = {
  ku: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye",
    start: "DEST PÊ BIKE",
    submit_q: "Pirsê Bişîne",
    admin: "Ketina Admin",
    back: "Vegere",
    loading: "Pirs tê amadekirin...",
    correct: "PÎROZ BE!",
    wrong: "MIXABIN!",
    time_up: "WEXT QEDIYA!",
    play_again: "DÎSA BILÎZE",
    correct_answer: "Bersiva Rast:",
    time_left: "Wext:",
  },
  tr: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "İzmir Patnoslular Derneği Ürünüdür",
    start: "BAŞLA",
    submit_q: "Soru Gönder",
    admin: "Admin Girişi",
    back: "Geri",
    loading: "Soru hazırlanıyor...",
    correct: "TEBRİKLER!",
    wrong: "MAALESEF!",
    time_up: "SÜRE DOLDU!",
    play_again: "TEKRAR OYNA",
    correct_answer: "Doğru Cevap:",
    time_left: "Süre:",
  },
  en: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Product of Izmir Patnos Association",
    start: "START GAME",
    submit_q: "Submit Question",
    admin: "Admin Login",
    back: "Back",
    loading: "Preparing question...",
    correct: "CONGRATULATIONS!",
    wrong: "UNFORTUNATELY!",
    time_up: "TIME IS UP!",
    play_again: "PLAY AGAIN",
    correct_answer: "Correct Answer:",
    time_left: "Time:",
  }
};

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');
  const [pending, setPending] = useState([]);
  
  const t = TRANSLATIONS[lang];

  // --- ADMIN FONKSİYONLARI ---
  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    setPending(data || []);
  };

  const approve = async (id) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  const reject = async (id) => {
    await supabase.from('questions').delete().eq('id', id);
    fetchPending();
  };

  // --- EKRANLAR ---

  if (view === 'submit') {
    return (
      <div className="min-h-screen bg-[#070b14] text-white p-6 flex flex-col items-center">
         <button onClick={() => setView('welcome')} className="self-start flex items-center gap-2 mb-8 text-slate-400"><ArrowLeft size={20}/> {t.back}</button>
         <div className="w-full max-w-lg bg-slate-900/50 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><PlusCircle className="text-yellow-500"/> {t.submit_q}</h2>
            <p className="text-slate-400 text-sm mb-6">Sorunuz onaylandıktan sonra sisteme eklenecektir.</p>
            {/* Form buraya gelecek (Basitleştirildi) */}
            <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl">
                Soru Gönderme Formu Hazırlanıyor...
            </div>
         </div>
      </div>
    );
  }

  if (view === 'admin') {
    if (!isLogged) return (
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-white">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[40px] w-full max-w-sm text-center shadow-2xl">
            <Lock size={48} className="mx-auto text-yellow-500 mb-6" />
            <input type="password" placeholder="Şifre" className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center outline-none border border-white/5 focus:border-yellow-500/50" onChange={e => setPass(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setView('welcome')} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold">İPTAL</button>
              <button onClick={() => { if(pass === '1234') { setIsLogged(true); fetchPending(); } else alert("Şifre Yanlış!"); }} className="flex-1 py-4 bg-yellow-600 rounded-2xl font-bold">GİRİŞ</button>
            </div>
          </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-[#070b14] text-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-bold flex items-center gap-3"><Database className="text-yellow-500"/> Bekleyen Sorular ({pending.length})</h1>
              <button onClick={() => { setIsAdminLoggedIn(false); setView('welcome'); }} className="text-slate-400">Çıkış</button>
            </div>
            <div className="grid gap-4">
              {pending.map(q => (
                <div key={q.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-yellow-500 text-[10px] font-bold uppercase">{q.language}</span>
                    <p className="text-lg">{q.question_text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(q.id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl"><CheckCircle/></button>
                    <button onClick={() => reject(q.id)} className="p-4 bg-red-600/20 text-red-500 rounded-2xl"><Trash2/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#070b14] to-[#070b14]">
      <div className="w-full max-w-md text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/40 border border-white/10 p-10 rounded-[48px] backdrop-blur-3xl shadow-2xl">
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-28 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" alt="Logo" />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{t.title}</h1>
          <p className="text-yellow-500 font-bold text-xs tracking-wider mb-10 uppercase opacity-80">{t.subtitle}</p>
          
          <div className="flex justify-center gap-2 mb-10">
            {['ku', 'tr', 'en'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${lang === l ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button className="py-5 bg-yellow-600 rounded-[24px] font-black text-white text-lg tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
              <Play fill="white" size={24} /> {t.start}
            </button>
            <button onClick={() => setView('submit')} className="py-4 bg-white/5 border border-white/10 rounded-[20px] font-bold text-slate-200 flex items-center justify-center gap-2">
              <PlusCircle size={20}/> {t.submit_q}
            </button>
            <button onClick={() => setView('admin')} className="text-slate-600 text-[10px] mt-6 hover:text-slate-400 uppercase tracking-widest font-bold">
              <Lock size={10}/> Admin Control
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
