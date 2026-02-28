import React, { useState } from 'react';
import { Play, PlusCircle, Lock, Database, CheckCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');

  const content = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne" }
  };

  const t = lang === 'ku' ? content.ku : content.tr;

  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '40px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px' }}>
        <img 
          src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
          style={{ height: '100px', marginBottom: '20px' }} 
          alt="Logo" 
        />
        <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>{t.title}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setLang('ku')} style={{ padding: '5px 15px', borderRadius: '10px', border: lang === 'ku' ? '2px solid #ca8a04' : '1px solid #334155', background: 'transparent', color: 'white', cursor: 'pointer' }}>KU</button>
          <button onClick={() => setLang('tr')} style={{ padding: '5px 15px', borderRadius: '10px', border: lang === 'tr' ? '2px solid #ca8a04' : '1px solid #334155', background: 'transparent', color: 'white', cursor: 'pointer' }}>TR</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button style={{ padding: '15px', backgroundColor: '#ca8a04', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>
            {t.start}
          </button>
          <button style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
