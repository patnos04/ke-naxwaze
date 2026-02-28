/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, Phone, Split, XCircle, CheckCircle2, Loader2,
  ChevronRight, RotateCcw, Play, X, List, Timer, Clock,
  PlusCircle, Lock, Database, ArrowLeft, Trash2, CheckCircle
} from 'lucide-react';
import { Question, GameStatus, GameState, RANK_TITLES, Language } from './types';
import { generateQuestion, translateQuestion } from './services/gemini';

const TRANSLATIONS = {
  ku: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye",
    start: "DEST PÊ BIKE",
    submit_q: "Pirsê Bişîne",
    admin: "Ketina Admin",
    back: "Vegere",
    submitting: "Tê şandin...",
    submit_success: "Pirs bi serkeftî hat şandin!",
    fill_all: "Ji kerema xwe hemû cihan dagirin!",
    submit_fail: "Şandin bi ser neket!",
    admin_notice: "Pirsên ku hûn dişînin, piştî pejirandina admin dê li pergalê werin zêdekirin."
  },
  tr: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "İzmir Patnoslular Derneği Ürünüdür",
    start: "BAŞLA",
    submit_q: "Soru Gönder",
    admin: "Admin Girişi",
    back: "Geri",
    submitting: "Gönderiliyor...",
    submit_success: "Soru başarıyla gönderildi!",
    fill_all: "Lütfen tüm alanları doldurun!",
    submit_fail: "Gönderim başarısız oldu!",
    admin_notice: "Gönderdiğiniz sorular admin onayından sonra sisteme eklenecektir."
  },
  en: {
    title: "WHO WANTS TO WIN",
    subtitle: "Product of Izmir Patnos Association",
    start: "START GAME",
    submit_q: "Submit Question",
    admin: "Admin Login",
    back: "Back",
    submitting: "Submitting...",
    submit_success: "Question submitted successfully!",
    fill_all: "Please fill in all fields!",
    submit_fail: "Submission failed!",
    admin_notice: "Submitted questions will be added after admin approval."
  }
};

