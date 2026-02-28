/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, Lock, Database, ArrowLeft, Trash2, CheckCircle, 
  CheckCircle2, Loader2, Play, Trophy 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-base-js';

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TRANSLATIONS = {
  ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit_q: "Pirsê Bişîne", admin: "Admin", back: "Vegere", submit_success: "Pirs hat şandin!" },
  tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit_q: "Soru Gönder", admin: "Admin Paneli", back: "Geri", submit_success: "Soru gönderildi!" },
  en: { title: "WHO WANTS TO WIN", start: "START", submit_q: "Submit Q", admin: "Admin", back: "Back", submit_success: "Submitted!" }
};

// --- SORU GÖNDERME EKRANI (DOĞRUDAN SUPABASE) ---
function SubmitQuestionView({ onBack, lang }: { onBack: () => void, lang: 'ku'|'tr'|'en' }) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [ans, setAns] = useState('');
  const [lv, setLv] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!q || opts.some(o => !o) || !ans) return alert("Boş alan bırakmayın!");
    setLoading(true);
    
    // API YERİNE DOĞRUDAN SUPABASE'E YAZIYORUZ
    const { error } = await supabase.from('questions').insert([{
      question_text: q,
      options: opts,
      correct_answer: ans,
      difficulty: lv,
      is_approved: false, // Admin onayına düşer
      language: lang
    }]);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      setDone(true);
      setTimeout(onBack, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen modern-gradient p-4 flex items-center justify-center">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-card p-6 w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-4"><ArrowLeft size={18}/> Geri</button>
        {done ? <div className="text-center py-10 text-green-500 font-bold">Soru başarıyla gönderildi, admin onayından sonra eklenecektir!</div> : (
          <form onSubmit={send} className="space-y-4">
            <textarea placeholder="Soru metni..." className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 h-24" value={q} onChange={e=>setQ(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              {opts.map((o,i) => <input key={i} placeholder={`${i+1}. Seçenek`} className="bg-slate-900 text-white p-2 rounded-lg border border-slate-700" value={o} onChange={e=>{const n=[...opts]; n[i]=e.target.value; setOpts(n)}} />)}
            </div>
            <select className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700" value={ans} onChange={e=>setAns(e.target.value)}>
              <option value="">Doğru Cevabı Seçin</option>
              {opts.map((o,i) => o && <option key={i} value={o}>{o}</option>)}
            </select>
            <button type="submit" disabled={loading} className="w-full py-4 bg-yellow-600 rounded-xl font-bold">{loading ? "Gönderiliyor..." : "SORUYU GÖNDER"}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// --- ANA UYGULAMA ---
export default function App() {
  const [view, setView] = useState<'home' | 'submit' | 'admin'>('home');
  const [lang, setLang] = useState<'ku'|'tr'|'en'>('tr');
  const [adminPass, setAdminPass] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [pending, setPending] = useState<any[]>([]);

  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    if(data) setPending(data);
  };

  const approve = async (id: number) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  const deleteQ = async (id: number) => {
    await supabase.from('questions').delete().eq('id', id);
    fetchPending();
  };

  if (view === 'submit') return <SubmitQuestionView lang={lang} onBack={()=>setView('home')} />;

  if (view === 'admin') {
    if (!isLogged) {
      return (
        <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-sm">
            <h2 className="text-white font-bold mb-4 text-center">Admin Girişi</h2>
            <input type="password" placeholder="Şifre" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white mb-4" 
              onChange={e => setAdminPass(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={()=>setView('home')} className="flex-1 bg-slate-800 text-white p-3 rounded-xl">İptal</button>
              <button onClick={() => { if(adminPass === '1234') { setIsLogged(true); fetchPending(); } else alert("Şifre Yanlış!"); }} 
                className="flex-1 bg-yellow-600 text-white p-3 rounded-xl">Giriş</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen modern-gradient p-4">
        <div className="max-w-4xl mx-auto text-white">
          <div className="flex justify-between mb-6">
            <h1 className="font-bold">Onay Bekleyenler ({pending.length})</h1>
            <button onClick={()=>setView('home')} className="text-slate-400">Çıkış</button>
          </div>
          <div className="grid gap-4">
            {pending.map(q => (
              <div key={q.id} className="glass-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-yellow-500 text-xs mb-1">{q.language.toUpperCase()} - SEVİYE {q.difficulty}</p>
                  <p>{q.question_text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>approve(q.id)} className="p-3 bg-green-600 rounded-xl"><CheckCircle size={20}/></button>
                  <button onClick={()=>deleteQ(q.id)} className="p-3 bg-red-600 rounded-xl"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-center text-slate-500">Bekleyen soru yok.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
      <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="glass-card p-8 w-full max-w-md text-center">
        <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-20 mx-auto mb-6" />
        <h1 className="text-xl font-black text-white mb-6 uppercase tracking-widest">{TRANSLATIONS[lang].title}</h1>
        
        <div className="flex justify-center gap-2 mb-8">
          {['ku','tr','en'].map(l => (
            <button key={l} onClick={()=>setLang(l as any)} className={`px-4 py-2 rounded-lg text-xs font-bold border ${lang === l ? 'bg-yellow-500 text-black' : 'text-slate-400 border-slate-700'}`}>{l.toUpperCase()}</button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button className="py-4 bg-yellow-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Play size={20}/> {TRANSLATIONS[lang].start}</button>
          <button onClick={()=>setView('submit')} className="py-3 bg-slate-800 text-white rounded-2xl border border-slate-700 flex items-center justify-center gap-2"><PlusCircle size={18}/> {TRANSLATIONS[lang].submit_q}</button>
          <button onClick={()=>setView('admin')} className="py-2 text-slate-500 text-xs flex items-center justify-center gap-1 mt-4"><Lock size={12}/> {TRANSLATIONS[lang].admin}</button>
        </div>
      </motion.div>
    </div>
  );
}
