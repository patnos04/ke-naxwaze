import React, { useState } from 'react';

export default function App() {
  // Durum Yönetimi
  const [view, setView] = useState('welcome');
  const [lang, setLang] = useState('tr');
  const [isLogged, setIsLogged] = useState(false);
  const [pass, setPass] = useState('');

  // Çeviriler
  const t = {
    tr: { title: "KÊ NAXWAZE BI SERKEVE", start: "BAŞLA", submit: "Soru Gönder", subtitle: "İzmir Patnoslular Derneği Ürünüdür", admin: "ADMIN CONTROL" },
    ku: { title: "KÊ NAXWAZE BI SERKEVE", start: "DEST PÊ BIKE", submit: "Pirsê Bişîne", subtitle: "Berhema Komeleya Patnosiyên Îzmîrê ye", admin: "KONTROLA ADMIN" }
  }[lang === 'ku' ? 'ku' : 'tr'];

  // --- ADMIN EKRANI ---
  if (view === 'admin') {
    return (
      <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '320px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Admin Girişi</h2>
          <input 
            type="password" 
            placeholder="Şifre" 
            style={{ width: '80%', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: 'none', textAlign: 'center', fontSize: '18px' }} 
            onChange={(e) => setPass(e.target.value)} 
          />
          <button 
            onClick={() => {
              if(pass === '1234') { setIsLogged(true); alert("Giriş Başarılı!"); } 
              else { alert("Şifre Yanlış! (İpucu: 1234)"); }
            }} 
            style={{ width: '100%', padding: '15px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            GİRİŞ YAP
          </button>
          <button onClick={() => setView('welcome')} style={{ marginTop: '20px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            Vazgeç ve Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // --- ANA EKRAN ---
  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', backgroundImage: 'radial-gradient(circle at top, #1e293b 0%, #070b14 70%)' }}>
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)', padding: '50px 30px', borderRadius: '50px', textAlign: 'center', width: '90%', maxWidth: '380px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* LOGO */}
        <img src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" style={{ height: '110px', marginBottom: '20px' }} alt="Logo" />
        
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '900', margin: '0 0 5px 0' }}>{t.title}</h1>
        <p style={{ color: '#ca8a04', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '30px' }}>{t.subtitle}</p>

        {/* DİL SEÇİMİ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setLang('ku')} style={{ padding: '8px 20px', borderRadius: '12px', border: lang === 'ku' ? '2px solid #ca8a04' : '1px solid rgba(255,255,255,0.1)', backgroundColor: lang === 'ku' ? '#ca8a04' : 'transparent', color: lang === 'ku' ? 'black' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>KU</button>
          <button onClick={() => setLang('tr')} style={{ padding: '8px 20px', borderRadius: '12px', border: lang === 'tr' ? '2px solid #ca8a04' : '1px solid rgba(255,255,255,0.1)', backgroundColor: lang === 'tr' ? '#ca8a04' : 'transparent', color: lang === 'tr' ? 'black' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>TR</button>
        </div>

        {/* ANA BUTONLAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => alert("Oyun yakında başlayacak! Sorular yükleniyor...")}
            style={{ padding: '18px', backgroundColor: '#ca8a04', color: 'white', border: 'none', borderRadius: '20px', fontSize: '18px', fontWeight: '900', cursor: 'pointer' }}
          >
            ▶ {t.start}
          </button>

          <button 
            onClick={() => alert("Soru gönderme formu açılıyor...")}
            style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + {t.submit}
          </button>
        </div>

        {/* ADMIN GİRİŞİ (DAHA BÜYÜK TIKLAMA ALANI) */}
        <div 
          onClick={() => setView('admin')} 
          style={{ marginTop: '40px', color: '#334155', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          🔒 {t.admin}
        </div>
      </div>
    </div>
  );
}
