import React, { useState } from 'react';

// --- GÜVENLİ İKONLAR (SVG) ---
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const LockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function App() {
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [pass, setPass] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye" }
  }[lang];

  // --- ADMIN PANELİ ---
  if (view === 'admin') {
    if (!isLogged) return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Admin Girişi</h2>
          <input type="password" placeholder="Şifre" style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: 'none', textAlign: 'center' }} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === '1234') setIsLogged(true); else alert("Hatalı!"); }} style={{ width: '100%', padding: '12px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>GİRİŞ</button>
          <button onClick={() => setView('welcome')} style={{ marginTop: '10px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer' }}>Geri Dön</button>
        </div>
      </div>
    );
    return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', padding: '40px', color: 'white', fontFamily: 'sans-serif' }}>
        <h1>Admin Paneli</h1>
        <p>Onay bekleyen soru yok.</p>
        <button onClick={() => { setView('welcome'); setIsLogged(false); }} style={{ color: '#ca8a04', background: 'none', border: 'none', cursor: 'pointer' }}>Çıkış Yap</button>
      </div>
    );
  }

  // --- ANA SAYFA ---
  return (
    <div style={{ 
      backgroundColor: '#070b14', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      backgroundImage: 'radial-gradient(circle at top, #1e293b 0%, #070b14 70%)'
    }}>
      <div style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        padding: '50px 30px', 
        borderRadius: '50px', 
        textAlign: 'center', 
        width: '100%', 
        maxWidth: '380px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        
        <img 
          src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
          style={{ height: '110px', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(202, 138, 4, 0.3))' }} 
          alt="Logo" 
        />
        
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '-1px' }}>{t.title}</h1>
        <p style={{ color: '#ca8a04', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '30px' }}>{t.subtitle}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {['ku', 'tr'].map(l => (
            <button 
              key={l}
              onClick={() => setLang(l)} 
              style={{ 
                padding: '8px 20px', 
                borderRadius: '12px', 
                border: lang === l ? '2px solid #ca8a04' : '1px solid rgba(255,255,255,0.1)', 
                backgroundColor: lang === l ? '#ca8a04' : 'transparent',
                color: lang === l ? 'black' : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: '0.3s'
              }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button style={{ 
            padding: '18px', 
            backgroundColor: '#ca8a04', 
            color: 'white', 
            border: 'none', 
            borderRadius: '20px', 
            fontSize: '18px', 
            fontWeight: '900', 
            letterSpacing: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <PlayIcon /> {t.start}
          </button>

          <button style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            color: '#e2e8f0', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '18px', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {t.submit}
          </button>
        </div>

        <button 
          onClick={() => setView('admin')}
          style={{ marginTop: '30px', background: 'none', border: 'none', color: '#334155', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}>
          <LockIcon /> ADMIN CONTROL
        </button>
      </div>
    </div>
  );
}
