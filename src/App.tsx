import React, { useState } from 'react';

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');

  const t = lang === 'tr' ? { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA" } : { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE" };

  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '50px', borderRadius: '40px', textAlign: 'center', border: '1px solid #ca8a04' }}>
        <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" style={{ height: '100px', marginBottom: '20px' }} alt="Logo" />
        <h1>{t.title}</h1>
        <div style={{ margin: '20px 0' }}>
           <button onClick={() => setLang('tr')} style={{ marginRight: '10px' }}>TR</button>
           <button onClick={() => setLang('ku')}>KU</button>
        </div>
        <button 
          onClick={() => {
            const p = prompt("Admin Şifresi:");
            if(p === "Mihriban04") alert("Hoş geldin Mihriban!");
          }}
          style={{ padding: '15px 30px', backgroundColor: '#ca8a04', border: 'none', borderRadius: '15px', color: 'white', fontWeight: 'bold' }}
        >
          {t.start}
        </button>
      </div>
    </div>
  );
}
