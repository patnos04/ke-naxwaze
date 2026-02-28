import React, { useState, useEffect } from 'react';
// @ts-ignore (Supabase bağlantısı kalsın, veri çekmek için lazım)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);

  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye" }
  }[lang];

  useEffect(() => {
    async function getQuestions() {
      const { data } = await supabase.from('questions').select('*').eq('is_approved', true);
      if (data && data.length > 0) setQuestions(data);
    }
    getQuestions();
  }, []);

  // --- GENEL STİLLER ---
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#070b14',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    color: 'white',
    padding: '20px'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '40px 30px',
    borderRadius: '40px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid rgba(234, 179, 8, 0.2)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  };

  const buttonStyle = (isGold = false): React.CSSProperties => ({
    padding: '16px',
    backgroundColor: isGold ? '#ca8a04' : 'rgba(255,255,255,0.05)',
    color: 'white',
    border: isGold ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '12px',
    width: '100%',
    transition: '0.2s'
  });

  // --- OYUN EKRANI ---
  if (view === 'game') {
    const q = questions[currentQ] || { question_text: "Sorular Yükleniyor...", option_a: "...", option_b: "...", option_c: "...", option_d: "..." };
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{color: '#ca8a04', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px'}}>SORU {currentQ + 1}</div>
          <h2 style={{fontSize: '20px', marginBottom: '30px'}}>{q.question_text}</h2>
          {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => (
            <button 
              key={i} 
              onClick={() => {
                if (opt === q.correct_answer) {
                  if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
                  else { alert("TEBRİKLER!"); setView('welcome'); }
                } else { alert("Yanlış!"); setView('welcome'); }
              }}
              style={buttonStyle()}
            >
              {String.fromCharCode(65 + i)}: {opt}
            </button>
          ))}
          <button onClick={() => setView('welcome')} style={{background: 'none', border: 'none', color: '#64748b', marginTop: '20px', cursor: 'pointer'}}>Vazgeç</button>
        </div>
      </div>
    );
  }

  // --- ANA SAYFA ---
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img 
          src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
          style={{ height: '100px', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(202,138,4,0.4))' }} 
          alt="Logo" 
        />
        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 5px 0' }}>{t.title}</h1>
        <p style={{ color: '#ca8a04', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '30px' }}>{t.subtitle}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setLang('ku')} style={{ padding: '8px 15px', borderRadius: '10px', background: lang === 'ku' ? '#ca8a04' : 'none', color: 'white', border: '1px solid #ca8a04', cursor: 'pointer' }}>KU</button>
          <button onClick={() => setLang('tr')} style={{ padding: '8px 15px', borderRadius: '10px', background: lang === 'tr' ? '#ca8a04' : 'none', color: 'white', border: '1px solid #ca8a04', cursor: 'pointer' }}>TR</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setView('game')} style={buttonStyle(true)}>{t.start}</button>
          <button onClick={() => alert("Soru Gönderme Yakında!")} style={buttonStyle()}>{t.submit}</button>
        </div>

        <div 
          onClick={() => { const p = prompt("Şifre:"); if(p === "Mihriban04") alert("Giriş Başarılı!"); }} 
          style={{ marginTop: '30px', color: '#334155', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔒 ADMIN CONTROL
        </div>
      </div>
    </div>
  );
}
