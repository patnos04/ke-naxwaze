/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Phone, 
  Split, 
  XCircle, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  RotateCcw,
  Play,
  X,
  List,
  Timer,
  Clock,
  PlusCircle,
  Lock,
  Database,
  ArrowLeft,
  Trash2,
  CheckCircle
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
    rank: "Asta Zanyariyê",
    lifelines: "Coker",
    back: "Vegere",
    loading: "Pirs tê amadekirin...",
    correct: "PÎROZ BE!",
    wrong: "MIXABIN!",
    time_up: "WEXT QEDIYA!",
    play_again: "DÎSA BILÎZE",
    won_title: "TE SERKEFT!",
    won_desc: "Te hemû pirs rast bersivandin û tu gihîştî asta herî bilind!",
    correct_answer: "Bersiva Rast:",
    time_left: "Wext:",
    submitting: "Tê şandin...",
    submit_success: "Pirs bi serkeftî hat şandin!",
    fill_all: "Ji kerema xwe hemû cihan dagirin!",
    submit_fail: "Şandin bi ser neket!",
    admin_notice: "Pirsên ku hûn dişînin, piştî pejirandina admin dê li pergalê werin zêdekirin.",
    lost_desc: (level: number, lang: Language) => `Mixabin, bersiva we şaş bû. Asta we: ${level > 1 ? RANK_TITLES[lang][level - 2] : "Nûhat"}`,
    time_lost: "Mixabin, wextê we qediya."
  },
  tr: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "İzmir Patnoslular Derneği Ürünüdür",
    start: "BAŞLA",
    submit_q: "Soru Gönder",
    admin: "Admin Girişi",
    rank: "Bilgi Seviyesi",
    lifelines: "Jokerler",
    back: "Geri",
    loading: "Soru hazırlanıyor...",
    correct: "TEBRİKLER!",
    wrong: "MAALESEF!",
    time_up: "SÜRE DOLDU!",
    play_again: "TEKRAR OYNA",
    won_title: "KAZANDINIZ!",
    won_desc: "Tüm soruları doğru cevapladınız ve en yüksek seviyeye ulaştınız!",
    correct_answer: "Doğru Cevap:",
    time_left: "Süre:",
    submitting: "Gönderiliyor...",
    submit_success: "Soru başarıyla gönderildi!",
    fill_all: "Lütfen tüm alanları doldurun!",
    submit_fail: "Gönderim başarısız oldu!",
    admin_notice: "Gönderdiğiniz sorular admin onayından sonra sisteme eklenecektir.",
    lost_desc: (level: number, lang: Language) => `Maalesef yanlış cevap verdiniz. Seviyeniz: ${level > 1 ? RANK_TITLES[lang][level - 2] : "Başlangıç"}`,
    time_lost: "Maalesef süreniz doldu."
  },
  en: {
    title: "KÊ NAXWAZE BI SERKEVE",
    subtitle: "Product of Izmir Patnos Association",
    start: "START GAME",
    submit_q: "Submit Question",
    admin: "Admin Login",
    rank: "Knowledge Rank",
    lifelines: "Lifelines",
    back: "Back",
    loading: "Preparing question...",
    correct: "CONGRATULATIONS!",
    wrong: "UNFORTUNATELY!",
    time_up: "TIME IS UP!",
    play_again: "PLAY AGAIN",
    won_title: "YOU WON!",
    won_desc: "You answered all questions correctly and reached the highest level!",
    correct_answer: "Correct Answer:",
    time_left: "Time:",
    submitting: "Submitting...",
    submit_success: "Question submitted successfully!",
    fill_all: "Please fill in all fields!",
    submit_fail: "Submission failed!",
    admin_notice: "The questions you submit will be added to the system after admin approval.",
    lost_desc: (level: number, lang: Language) => `Unfortunately, your answer was wrong. Your rank: ${level > 1 ? RANK_TITLES[lang][level - 2] : "Beginner"}`,
    time_lost: "Unfortunately, your time is up."
  }
};