// --- SORU GÖNDERME EKRANI ---
function SubmitQuestionView({ onBack, language }: { onBack: () => void, language: Language }) {
  const t = TRANSLATIONS[language];
  const [questionText, setQuestionText] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [correctAns, setCorrectAns] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || opts.some(o => !o) || !correctAns) { alert(t.fill_all); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText, options: opts, answer: correctAns, level: difficultyLevel })
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); setTimeout(() => onBack(), 2000); }
    } catch (err) { alert(t.submit_fail); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> {t.back}
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-white/10">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3"><PlusCircle className="text-yellow-500" /> {t.submit_q}</h2>
          <p className="text-slate-400 text-xs mb-6 italic">{t.admin_notice}</p>
          {success ? (
            <div className="text-center py-10"><CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" /><h3 className="text-white font-bold">{t.submit_success}</h3></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white h-24 outline-none focus:border-yellow-500" placeholder="Soru metni..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opts.map((opt, i) => (
                  <input key={i} type="text" value={opt} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-yellow-500" placeholder={`Seçenek ${String.fromCharCode(65+i)}`} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={correctAns} onChange={(e) => setCorrectAns(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none">
                  <option value="">Doğru Cevap</option>
                  {opts.map((o, i) => o && <option key={i} value={o}>{o}</option>)}
                </select>
                <input type="number" min="1" max="12" value={difficultyLevel} onChange={(e) => setDifficultyLevel(parseInt(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />} {isSubmitting ? t.submitting : t.submit_q.toUpperCase()}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// --- ANA UYGULAMA BİLEŞENİ ---
export default function App() {
  const [view, setView] = useState<'welcome' | 'game' | 'submit' | 'admin'>('welcome');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0, score: 0, status: 'idle', currentQuestion: null, usedQuestionIds: [], usedQuestionTexts: [],
    language: 'ku', lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true }
  });

  const t = TRANSLATIONS[gameState.language];

  // Admin Soruları Çekme
  const fetchPending = async () => {
    try {
      const res = await fetch('/api/questions/pending');
      const data = await res.json();
      setPendingQuestions(data);
    } catch (e) { console.error(e); }
  };

  const approveQuestion = async (id: number) => {
    await fetch('/api/questions/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchPending();
  };

  if (view === 'welcome') {
    return (
      <div className="min-h-screen modern-gradient flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 text-center border-yellow-500/30 shadow-2xl">
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" className="h-24 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">KÊ NAXWAZE BI SERKEVE</h1>
          <p className="text-xs text-yellow-500 font-bold mb-8 uppercase tracking-widest">{t.subtitle}</p>
          <div className="flex justify-center gap-2 mb-8">
            {['ku', 'tr', 'en'].map((l) => (
              <button key={l} onClick={() => setGameState({...gameState, language: l as Language})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${gameState.language === l ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => setView('game')} className="py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg"><Play size={20} /> {t.start}</button>
            <button onClick={() => setView('submit')} className="py-3 bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2"><PlusCircle size={18} /> {t.submit_q}</button>
            <button onClick={() => { setView('admin'); fetchPending(); }} className="py-3 bg-slate-900/50 text-slate-500 font-bold rounded-2xl border border-slate-800 text-xs flex items-center justify-center gap-2"><Lock size={14} /> {t.admin}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-sm text-center">
            <Lock size={40} className="text-yellow-500 mx-auto mb-4" />
            <input type="password" placeholder="Admin Şifresi" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mb-4 outline-none focus:border-yellow-500" />
            <div className="flex gap-3">
              <button onClick={() => setView('welcome')} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Geri</button>
              <button onClick={() => { if(adminPassword === '1234') setIsAdminLoggedIn(true); else alert('Hatalı Şifre!'); }} className="flex-1 py-3 bg-yellow-600 text-white rounded-xl font-bold">Giriş</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen modern-gradient p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-white font-bold flex items-center gap-2"><Database className="text-yellow-500" /> Onay Bekleyen Sorular ({pendingQuestions.length})</h1>
            <button onClick={() => setView('welcome')} className="text-slate-400 flex items-center gap-1 hover:text-white"><ArrowLeft size={16}/> Çıkış</button>
          </div>
          <div className="grid gap-4">
            {pendingQuestions.map((q) => (
              <div key={q.id} className="glass-card p-5 border-white/5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="text-yellow-500 text-[10px] font-bold mb-1">AST: {q.difficulty}</div>
                  <p className="text-white font-medium mb-3">{q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((o:string, i:number) => <div key={i} className={`text-[11px] p-2 rounded bg-slate-800/50 ${o === q.correct_answer ? 'text-green-400 border border-green-500/30' : 'text-slate-400'}`}>{o}</div>)}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 justify-center">
                  <button onClick={() => approveQuestion(q.id)} className="p-3 bg-green-600/20 text-green-500 rounded-xl hover:bg-green-600/40"><CheckCircle size={20}/></button>
                  <button className="p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600/40"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'submit') return <SubmitQuestionView language={gameState.language} onBack={() => setView('welcome')} />;

  return (
    <div className="min-h-screen modern-gradient flex items-center justify-center text-white p-6">
      <div className="text-center glass-card p-10 border-yellow-500/20">
        <Trophy size={60} className="text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black mb-4 tracking-tighter">OYUN MODU YÜKLENİYOR</h2>
        <p className="text-slate-400 mb-6 text-sm">Soru bankası ve Gemini yapay zekası optimize ediliyor...</p>
        <button onClick={() => setView('welcome')} className="px-8 py-3 bg-yellow-600 rounded-2xl font-bold shadow-lg">ANA MENÜYE DÖN</button>
      </div>
    </div>
  );
}
