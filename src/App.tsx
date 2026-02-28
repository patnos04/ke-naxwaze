import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Lock, Database, ArrowLeft, Trash2, CheckCircle, 
  CheckCircle2, Loader2, Play, Trophy 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BAĞLANTISI (Vite standartlarına uygun) ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// --- DİLLER ---
const TRANSLATIONS = {
  ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit_q: "Pirsê Bişîne", admin: "Admin", back: "Vegere" },
  tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit_q: "Soru Gönder", admin: "Admin Paneli", back: "Geri" },
  en: { title: "WHO WANTS TO WIN", start: "START", submit_q: "Submit Q", admin: "Admin", back: "Back" }
};

// --- SORU GÖNDERME EKRANI ---
function SubmitQuestionView({ onBack, lang }: { onBack: () => void, lang: 'ku'|'tr'|'en' }) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [ans, setAns] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!q || opts.some(o => !o) || !ans) return alert("Lütfen tüm alanları doldurun!");
    setLoading(true);
    
    const { error } = await supabase.from('questions').insert([{
      question_text: q,
      options: opts,
      correct_answer: ans,
      difficulty: 1,
      is_approved: false,
      language: lang
    }]);

    if (error) alert("Hata: " + error.message);
    else { setDone(true); setTimeout(onBack, 2000); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 p-6 w-full max-w-lg rounded-2xl shadow-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-4 hover:text-white transition-colors"><ArrowLeft size={18}/> Geri</button>
        {done ? <div className="text-center py-10 text-green-500 font-bold">Soru başarıyla gönderildi!</div> : (
          <form onSubmit={send} className="space-y-4">
            <textarea placeholder="Soru metni..." className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 h-24 outline-none focus:border-yellow-500" value={q} onChange={e=>setQ(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              {opts.map((o,i) => <input key={i} placeholder={`${i+1}. Seçenek`} className="bg-slate-800 text-white p-2 rounded-lg border border-slate-700 outline-none focus:border-yellow-500" value={o} onChange={e=>{const n=[...opts]; n[i]=e.target.value; setOpts(n)}} />)}
            </div>
            <select className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 outline-none" value={ans} onChange={e=>setAns(e.target.value)}>
              <option value="">Doğru Cevabı Seçin</option>
              {opts.map((o,i) => o && <option key={i} value={o}>{o}</option>)}
            </select>
            <button type="submit" disabled={loading} className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-all">{loading ? "Gönderiliyor..." : "SORUYU GÖNDER"}</button>
          </form>
        )}
      </div>
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

  if (view === 'submit') return <SubmitQuestionView lang={lang} onBack={()=>setView('home')} />;

  if (view === 'admin') {
    if (!isLogged) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 w-full max-w-sm rounded-2xl">
            <h2 className="text-white font-bold mb-4 text-center">Admin Girişi</h2>
            <input type="password" placeholder="Şifre (1234)" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white mb-4 outline-none" 
              onChange={e => setAdminPass(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={()=>setView('home')} className="flex-1 bg-slate-700 text-white p-3 rounded-xl">İptal</button>
              <button onClick={() => { if(adminPass === '1234') { setIsLogged(true); fetchPending(); } else alert("Şifre Yanlış!"); }} 
                className="flex-1 bg-yellow-600 text-white p-3 rounded-xl">Giriş</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 p-4 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-bold text-xl">Onay Bekleyen Sorular ({pending.length})</h1>
            <button onClick={()=>setView('home')} className="bg-slate-800 px-4 py-2 rounded-lg text-sm">Çıkış</button>
          </div>
          <div className="grid gap-4">
            {pending.map(q => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-yellow-500 text-xs font-bold">{q.language.toUpperCase()}</p>
                  <p className="mt-1">{q.question_text}</p>
                </div>
                <button onClick={()=>approve(q.id)} className="p-3 bg-green-600 hover:bg-green-500 rounded-xl transition-colors"><CheckCircle size={20}/></button>
              </div>
            ))}
            {pending.length === 0 && <p className="text-center text-slate-500 mt-10">Bekleyen soru yok.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 w-full max-w-md text-center rounded-3xl shadow-2xl">
        <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-20 mx-auto mb-6" alt="Logo" />
        <h1 className="text-xl font-black text-white mb-6 tracking-widest">{TRANSLATIONS[lang].title}</h1>
        
        <div className="flex justify-center gap-2 mb-8">
          {(['ku','tr','en'] as const).map(l => (
            <button key={l} onClick={()=>setLang(l)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${lang === l ? 'bg-yellow-500 text-black border-yellow-500' : 'text-slate-400 border-slate-800'}`}>{l.toUpperCase()}</button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button className="py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"><Play size={20}/> {TRANSLATIONS[lang].start}</button>
          <button onClick={()=>setView('submit')} className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 flex items-center justify-center gap-2"><PlusCircle size={18}/> {TRANSLATIONS[lang].submit_q}</button>
          <button onClick={()=>setView('admin')} className="py-2 text-slate-600 text-xs flex items-center justify-center gap-1 mt-4 hover:text-slate-400"><Lock size={12}/> {TRANSLATIONS[lang].admin}</button>
        </div>
      </div>
    </div>
  );
}
