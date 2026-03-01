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

// Audio helper for ticking sound
const playTick = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn("Audio context failed", e);
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

function SubmitQuestionView({ onBack, language }: { onBack: () => void, language: Language }) {
  const t = TRANSLATIONS[language];
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [level, setLevel] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || options.some(o => !o) || !answer || !level) {
      alert(t.fill_all);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options, answer, level })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onBack(), 2000);
      }
    } catch (e) {
      alert(t.submit_fail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> {t.back}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 md:p-8 border-white/10"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <PlusCircle className="text-yellow-500" /> {t.submit_q}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mb-6 italic">
            {t.admin_notice}
          </p>

          {success ? (
            <div className="text-center py-8 md:py-12">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 md:w-16 md:h-16" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t.submit_success}</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{language === 'ku' ? 'Metna Pirsê' : language === 'tr' ? 'Soru Metni' : 'Question Text'}</label>
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base text-white focus:border-yellow-500 outline-none h-24 resize-none"
                  placeholder={language === 'ku' ? 'Pirsa xwe li vir binivîsin...' : language === 'tr' ? 'Sorunuzu buraya yazın...' : 'Write your question here...'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {options.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:mb-2">{language === 'ku' ? 'Vebijêrk' : language === 'tr' ? 'Seçenek' : 'Option'} {String.fromCharCode(65 + i)}</label>
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-yellow-500 outline-none"
                      placeholder={`${language === 'ku' ? 'Vebijêrk' : language === 'tr' ? 'Seçenek' : 'Option'} ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:mb-2">{language === 'ku' ? 'Bersiva Rast' : language === 'tr' ? 'Doğru Cevap' : 'Correct Answer'}</label>
                  <select 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-yellow-500 outline-none appearance-none"
                  >
                    <option value="">{language === 'ku' ? 'Bibijêrin' : language === 'tr' ? 'Seçiniz' : 'Select'}</option>
                    {options.map((opt, i) => opt && (
                      <option key={i} value={opt}>{String.fromCharCode(65 + i)}: {opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:mb-2">{language === 'ku' ? 'Asta Zehmetiyê' : language === 'tr' ? 'Zorluk Seviyesi' : 'Difficulty Level'} (1-12)</label>
                  <input 
                    type="number"
                    min="1"
                    max="12"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 md:py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-600/20 disabled:opacity-50 text-sm md:text-base"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                {isSubmitting ? t.submitting : (language === 'ku' ? 'PIRSÊ BIŞÎNE' : language === 'tr' ? 'SORUYU GÖNDER' : 'SUBMIT QUESTION')}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'welcome' | 'game' | 'submit' | 'admin'>('welcome');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0,
    score: 0,
    status: 'idle',
    currentQuestion: null,
    usedQuestionIds: [],
    usedQuestionTexts: [],
    language: 'ku',
    lifelines: {
      fiftyFifty: true,
      phoneFriend: true,
      askAudience: true,
    }
  });

  const t = TRANSLATIONS[gameState.language];

  const changeLanguage = async (lang: Language) => {
    if (lang === gameState.language) return;
    
    // If we are currently playing, translate the current question
    if (gameState.status === 'playing' && gameState.currentQuestion) {
      setGameState(prev => ({ ...prev, status: 'loading', language: lang }));
      playSound(SOUNDS.LOADING, true);
      try {
        const translated = await translateQuestion(gameState.currentQuestion, lang);
        setGameState(prev => ({ 
          ...prev, 
          status: 'playing', 
          currentQuestion: translated,
          language: lang 
        }));
      } catch (e) {
        console.error("Translation failed", e);
        setGameState(prev => ({ ...prev, status: 'playing', language: lang }));
      } finally {
        stopSound();
      }
    } else {
      setGameState(prev => ({ ...prev, language: lang }));
    }
  };

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lifelineResult, setLifelineResult] = useState<{ type: string, content: React.ReactNode } | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Timer only active for first 5 questions
    if (gameState.status === 'playing' && !selectedOption && timeLeft > 0 && gameState.currentLevel <= 5) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState(s => ({ ...s, status: 'lost' }));
            return 0;
          }
          playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.status, selectedOption, timeLeft, gameState.currentLevel]);

  const fetchNextQuestion = useCallback(async (level: number, usedIds: number[], usedTexts: string[], language: Language) => {
    setGameState(prev => ({ ...prev, status: 'loading' }));
    playSound(SOUNDS.LOADING, true);
    setError(null);
    try {
      // Try to fetch an approved question from the local bank first
      let question: Question | null = null;
      try {
        const res = await fetch('/api/questions/approved');
        const approvedQuestions = await res.json();
        
        // Filter by level AND ensure it hasn't been used yet (ID and Text)
        const levelQuestions = approvedQuestions.filter((q: any) => 
          q.level === level + 1 && 
          !usedIds.includes(q.id) && 
          !usedTexts.some(t => t.toLowerCase().trim() === q.question.toLowerCase().trim())
        );
        
        if (levelQuestions.length > 0) {
          const randomQ = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
          question = {
            question: randomQ.question,
            options: [randomQ.optionA, randomQ.optionB, randomQ.optionC, randomQ.optionD],
            answer: randomQ.answer,
            level: randomQ.level,
            difficulty: randomQ.level <= 4 ? 'easy' : randomQ.level <= 8 ? 'medium' : 'hard'
          };
          
          // Store the ID and Text to prevent duplicates
          setGameState(prev => ({
            ...prev,
            usedQuestionIds: [...prev.usedQuestionIds, randomQ.id],
            usedQuestionTexts: [...prev.usedQuestionTexts, randomQ.question]
          }));
        }
      } catch (e) {
        console.warn("Failed to fetch from local bank, falling back to Gemini", e);
      }

      if (!question) {
        // If falling back to Gemini, pass used texts to avoid similarity
        question = await generateQuestion(level + 1, language, usedTexts);
        
        setGameState(prev => ({
          ...prev,
          usedQuestionTexts: [...prev.usedQuestionTexts, question!.question]
        }));
      }

      stopSound();
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentQuestion: question,
        currentLevel: level + 1
      }));
      setSelectedOption(null);
      setIsRevealing(false);
      setHiddenOptions([]);
      setTimeLeft(30); // Reset timer
      setLifelineResult(null);
    } catch (err) {
      stopSound();
      console.error(err);
      setError("Pirs nehat barkirin. Ji kerema xwe dîsa biceribînin.");
      setGameState(prev => ({ ...prev, status: 'idle' }));
    }
  }, []);

  const startGame = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setGameState(prev => ({
      ...prev,
      currentLevel: 0,
      score: 0,
      status: 'loading',
      currentQuestion: null,
      usedQuestionIds: [],
      usedQuestionTexts: [],
    }));
    fetchNextQuestion(0, [], [], gameState.language);
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption || isRevealing) return;
    setSelectedOption(option);
    
    setIsRevealing(true);
    playSound(SOUNDS.CLICKED);

    setTimeout(() => {
      const isCorrect = option === gameState.currentQuestion?.answer;
      if (isCorrect) {
        playSound(SOUNDS.CORRECT);
        if (gameState.currentLevel === RANK_TITLES[gameState.language].length) {
          setGameState(prev => ({ ...prev, status: 'won' }));
        } else {
          // Automatically move to the next question after a short delay
          setTimeout(() => {
            nextQuestion();
          }, 1500);
        }
      } else {
        playSound(SOUNDS.WRONG);
        setGameState(prev => ({ ...prev, status: 'lost' }));
      }
      setIsRevealing(false);
    }, 10000);
  };

  const nextQuestion = () => {
    fetchNextQuestion(gameState.currentLevel, gameState.usedQuestionIds, gameState.usedQuestionTexts, gameState.language);
  };

  const useLifeline = (type: keyof GameState['lifelines']) => {
    if (!gameState.lifelines[type] || !gameState.currentQuestion || selectedOption) return;

    setGameState(prev => ({
      ...prev,
      lifelines: { ...prev.lifelines, [type]: false }
    }));

    if (type === 'fiftyFifty') {
      const q = gameState.currentQuestion;
      const wrongOptions = q.options.filter(o => o !== q.answer);
      const toHide = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
      setHiddenOptions(toHide);
    } else if (type === 'phoneFriend') {
      const q = gameState.currentQuestion;
      const confidence = Math.random() > 0.2 ? "Ez bawer dikim" : "Ez ne pir bawer im, lê ez difikirim";
      setLifelineResult({
        type: 'phone',
        content: (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
              <Phone size={24} className="text-yellow-500" />
            </div>
            <p className="text-sm italic text-slate-300 text-center">
              Hevalê te dibêje: <br />
              <span className="text-white font-bold">"{confidence} bersiv '{q.answer}' e."</span>
            </p>
          </div>
        )
      });
    } else if (type === 'askAudience') {
      const q = gameState.currentQuestion;
      // Generate some semi-realistic percentages
      const correctPercent = Math.floor(Math.random() * 30) + 50; // 50-80%
      const remaining = 100 - correctPercent;
      const otherPercents = [0, 0, 0];
      let sum = 0;
      for (let i = 0; i < 2; i++) {
        otherPercents[i] = Math.floor(Math.random() * (remaining - sum));
        sum += otherPercents[i];
      }
      otherPercents[2] = remaining - sum;
      
      const results = q.options.map(opt => ({
        label: opt,
        percent: opt === q.answer ? correctPercent : otherPercents.pop() || 0
      }));

      setLifelineResult({
        type: 'audience',
        content: (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={20} className="text-yellow-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Encama Temaşevanan</span>
            </div>
            <div className="grid grid-cols-4 gap-2 h-24 items-end">
              {results.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div 
                    className="w-full bg-yellow-500/40 border-t border-yellow-500 rounded-t-sm transition-all duration-1000" 
                    style={{ height: `${r.percent}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-white">{r.percent}%</span>
                  <span className="text-[10px] font-mono text-slate-500">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      });
    }
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminLoggedIn(true);
        fetchPendingQuestions();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Ketin bi ser neket!");
    }
  };

  const fetchPendingQuestions = async () => {
    try {
      const res = await fetch('/api/questions/pending');
      const data = await res.json();
      setPendingQuestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const approveQuestion = async (id: number) => {
    try {
      await fetch('/api/questions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchPendingQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const rejectQuestion = async (id: number) => {
    try {
      await fetch('/api/questions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchPendingQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const isCorrect = selectedOption === gameState.currentQuestion?.answer;

  if (view === 'welcome') {
    return (
      <div className="min-h-screen modern-gradient flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8 text-center border-yellow-500/30 shadow-2xl"
        >
          <img 
            src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
            alt="Logo" 
            className="h-24 mx-auto object-contain mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-widest text-white leading-tight uppercase mb-2">
            KÊ NAXWAZE BI SERKEVE
          </h1>
          <p className="text-xs md:text-sm text-yellow-500 font-bold italic leading-tight uppercase tracking-wider opacity-90 mb-8">
            {t.subtitle}
          </p>

          {/* Language Selection on Welcome Screen */}
          <div className="flex justify-center gap-3 mb-8">
            {(['ku', 'tr', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  gameState.language === lang 
                    ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-lg shadow-yellow-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                }`}
              >
                {lang === 'ku' ? 'Kurdî' : lang === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { startGame(); setView('game'); }}
              className="w-full px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg shadow-lg shadow-yellow-600/20"
            >
              <Play size={24} /> {t.start}
            </button>

            <button 
              onClick={() => setView('submit')}
              className="w-full px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm border border-slate-700"
            >
              <PlusCircle size={18} /> {t.submit_q}
            </button>

            <button 
              onClick={() => setView('admin')}
              className="w-full px-8 py-3 bg-slate-900/50 hover:bg-slate-800 text-slate-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm border border-slate-800"
            >
              <Lock size={18} /> {t.admin}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'submit') {
    return <SubmitQuestionView language={gameState.language} onBack={() => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      setView('welcome');
    }} />;
  }

  if (view === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen modern-gradient flex flex-col items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card w-full max-w-[320px] p-6 md:p-8 text-center"
          >
            <Lock size={40} className="text-yellow-500 mx-auto mb-4 md:w-12 md:h-12" />
            <h2 className="text-lg md:text-xl font-bold text-white mb-6">Ketina Admin</h2>
            <input 
              type="password" 
              placeholder="Şîfre" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-white mb-4 focus:border-yellow-500 outline-none text-sm"
            />
            <div className="flex gap-2 md:gap-3">
              <button 
                onClick={() => {
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  setView('welcome');
                }}
                className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-slate-800 text-white rounded-xl font-bold text-sm"
              >
                Vegere
              </button>
              <button 
                onClick={handleAdminLogin}
                className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-yellow-600 text-white rounded-xl font-bold text-sm"
              >
                Ketin
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen modern-gradient p-4 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
              <Database className="text-yellow-500 md:w-6 md:h-6" size={20} /> Panela Admin
            </h1>
            <button 
              onClick={() => { setIsAdminLoggedIn(false); setView('welcome'); }}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 text-white rounded-xl flex items-center gap-2 text-xs md:text-sm"
            >
              <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> Derketin
            </button>
          </div>

          <div className="grid gap-3 md:gap-4">
            <h2 className="text-base md:text-lg font-bold text-slate-400 mb-1 md:mb-2">Pirsên li benda pejirandinê ({pendingQuestions.length})</h2>
            {pendingQuestions.length === 0 && (
              <div className="glass-card p-6 md:p-8 text-center text-slate-500 text-sm">
                Pirsa li bendê nîne.
              </div>
            )}
            {pendingQuestions.map((q) => (
              <div key={q.id} className="glass-card p-4 md:p-6 border-white/5">
                <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                  <div className="flex-1 overflow-hidden">
                    <span className="text-[9px] md:text-[10px] bg-yellow-600/20 text-yellow-500 px-2 py-0.5 md:py-1 rounded-full font-bold uppercase mb-1 md:mb-2 inline-block">
                      Ast {q.level}
                    </span>
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight break-words">{q.question}</h3>
                  </div>
                  <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                    <button 
                      onClick={() => approveQuestion(q.id)}
                      className="p-1.5 md:p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-all"
                      title="Biperijîne"
                    >
                      <CheckCircle size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button 
                      onClick={() => rejectQuestion(q.id)}
                      className="p-1.5 md:p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-all"
                      title="Red bike"
                    >
                      <Trash2 size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
                    <div key={i} className={`p-2 rounded-lg text-[10px] md:text-xs leading-tight ${opt === q.answer ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-slate-800/50 text-slate-400'}`}>
                      <span className="font-bold mr-1">{String.fromCharCode(65 + i)}:</span> {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center font-sans overflow-x-hidden">
      {/* Header Section - Professional and spread out */}
      <header className="w-full compact-header sticky top-0 z-40 px-3 md:px-4 py-3 md:py-4 flex items-center justify-center relative shadow-2xl border-b border-white/5 backdrop-blur-xl">
        <div className="flex flex-row items-center justify-between w-full max-w-7xl gap-2 md:gap-4">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <img 
              src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
              alt="Logo" 
              className="h-10 w-10 md:h-14 md:w-14 object-contain drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title Section */}
          <div className="flex-1 text-center px-2 md:px-0 overflow-hidden">
            <h1 className="text-sm md:text-3xl font-display font-black tracking-widest text-white leading-tight uppercase drop-shadow-md truncate">
              {t.title}
            </h1>
            {/* Subtitle - Styled to match title width/scale */}
            <p className="text-[8px] md:text-sm text-yellow-500 font-bold italic leading-tight uppercase tracking-tighter md:tracking-wider opacity-90 mt-0.5 md:mt-1 truncate">
              {t.subtitle}
            </p>
          </div>
          
          {/* Language Selection & Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
              {(['ku', 'tr', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                    gameState.language === lang 
                      ? 'bg-yellow-500 text-slate-900 shadow-lg' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsScoreOpen(true)}
              className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:border-yellow-500/50 transition-all shadow-2xl backdrop-blur-2xl"
              title="Skor"
            >
              <List size={20} className="md:w-[22px] md:h-[22px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl flex flex-col lg:flex-row items-start justify-center px-4 py-6 gap-8">
        {/* Desktop Sidebar - Prize Ladder */}
        <aside className="hidden lg:block w-72 glass-card p-6 sticky top-24 border-yellow-500/10">
          <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center border-b border-slate-800 pb-2">{t.rank}</div>
          <div className="flex flex-col gap-1">
            {[...RANK_TITLES[gameState.language]].reverse().map((rank, idx) => {
              const level = RANK_TITLES[gameState.language].length - idx;
              const isCurrent = gameState.currentLevel === level;
              const isPassed = gameState.currentLevel > level;
              const isSafePoint = level === 5 || level === 10 || level === 13;

              return (
                <div 
                  key={level}
                  className={`prize-item flex items-center gap-4 px-4 py-1.5 rounded-xl transition-all ${
                    isCurrent ? 'active text-white font-bold bg-yellow-600/20 border border-yellow-500/30' : 
                    isPassed ? 'text-slate-600' : 
                    isSafePoint ? 'text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="w-6 text-right font-mono text-xs opacity-60">{level}</span>
                  <span className={`flex-1 font-display text-sm tracking-wide ${isCurrent ? 'text-yellow-400' : ''}`}>{rank}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-between min-h-[70vh]">
          <div className="w-full flex flex-col items-center gap-6">
            {/* Lifelines Section - Prominent Jokers */}
            <div className="w-full flex justify-center gap-3 md:gap-10">
              <button 
                onClick={() => useLifeline('fiftyFifty')}
                disabled={!gameState.lifelines.fiftyFifty || gameState.status !== 'playing' || !!selectedOption}
                className="lifeline-btn group flex flex-col items-center"
              >
                <div className="lifeline-icon w-12 h-12 md:w-14 md:h-14 border-2 border-yellow-500/30 bg-slate-900/80 shadow-2xl shadow-yellow-500/10 group-hover:shadow-yellow-500/30 group-hover:scale-110 group-hover:border-yellow-500 transition-all flex items-center justify-center rounded-full backdrop-blur-sm">
                  <Split size={22} className="text-yellow-500 md:w-[26px] md:h-[26px]" />
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-slate-300 mt-2 group-hover:text-yellow-500 transition-colors">{t.lifelines}</span>
              </button>
              <button 
                onClick={() => useLifeline('phoneFriend')}
                disabled={!gameState.lifelines.phoneFriend || gameState.status !== 'playing' || !!selectedOption}
                className="lifeline-btn group flex flex-col items-center"
              >
                <div className="lifeline-icon w-12 h-12 md:w-14 md:h-14 border-2 border-yellow-500/30 bg-slate-900/80 shadow-2xl shadow-yellow-500/10 group-hover:shadow-yellow-500/30 group-hover:scale-110 group-hover:border-yellow-500 transition-all flex items-center justify-center rounded-full backdrop-blur-sm">
                  <Phone size={22} className="text-yellow-500 md:w-[26px] md:h-[26px]" />
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-slate-300 mt-2 group-hover:text-yellow-500 transition-colors">Heval</span>
              </button>
              <button 
                onClick={() => useLifeline('askAudience')}
                disabled={!gameState.lifelines.askAudience || gameState.status !== 'playing' || !!selectedOption}
                className="lifeline-btn group flex flex-col items-center"
              >
                <div className="lifeline-icon w-12 h-12 md:w-14 md:h-14 border-2 border-yellow-500/30 bg-slate-900/80 shadow-2xl shadow-yellow-500/10 group-hover:shadow-yellow-500/30 group-hover:scale-110 group-hover:border-yellow-500 transition-all flex items-center justify-center rounded-full backdrop-blur-sm">
                  <Users size={22} className="text-yellow-500 md:w-[26px] md:h-[26px]" />
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-slate-300 mt-2 group-hover:text-yellow-500 transition-colors">Temaşevan</span>
              </button>
            </div>

          <main className="w-full">
            <AnimatePresence mode="wait">
              {gameState.status === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center glass-card p-6 md:p-10 w-full border-yellow-500/20"
                >
                  <div className="mb-6">
                    <img 
                      src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
                      alt="Logo" 
                      className="h-20 mx-auto object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-2 text-white">{t.title}</h2>
                  <p className="text-slate-400 mb-6 text-xs md:text-sm max-w-xs mx-auto">
                    {t.subtitle}
                  </p>

                  {/* Language Selection on Welcome Screen */}
                  <div className="flex justify-center gap-3 mb-8">
                    {(['ku', 'tr', 'en'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          gameState.language === lang 
                            ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-lg shadow-yellow-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {lang === 'ku' ? 'Kurdî' : lang === 'tr' ? 'Türkçe' : 'English'}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={startGame}
                    className="w-full px-8 py-3.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm shadow-lg shadow-yellow-600/20"
                  >
                    <Play size={18} /> {t.start}
                  </button>
                  {error && <p className="mt-4 text-red-500 text-xs">{error}</p>}
                </motion.div>
              )}

              {gameState.status === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12 relative min-h-[300px] justify-center"
                >
                  <img 
                    src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
                    alt="Loading Background" 
                    className="absolute inset-0 w-full h-full object-contain opacity-10 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <Loader2 size={40} className="text-yellow-500 animate-spin mb-4 relative z-10" />
                  <p className="text-slate-400 animate-pulse font-medium relative z-10">{t.loading}</p>
                </motion.div>
              )}

              {gameState.status === 'playing' && gameState.currentQuestion && (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col gap-4"
                >
                  {/* Timer Display - Prominent */}
                  {gameState.currentLevel <= 5 && (
                    <div className="flex justify-center">
                      <div className={`flex items-center gap-2 px-4 py-1 rounded-xl border-2 transition-all duration-300 shadow-lg ${
                        timeLeft <= 10 
                          ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                          : 'bg-slate-800/50 border-slate-700 text-yellow-500'
                      }`}>
                        <Clock size={20} className={timeLeft <= 10 ? 'animate-spin-slow' : ''} />
                        <span className="font-mono text-2xl font-black tracking-tighter">
                          {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Question Card - Clear and Bold */}
                  <div className="glass-card w-full p-6 md:p-10 text-center border-white/10 shadow-2xl relative overflow-hidden">
                    <AnimatePresence>
                      {lifelineResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          className="absolute inset-0 z-10 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6"
                        >
                          <button 
                            onClick={() => setLifelineResult(null)}
                            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                          {lifelineResult.content}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <span className="text-yellow-500 font-mono text-xs uppercase tracking-[0.3em] mb-3 block font-bold">
                      {gameState.language === 'ku' ? 'Pirs' : gameState.language === 'tr' ? 'Soru' : 'Question'} {gameState.currentLevel} / {RANK_TITLES[gameState.language].length}
                    </span>
                    <h3 className="text-base md:text-2xl font-display font-semibold leading-relaxed text-white">
                      {gameState.currentQuestion.question}
                    </h3>
                  </div>

                  {/* Options Grid - Responsive and readable */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                    {gameState.currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrectAnswer = option === gameState.currentQuestion?.answer;
                      const isHidden = hiddenOptions.includes(option);
                      
                      let statusClass = "";
                      if (isSelected && !isRevealing) statusClass = "selected";
                      else if (isRevealing && isCorrectAnswer) statusClass = "correct";
                      else if (isRevealing && isSelected && !isCorrectAnswer) statusClass = "wrong";

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          disabled={!!selectedOption || isHidden}
                          className={`option-card w-full p-3 md:p-5 text-left flex items-center gap-3 md:gap-4 group ${statusClass} ${isHidden ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs md:text-sm border transition-colors ${
                            statusClass ? 'bg-white/20 border-white/40' : 'bg-slate-800 border-slate-700 text-yellow-500 group-hover:text-white group-hover:border-white/40'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-xs md:text-lg font-medium leading-tight">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {gameState.status === 'lost' && (
                <motion.div 
                  key="lost"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center glass-card p-8 w-full border-red-500/20"
                >
                  <XCircle size={56} className="text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-display font-bold mb-2 text-red-500">
                    {timeLeft === 0 ? t.time_up : t.wrong}
                  </h2>
                  <p className="text-sm mb-4 text-slate-300">
                    {timeLeft === 0 
                      ? t.time_lost 
                      : t.lost_desc(gameState.currentLevel, gameState.language)}
                  </p>
                  {gameState.currentQuestion && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                      <span className="text-slate-400 text-[10px] uppercase tracking-widest block mb-1 font-bold">{t.correct_answer}</span>
                      <span className="text-green-500 font-bold text-lg">{gameState.currentQuestion.answer}</span>
                    </div>
                  )}
                  <button 
                    onClick={startGame}
                    className="w-full px-8 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 mx-auto transition-all text-sm"
                  >
                    <RotateCcw size={18} /> {t.play_again}
                  </button>
                </motion.div>
              )}

              {gameState.status === 'won' && (
                <motion.div 
                  key="won"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center glass-card p-8 w-full border-yellow-500/20"
                >
                  <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-display font-bold mb-2 text-yellow-500">{t.won_title}</h2>
                  <p className="text-sm mb-6 text-slate-300">
                    {t.won_desc}
                  </p>
                  <div className="text-xl md:text-4xl font-black text-yellow-500 mb-8 animate-bounce uppercase tracking-widest leading-tight px-2">
                    {RANK_TITLES[gameState.language][RANK_TITLES[gameState.language].length - 1]}
                  </div>
                  <button 
                    onClick={startGame}
                    className="w-full px-8 py-3.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 mx-auto transition-all text-sm"
                  >
                    <RotateCcw size={18} /> {t.play_again}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <footer className="w-full mt-8 text-slate-600 text-[10px] font-mono text-center pb-4 border-t border-white/5 pt-4">
          {t.title} © 2026 • {gameState.language === 'ku' ? 'KURMANCÎ' : gameState.language === 'tr' ? 'TÜRKÇE' : 'ENGLISH'}
        </footer>
      </div>
    </div>

      {/* Score Modal */}
      <AnimatePresence>
        {isScoreOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-[92vw] max-w-sm p-4 md:p-8 relative border-yellow-500/30 shadow-2xl shadow-yellow-500/5 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsScoreOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-8">
                <img 
                  src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
                  alt="Logo" 
                  className="h-20 mx-auto object-contain mb-4"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-2xl font-display font-black text-white leading-tight uppercase">{t.title}</h2>
                <p className="text-xs text-yellow-500 font-bold italic mt-1">{t.subtitle}</p>
              </div>

              <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center border-b border-slate-800 pb-2">{t.rank}</div>
                <div className="flex flex-col gap-0.5 md:gap-1">
                  {[...RANK_TITLES[gameState.language]].reverse().map((rank, idx) => {
                    const level = RANK_TITLES[gameState.language].length - idx;
                    const isCurrent = gameState.currentLevel === level;
                    const isPassed = gameState.currentLevel > level;
                    const isSafePoint = level === 5 || level === 10 || level === 13;

                    return (
                      <div 
                        key={level}
                        className={`prize-item flex items-center gap-2 md:gap-4 px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all ${
                          isCurrent ? 'active text-white font-bold bg-yellow-600/20 border border-yellow-500/30' : 
                          isPassed ? 'text-slate-600' : 
                          isSafePoint ? 'text-white font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <span className="w-5 md:w-6 text-right font-mono text-[10px] md:text-xs opacity-60">{level}</span>
                        <span className={`flex-1 font-display text-xs md:text-sm tracking-wide ${isCurrent ? 'text-yellow-400' : ''}`}>{rank}</span>
                      </div>
                    );
                  })}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
