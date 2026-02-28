import React, { useState } from 'react';

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [pass, setPass] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  // Çeviriler
  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür", admin: "ADMIN CONTROL", back: "Geri Dön" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye", admin: "KONTROLA ADMIN", back: "Vegere" }
  }[lang === 'ku' ? 'ku' : 'tr'];

  // --- 1. OYUN EKRANI (ŞİMDİLİK TASLAK) ---
  if (view === 'game') {
    return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', padding: '20px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ color: '#ca8a04' }}>SORU 1</h2>
        <p style={{ fontSize: '20px', margin: '40px 0' }}>Patnos hangi ilimize bağlıdır?</p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {['Ağrı', 'Van', 'Erzurum', 'Muş'].map(opt => (
            <button key={opt} style={{ padding: '20px', background: '#0f172a', border: '1px solid #ca8a04', color: 'white', borderRadius: '15px' }}>{opt}</button>
          ))}
        </div>
        <button onClick={() => setView('welcome')} style={{ marginTop: '40px', color: '#64748b', background: 'none', border: 'none' }}>{t.back}</button>
      </div>
    );
  }

  // --- 2. SORU GÖNDERME EKRANI ---
  if (view === 'submit') {
    return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', padding: '20px', color: 'white', textAlign: 'center' }}>
        <h2>Soru Öner</h2>
        <textarea placeholder="Sorunuzu buraya yazın..." style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '15px', marginBottom: '10px' }} />
        <button style={{ width: '100%', padding: '15px', background: '#ca8a04', border: 'none', borderRadius: '15px', fontWeight: 'bold' }}>GÖNDER</button>
        <button onClick={() => setView('welcome')} style={{ marginTop: '20px', color: '#64748b', background: 'none', border: 'none' }}>{t.back}</button>
      </div>
    );
  }

  // --- 3. ADMIN PANELİ ---
  if (view === 'admin') {
    if (!isLogged) return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '320px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2>Admin Girişi</h2>
          <input type="password" placeholder="Şifre" style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: 'none', textAlign: 'center' }} onChange={(e) => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'Mihriban04') setIsLogged(true); else alert("Hatalı!"); }} style={{ width: '100%', padding: '15px', background: '#ca8a04', color: 'white', borderRadius: '15px', fontWeight: 'bold' }}>GİRİŞ</button>
          <button onClick={() => setView('welcome')} style={{ marginTop: '20px', color: '#64748b', background: 'none', border: 'none' }}>Vazgeç</button>
        </div>
      </div>
    );
    return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', padding: '20px', color: 'white' }}>
        <h2>Yönetim Paneli</h2>
        <p>Hoş geldin Mihriban! Bekleyen soru yok.</p>
        <button onClick={() => { setIsLogged(false); setView('welcome'); }} style={{ color: '#ca8a04', background: 'none', border: 'none' }}>Çıkış Yap</button>
      </div>
    );
  }

  // --- ANA EKRAN ---
  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '50px 30px', borderRadius: '50px', textAlign: 'center', width: '90%', maxWidth: '380px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" style={{ height: '110px', marginBottom: '20px' }} alt="Logo" />
        <h1 style={{ color: 'white', fontSize: '24px' }}>{t.title}</h1>
        <p style={{ color: '#ca8a04', fontSize: '10px', fontWeight: 'bold', marginBottom: '30px' }}>{t.subtitle}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setLang('ku')} style={{ padding: '8px 20px', borderRadius: '12px', background: lang === 'ku' ? '#ca8a04' : 'transparent', color: lang === 'ku' ? 'black' : 'white', border: '1px solid #ca8a04' }}>KU</button>
          <button onClick={() => setLang('tr')} style={{ padding: '8px 20px', borderRadius: '12px', background: lang === 'tr' ? '#ca8a04' : 'transparent', color: lang === 'tr' ? 'black' : 'white', border: '1px solid #ca8a04' }}>TR</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => setView('game')} style={{ padding: '18px', backgroundColor: '#ca8a04', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>{t.start}</button>
          <button onClick={() => setView('submit')} style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>{t.submit}</button>
        </div>

        <div onClick={() => setView('admin')} style={{ marginTop: '40px', color: '#334155', fontSize: '11px', cursor: 'pointer' }}>🔒 {t.admin}</div>
      </div>
    </div>
  );
}
