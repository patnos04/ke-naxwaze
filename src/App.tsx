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
      } else {
        // HATA BURADA: Artık hatanın nedenini göreceğiz
        alert(`${t.submit_fail}\nError: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (e) {
      alert(`${t.submit_fail}\nBağlantı Hatası: ${(e as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