const SOUNDS = {
  CLICKED: "https://static.wixstatic.com/mp3/7e2174_20975a3f364844f49d1454934df94e88.mp3",
  CORRECT: "https://static.wixstatic.com/mp3/7e2174_6e8c407b14ea45858e06408003718992.mp3",
  WRONG: "https://static.wixstatic.com/mp3/7e2174_0408cadebbba4c2694eb5b34ab071bfe.mp3",
  LOADING: "https://static.wixstatic.com/mp3/7e2174_6e8c407b14ea45858e06408003718992.mp3"
};

let currentAudio: HTMLAudioElement | null = null;

const playSound = (url: string, loop: boolean = false) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(url);
  currentAudio.loop = loop;
  currentAudio.play().catch(e => console.warn("Sound play failed", e));
};

const stopSound = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

// --- SORU GÖNDERME EKRANI (TAM HALİ) ---
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
    if (!questionText || opts.some(o => !o) || !correctAns) {
      alert(t.fill_all);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: questionText, 
          options: opts, 
          answer: correctAns, 
          level: difficultyLevel 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onBack(), 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert(t.submit_fail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> {t.back}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 md:p-8 border-white/10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <PlusCircle className="text-yellow-500" /> {t.submit_q}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mb-6 italic">{t.admin_notice}</p>

          {success ? (
            <div className="text-center py-8 md:py-12">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 md:w-16 md:h-16" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t.submit_success}</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {language === 'ku' ? 'Metna Pirsê' : language === 'tr' ? 'Soru Metni' : 'Question Text'}
                </label>
                <textarea 
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white h-24 resize-none outline-none focus:border-yellow-500"
                  placeholder={language === 'ku' ? 'Pirsa xwe binivîsin...' : 'Sorunuzu yazın...'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opts.map((opt, i) => (
                  <div key={i}>
                    <label className="text-[10px] font-bold text-slate-500">SEÇENEK {String.fromCharCode(65 + i)}</label>
                    <input 
                      type="text" value={opt}
                      onChange={(e) => {
                        const n = [...opts]; n[i] = e.target.value; setOpts(n);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-500"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500">DOĞRU CEVAP</label>
                  <select value={correctAns} onChange={(e) => setCorrectAns(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none">
                    <option value="">Seçiniz</option>
                    {opts.map((o, i) => o && <option key={i} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">ZORLUK (1-12)</label>
                  <input type="number" min="1" max="12" value={difficultyLevel} onChange={(e) => setDifficultyLevel(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                {isSubmitting ? t.submitting : t.submit_q.toUpperCase()}
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
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0, score: 0, status: 'idle', currentQuestion: null, usedQuestionIds: [], usedQuestionTexts: [],
    language: 'ku', lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true }
  });

  const t = TRANSLATIONS[gameState.language];

  if (view === 'welcome') {
    return (
      <div className="min-h-screen modern-gradient flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 text-center border-yellow-500/30">
          <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" alt="Logo" className="h-24 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">KÊ NAXWAZE BI SERKEVE</h1>
          <p className="text-xs text-yellow-500 font-bold mb-8 uppercase">{t.subtitle}</p>
          
          <div className="flex justify-center gap-3 mb-8">
            {['ku', 'tr', 'en'].map((l) => (
              <button key={l} onClick={() => setGameState({...gameState, language: l as Language})} className={`px-4 py-2 rounded-xl text-sm font-bold border ${gameState.language === l ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {l === 'ku' ? 'Kurdî' : l === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => setView('game')} className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg">
              <Play size={24} /> {t.start}
            </button>
            <button onClick={() => setView('submit')} className="w-full py-3 bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700">
              <PlusCircle size={18} className="inline mr-2" /> {t.submit_q}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'submit') {
    return <SubmitQuestionView language={gameState.language} onBack={() => setView('welcome')} />;
  }

  return (
    <div className="min-h-screen modern-gradient flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Oyun Modu Hazırlanıyor...</h2>
        <button onClick={() => setView('welcome')} className="px-6 py-2 bg-yellow-600 rounded-xl">Geri Dön</button>
      </div>
    </div>
  );
}
