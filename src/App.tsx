import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Phone, Split, Play, PlusCircle, Lock, 
  ArrowLeft, CheckCircle, Trash2, Loader2, X 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE AYARI ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// --- OYUN SABİTLERİ ---
const RANK_TITLES = {
  ku: ["Nûhat", "Zana", "Pispor", "Ustad", "Dahî"],
  tr: ["Çaylak", "Bilgin", "Uzman", "Üstad", "Deha"],
  en: ["Beginner", "Scholar", "Expert", "Master", "Genius"]
};

export default function App() {
  const [view, setView] = useState<'home' | 'game' | 'submit' | 'admin'>('home');
  const [lang, setLang] = useState<'ku' | 'tr' | 'en'>('tr');
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');
  const [pending, setPending] = useState<any[]>([]);

  // Soru Gönder Formu
  const [formData, setFormData] = useState({ q: '', o: ['', '', '', ''], a: '', lv: 1 });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // --- SORU GÖNDERME ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.q || formData.o.some(x => !x) || !formData.a) return alert("Lütfen tüm alanları doldurun!");
    setStatus('loading');
    const { error } = await supabase.from('questions').insert([{
      question_text: formData.q,
      options: formData.o,
      correct_answer: formData.a,
      difficulty: formData.lv,
      language: lang,
      is_approved: false
    }]);
    if (error) { alert("Hata: " + error.message); setStatus('idle'); }
    else { setStatus('success'); setTimeout(() => { setView('home'); setStatus('idle'); }, 2000); }
  };

  // --- ADMIN ---
  const fetchPending = async () => {
    const { data } = await supabase.from('questions').select('*').eq('is_approved', false);
    setPending(data || []);
  };

  const approve = async (id: number) => {
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    fetchPending();
  };

  // --- EKRANLAR ---
  if (view === 'submit') return (
    <div className="min-h-screen bg-[#070b14] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <button onClick={() => setView('home')} className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white"><ArrowLeft size={20}/> Geri</button>
        <div className="bg-slate-900/50 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><PlusCircle className="text-yellow-500"/> Soru Öner</h2>
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="bg-green-500/20 text-green-500 p-4 rounded-2xl font-bold">Soru başarıyla gönderildi! Admin onayından sonra yayına alınacaktır.</div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <textarea placeholder="Sorunuzu yazın..." className="w-full bg-slate-800 p-4 rounded-2xl border border-white/5 outline-none focus:border-yellow-500/50" 
                value={formData.q} onChange={e => setFormData({...formData, q: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                {formData.o.map((v, i) => (
                  <input key={i} placeholder={`${String.fromCharCode(65+i)}) Seçenek`} className="bg-slate-800 p-3 rounded-xl border border-white/5 outline-none focus:border-yellow-500/50" 
                    value={v} onChange={e => { const n = [...formData.o]; n[i] = e.target.value; setFormData({...formData, o: n})}} />
                ))}
              </div>
              <select className="w-full bg-slate-800 p-4 rounded-2xl border border-white/5 outline-none" value={formData.a} onChange={e => setFormData({...formData, a: e.target.value})}>
                <option value="">Doğru Cevabı Seçin</option>
                {formData.o.map(v => v && <option key={v} value={v}>{v}</option>)}
              </select>
              <button disabled={status === 'loading'} className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-2xl font-bold uppercase tracking-widest transition-all">
                {status === 'loading' ? <Loader2 className="animate-spin mx-auto"/> : 'GÖNDER'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (view === 'admin') {
    if (!isLogged) return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900 border border-white/10 p-10 rounded-[40px] w-full max-w-sm text-center shadow-2xl">
          <Lock size={48} className="mx-auto text-yellow-500 mb-6" />
          <input type="password" placeholder="Şifre" className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center outline-none border border-white/5 focus:border-yellow-500/50" onChange={e => setPass(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => setView('home')} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold">İPTAL</button>
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
            <button onClick={() => { setIsLogged(false); setView('home'); }} className="text-slate-400 hover:text-white">Çıkış</button>
          </div>
          <div className="grid gap-4">
            {pending.map(q => (
              <div key={q.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex justify-between items-center group">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-bold">{q.language.toUpperCase()}</span>
                    <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded font-bold">SEVİYE {q.difficulty}</span>
                  </div>
                  <p className="text-lg">{q.question_text}</p>
                </div>
                <button onClick={() => approve(q.id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-lg"><CheckCircle/></button>
              </div>
            ))}
            {pending.length === 0 && <div className="text-center py-20 text-slate-500 italic">Onay bekleyen soru bulunamadı.</div>}
          </div>
        </div>
      </div>
    );
  }

  // --- ANA MENÜ ---
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#070b14] to-[#070b14]">
      <div className="w-full max-w-md text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/40 border border-white/10 p-10 rounded-[48px] backdrop-blur-3xl shadow-2xl">
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-28 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" alt="Logo" />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">KÊ NAXWAZE</h1>
          <p className="text-yellow-500 font-bold text-xs tracking-[0.3em] mb-10 uppercase opacity-80">BI SERKEVE</p>
          
          <div className="flex justify-center gap-2 mb-10">
            {(['ku','tr','en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${lang === l ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button className="group relative overflow-hidden py-5 bg-yellow-600 rounded-[24px] font-black text-white text-lg tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
              <Play fill="white" size={24} /> {lang === 'ku' ? 'DEST PÊ BIKE' : lang === 'tr' ? 'BAŞLA' : 'START'}
            </button>
            <button onClick={() => setView('submit')} className="py-4 bg-white/5 border border-white/10 rounded-[20px] font-bold text-slate-200 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <PlusCircle size={20}/> {lang === 'ku' ? 'Pirsê Bişîne' : lang === 'tr' ? 'Soru Gönder' : 'Submit Question'}
            </button>
            <button onClick={() => setView('admin')} className="text-slate-600 text-[10px] flex items-center justify-center gap-1 mt-6 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold">
              <Lock size={10}/> Admin Control
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
