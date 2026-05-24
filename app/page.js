'use client';
import { useState } from 'react';

const initialUrunler = [
  {id:1,no:'SG-4401',ad:'Amortisör Ön',marka:'Monroe',model:'Renault Megane',yil:'2018',stok:4,raf:'A1'},
  {id:2,no:'SG-4402',ad:'Amortisör Ön',marka:'Monroe',model:'Renault Megane',yil:'2012',stok:2,raf:'A1'},
  {id:3,no:'SG-4403',ad:'Amortisör Ön',marka:'Kayaba',model:'Ford Focus',yil:'2015',stok:0,raf:'A2'},
  {id:4,no:'MF-1042',ad:'Yağ Filtresi',marka:'Bosch',model:'Renault Megane',yil:'2018',stok:8,raf:'B1'},
  {id:5,no:'MF-1043',ad:'Yağ Filtresi',marka:'Mann',model:'Ford Focus',yil:'2015',stok:3,raf:'B1'},
  {id:6,no:'MF-1044',ad:'Yağ Filtresi',marka:'Fram',model:'Volkswagen Passat',yil:'2016',stok:1,raf:'B2'},
  {id:7,no:'FR-2201',ad:'Ön Fren Balatası',marka:'Bosch',model:'Renault Megane',yil:'2018',stok:1,raf:'C1'},
  {id:8,no:'FR-2202',ad:'Ön Fren Balatası',marka:'TRW',model:'Ford Focus',yil:'2012',stok:5,raf:'C1'},
  {id:9,no:'FR-2203',ad:'Ön Fren Balatası',marka:'Brembo',model:'BMW 3 Serisi',yil:'2019',stok:3,raf:'C2'},
  {id:10,no:'EL-3301',ad:'Far Ampulü',marka:'Philips',model:'Volkswagen Passat',yil:'2016',stok:12,raf:'D1'},
  {id:11,no:'EL-3302',ad:'Far Ampulü',marka:'Osram',model:'Renault Megane',yil:'2012',stok:6,raf:'D1'},
  {id:12,no:'EL-3303',ad:'Marş Motoru',marka:'Bosch',model:'Ford Focus',yil:'2015',stok:0,raf:'D2'},
];

const initialGecmis = [
  {tip:'cikis',tarih:'22.05.2026 09:15',urunler:[{ad:'Amortisör Ön · Monroe · Megane 2018',adet:1}]},
  {tip:'giris',tarih:'20.05.2026 17:30',urunler:[{ad:'Yağ Filtresi · Bosch · Megane 2018',adet:10},{ad:'Ön Fren Balatası · TRW · Focus 2012',adet:5}]},
];

function grupla(liste) {
  const map = {};
  liste.forEach(u => { if (!map[u.ad]) map[u.ad] = []; map[u.ad].push(u); });
  return map;
}

function bugun() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function barcodeLines(kod) {
  const bars = kod.split('').map(c => c.charCodeAt(0));
  const lines = [];
  let x = 0;
  for (let i = 0; i < 20; i++) {
    const w = ((bars[i % bars.length] || 50) + i * 7) % 3 + 1;
    lines.push({ x, w });
    x += w + (i % 3 === 0 ? 2 : 1);
  }
  return { lines, total: x };
}

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: 7,
  border: '1.5px solid #d0d0d0',
  fontSize: 13,
  color: '#111',
  fontWeight: 600,
  background: '#fff',
  marginBottom: 6,
  outline: 'none',
};

export default function Home() {
  const [urunler, setUrunler] = useState(initialUrunler);
  const [secili, setSecili] = useState({});
  const [girdiSepet, setGirdiSepet] = useState({});
  const [acikGruplar, setAcikGruplar] = useState({});
  const [gecmis, setGecmis] = useState(initialGecmis);
  const [aktifTab, setAktifTab] = useState('urunler');
  const [search, setSearch] = useState('');
  const [girdiSearch, setGirdiSearch] = useState('');
  const [notif, setNotif] = useState('');
  const [rafAcik, setRafAcik] = useState(false);
  const [eksikAcik, setEksikAcik] = useState(false);
  const [eksikModal, setEksikModal] = useState(false);
  const [gecmisFilitre, setGecmisFilitre] = useState('tumu');
  const [fAd, setFAd] = useState('');
  const [fMarka, setFMarka] = useState('');
  const [fModel, setFModel] = useState('');
  const [fYil, setFYil] = useState('');
  const [fNo, setFNo] = useState('');
  const [fRaf, setFRaf] = useState('');
  const [fStok, setFStok] = useState('');

  function goster(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(''), 2500);
  }

  function toggleGrup(ad) {
    setAcikGruplar(prev => ({ ...prev, [ad]: !prev[ad] }));
  }

  function toggleSec(id) {
    const u = urunler.find(x => x.id === id);
    if (!u || u.stok === 0) return;
    setSecili(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { ...u, adet: 1 };
      return next;
    });
  }

  function artir(id) {
    const u = urunler.find(x => x.id === id);
    if (!secili[id] || !u) return;
    if (secili[id].adet < u.stok) {
      setSecili(prev => ({ ...prev, [id]: { ...prev[id], adet: prev[id].adet + 1 } }));
    }
  }

  function azalt(id) {
    if (!secili[id]) return;
    if (secili[id].adet > 1) {
      setSecili(prev => ({ ...prev, [id]: { ...prev[id], adet: prev[id].adet - 1 } }));
    } else {
      setSecili(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  function satisOnayla() {
    const keys = Object.keys(secili);
    if (!keys.length) return;
    const urunListesi = [];
    const yeniUrunler = urunler.map(u => {
      if (secili[u.id]) {
        urunListesi.push({ ad: `${u.ad} · ${u.marka} · ${u.model} ${u.yil}`, adet: secili[u.id].adet });
        return { ...u, stok: Math.max(0, u.stok - secili[u.id].adet) };
      }
      return u;
    });
    setUrunler(yeniUrunler);
    setGecmis(prev => [{ tip: 'cikis', tarih: bugun(), urunler: urunListesi }, ...prev]);
    setSecili({});
    goster('Satış tamamlandı, stoklar güncellendi');
  }

  function girdiEkle(id) {
    const u = urunler.find(x => x.id === id);
    if (!u) return;
    setGirdiSepet(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], adet: prev[id].adet + 1 } : { ...u, adet: 1 }
    }));
  }

  function girdiOnayla() {
    const keys = Object.keys(girdiSepet);
    if (!keys.length) return;
    const urunListesi = [];
    const yeniUrunler = urunler.map(u => {
      if (girdiSepet[u.id]) {
        urunListesi.push({ ad: `${u.ad} · ${u.marka} · ${u.model} ${u.yil}`, adet: girdiSepet[u.id].adet });
        return { ...u, stok: u.stok + Number(girdiSepet[u.id].adet) };
      }
      return u;
    });
    setUrunler(yeniUrunler);
    setGecmis(prev => [{ tip: 'giris', tarih: bugun(), urunler: urunListesi }, ...prev]);
    setGirdiSepet({});
    goster('Stoklar güncellendi');
  }

  function urunEkle() {
    if (!fAd || !fMarka || !fModel || !fYil || !fNo || !fRaf) return;
    setUrunler(prev => [...prev, { id: Date.now(), no: fNo, ad: fAd, marka: fMarka, model: fModel, yil: fYil, stok: parseInt(fStok) || 0, raf: fRaf }]);
    setFAd(''); setFMarka(''); setFModel(''); setFYil(''); setFNo(''); setFRaf(''); setFStok('');
    goster(`"${fAd} · ${fMarka}" eklendi`);
  }

  const filtered = urunler.filter(u =>
    u.ad.toLowerCase().includes(search.toLowerCase()) ||
    u.marka.toLowerCase().includes(search.toLowerCase()) ||
    u.model.toLowerCase().includes(search.toLowerCase()) ||
    u.yil.includes(search) ||
    u.no.toLowerCase().includes(search.toLowerCase()) ||
    u.raf.toLowerCase().includes(search.toLowerCase())
  );

  const grups = grupla(filtered);
  const eksikler = urunler.filter(u => u.stok === 0);
  const satisKeys = Object.keys(secili);
  const girdiKeys = Object.keys(girdiSepet);

  const girdiFiltered = urunler.filter(u =>
    u.ad.toLowerCase().includes(girdiSearch.toLowerCase()) ||
    u.marka.toLowerCase().includes(girdiSearch.toLowerCase()) ||
    u.model.toLowerCase().includes(girdiSearch.toLowerCase()) ||
    u.yil.includes(girdiSearch)
  );

  return (
    <>
      <style>{`
        input { font-family: system-ui, sans-serif; }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', fontSize: 13, background: '#f5f5f5', color: '#111' }}>
        {/* SOL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* TOPBAR */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginRight: 4 }}>
              Env<span style={{ color: '#1D9E75' }}>anta</span>
            </div>
            <div style={{ display: 'flex', gap: 2, background: '#f3f3f3', borderRadius: 8, padding: 3 }}>
              {['urunler','girdi','ozet'].map((t, i) => (
                <button key={t} onClick={() => setAktifTab(t)} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: aktifTab === t ? '1px solid #e0e0e0' : 'none', background: aktifTab === t ? '#fff' : 'none', fontWeight: aktifTab === t ? 700 : 500, color: aktifTab === t ? '#111' : '#555' }}>
                  {['Ürünler','Ürün Girişi','Ürün Giriş ve Çıkışları'][i]}
                </button>
              ))}
            </div>
          </div>

          {/* ÜRÜNLER */}
          {aktifTab === 'urunler' && (
            <>
              <div style={{ padding: '8px 14px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün, marka, araç modeli veya yıl ara..." style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {Object.keys(grups).map(ad => {
                  const markalar = grups[ad];
                  const toplam = markalar.reduce((a, u) => a + u.stok, 0);
                  const acik = !!acikGruplar[ad] || search.length > 0;
                  return (
                    <div key={ad} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                      <div onClick={() => toggleGrup(ad)} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', gap: 8 }}>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#111' }}>{ad}</span>
                        <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{markalar.length} varyant · toplam {toplam}</span>
                        <span style={{ fontSize: 12, color: '#888', transform: acik ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>▼</span>
                      </div>
                      {acik && (
                        <div style={{ borderTop: '1px solid #e5e5e5' }}>
                          {markalar.map(u => {
                            const isSecili = !!secili[u.id];
                            return (
                              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto auto 32px', alignItems: 'center', padding: '8px 14px 8px 28px', borderBottom: '1px solid #f0f0f0', gap: 8, background: isSecili ? '#EAF3DE' : 'transparent' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', fontWeight: 600 }}>{u.no}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{u.marka} · <span style={{ color: '#555', fontWeight: 500 }}>{u.model} {u.yil}</span></span>
                                <span style={{ fontSize: 11, background: '#f0f0f0', padding: '2px 7px', borderRadius: 6, color: '#444', fontWeight: 600 }}>{u.raf}</span>
                                <span style={{ fontWeight: 700, fontSize: 13, color: u.stok === 0 ? '#A32D2D' : u.stok === 1 ? '#A32D2D' : '#3B6D11' }}>{u.stok}</span>
                                <button onClick={() => toggleSec(u.id)} disabled={u.stok === 0} style={{ width: 28, height: 26, borderRadius: 6, border: '1.5px solid #e0e0e0', background: isSecili ? '#1D9E75' : 'none', color: isSecili ? '#fff' : '#555', cursor: u.stok === 0 ? 'not-allowed' : 'pointer', opacity: u.stok === 0 ? 0.3 : 1, fontSize: 15, fontWeight: 700 }}>
                                  {isSecili ? '✓' : '+'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* GİRDİ SEPETİ */}
          {aktifTab === 'girdi' && (
            <>
              <div style={{ padding: '8px 14px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
                <input value={girdiSearch} onChange={e => setGirdiSearch(e.target.value)} placeholder="Ürün ara..." style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ürün Listesi</div>
                  <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '4px 10px', maxHeight: 400, overflowY: 'auto' }}>
                    {girdiFiltered.map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f0f0', gap: 6 }}>
                        <span style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{u.ad}</span><br />
                          <span style={{ color: '#666', fontSize: 11, fontWeight: 500 }}>{u.marka} · {u.model} · {u.yil}</span>
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => girdiEkle(u.id)} style={{ background: 'none', border: '1.5px solid #1D9E75', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: 16, color: '#1D9E75', fontWeight: 700 }}>+</button>
                          <button onClick={() => { if (window.confirm(`"${u.ad} · ${u.marka}" silinsin mi?`)) { setUrunler(prev => prev.filter(x => x.id !== u.id)); setGirdiSepet(prev => { const next = {...prev}; delete next[u.id]; return next; }); } }} style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 13, color: '#bbb', fontWeight: 700 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Girdi Sepeti</div>
                  <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '4px 10px', minHeight: 60 }}>
                    {girdiKeys.length === 0 ? <div style={{ fontSize: 12, color: '#888', padding: '6px 0', fontWeight: 500 }}>Henüz ürün eklenmedi</div> :
                      girdiKeys.map(id => {
                        const g = girdiSepet[id];
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', fontSize: 12, borderBottom: '1px solid #f0f0f0', gap: 6 }}>
                            <span style={{ flex: 1 }}>
                              <span style={{ fontWeight: 600, color: '#111' }}>{g.ad}</span><br />
                              <span style={{ color: '#666', fontSize: 11 }}>{g.marka} · {g.model} {g.yil}</span>
                            </span>
                            <input type="number" min="1" value={g.adet} onChange={e => setGirdiSepet(prev => ({ ...prev, [id]: { ...prev[id], adet: Math.max(1, +e.target.value) } }))} style={{ width: 48, fontSize: 13, textAlign: 'center', border: '1.5px solid #d0d0d0', borderRadius: 6, padding: '3px 4px', fontWeight: 600, color: '#111' }} />
                            <button onClick={() => setGirdiSepet(prev => { const next = { ...prev }; delete next[id]; return next; })} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>✕</button>
                          </div>
                        );
                      })
                    }
                  </div>
                  <button onClick={girdiOnayla} style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, cursor: 'pointer', marginTop: 8, fontWeight: 700 }}>✓ Stoğa Ekle</button>
                </div>
              </div>
            </>
          )}

          {/* ÖZET */}
          {aktifTab === 'ozet' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[['tumu','Tümü'],['haftalik','Haftalık'],['aylik','Aylık'],['yillik','Yıllık']].map(([val, label]) => (
                  <button key={val} onClick={() => setGecmisFilitre(val)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: gecmisFilitre === val ? '1.5px solid #1D9E75' : '1.5px solid #e0e0e0', background: gecmisFilitre === val ? '#EAF3DE' : '#fff', color: gecmisFilitre === val ? '#1D9E75' : '#555', fontWeight: gecmisFilitre === val ? 700 : 500 }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {gecmis.filter(g => {
                  if (gecmisFilitre === 'tumu') return true;
                  const [gun, ay, yilSaat] = g.tarih.split('.');
                  const [yil] = yilSaat.split(' ');
                  const tarih = new Date(+yil, +ay - 1, +gun);
                  const simdi = new Date();
                  const fark = (simdi - tarih) / (1000 * 60 * 60 * 24);
                  if (gecmisFilitre === 'haftalik') return fark <= 7;
                  if (gecmisFilitre === 'aylik') return fark <= 30;
                  if (gecmisFilitre === 'yillik') return fark <= 365;
                  return true;
                }).map((g, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '10px 12px', position: 'relative' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: g.tip === 'giris' ? '#EAF3DE' : '#FCEBEB', color: g.tip === 'giris' ? '#3B6D11' : '#A32D2D', fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{g.tip === 'giris' ? 'Giriş' : 'Çıkış'}</span>
                        <span style={{ color: '#666', fontSize: 11, fontWeight: 500 }}>{g.tarih}</span>
                      </div>
                      <button onClick={() => { if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) setGecmis(prev => prev.filter(x => x !== g)); }} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 2px' }} title="Sil">✕</button>
                    </div>
                    {g.urunler.map((u, j) => (
                      <div key={j} style={{ fontSize: 12, color: '#555', padding: '3px 0', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}><strong style={{ color: '#111', fontWeight: 700 }}>{u.ad}</strong> × {u.adet}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ PANEL */}
        <div style={{ width: 260, background: '#fff', borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
          {/* ÜRÜN EKLE */}
          <div style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ürün Ekle</div>
            <input value={fAd} onChange={e => setFAd(e.target.value)} placeholder="Ürün adı" style={inputStyle} />
            <input value={fMarka} onChange={e => setFMarka(e.target.value)} placeholder="Marka" style={inputStyle} />
            <input value={fNo} onChange={e => setFNo(e.target.value)} placeholder="Ürün numarası" style={inputStyle} />
            <input value={fRaf} onChange={e => setFRaf(e.target.value)} placeholder="Raf kodu (A1, B3...)" style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 6, marginBottom: 6 }}>
              <input value={fModel} onChange={e => setFModel(e.target.value)} placeholder="Araç modeli" style={{ ...inputStyle, marginBottom: 0 }} />
              <input value={fYil} onChange={e => setFYil(e.target.value)} placeholder="Yıl" style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
            <input value={fStok} onChange={e => setFStok(e.target.value)} type="number" placeholder="Başlangıç stoğu" min="0" style={inputStyle} />
            <button onClick={urunEkle} style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>+ Ekle</button>
          </div>

          {/* SEÇİLİ ÜRÜNLER */}
          <div style={{ padding: 12, borderBottom: '1px solid #e5e5e5', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Seçili Ürünler {satisKeys.length > 0 && <span style={{ fontWeight: 500, color: '#aaa' }}>({satisKeys.length})</span>}
            </div>
            {satisKeys.length === 0 ? <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Listeden ürün seçin</div> :
              satisKeys.map(id => {
                const s = secili[id];
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f0f0f0', gap: 4 }}>
                    <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: '#111' }}>{s.ad}</span><br />
                      <span style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{s.marka} · {s.model} {s.yil}</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <button onClick={() => azalt(+id)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e0e0e0', background: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center', color: '#111' }}>{s.adet}</span>
                      <button onClick={() => artir(+id)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e0e0e0', background: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                    </div>
                    <button onClick={() => setSecili(prev => { const next = {...prev}; delete next[id]; return next; })} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>✕</button>
                  </div>
                );
              })
            }
            {notif && <div style={{ background: '#1D9E75', color: '#fff', borderRadius: 8, padding: '7px 10px', fontSize: 12, marginTop: 8, fontWeight: 600 }}>{notif}</div>}
          </div>

          <button onClick={satisOnayla} style={{ margin: '8px 10px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}>🛒 Satışı Onayla</button>

          {/* EKSİK LİSTE */}
          <div style={{ borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
            <div
              onClick={() => setEksikAcik(p => !p)}
              style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Eksik Liste {eksikler.length > 0 && <span style={{ fontWeight: 500 }}>({eksikler.length})</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  onClick={e => { e.stopPropagation(); setEksikModal(true); }}
                  title="Tam ekran"
                  style={{ fontSize: 13, color: '#888', cursor: 'pointer', padding: '2px 5px', borderRadius: 4, lineHeight: 1 }}
                >⛶</span>
                <span style={{ fontSize: 11, color: '#aaa', transform: eksikAcik ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>▼</span>
              </div>
            </div>
            {eksikAcik && (
              <div style={{ padding: '0 12px 10px' }}>
                {eksikler.length === 0
                  ? <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Eksik ürün yok</div>
                  : eksikler.map(u => (
                    <div key={u.id} style={{ fontSize: 12, color: '#A32D2D', padding: '4px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 5, alignItems: 'center', fontWeight: 600 }}>
                      ⚠ {u.ad} — {u.marka} · {u.model} {u.yil}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* EKSİK MODAL */}
          {eksikModal && (
            <div
              onClick={() => setEksikModal(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: 14, padding: 24, width: 480, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Eksik Liste ({eksikler.length})</span>
                  <button onClick={() => setEksikModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {eksikler.length === 0
                    ? <div style={{ fontSize: 13, color: '#888' }}>Eksik ürün yok</div>
                    : eksikler.map(u => (
                      <div key={u.id} style={{ fontSize: 13, color: '#A32D2D', padding: '8px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
                        ⚠ {u.ad} — {u.marka} · {u.model} {u.yil}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* RAF ETİKETLERİ */}
          <div style={{ padding: 12 }}>
            <button onClick={() => setRafAcik(!rafAcik)} style={{ width: '100%', background: 'none', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '7px', fontSize: 12, cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600 }}>
              ▦ Raf Etiketleri
            </button>
            {rafAcik && (
              <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 6, marginTop: 6, maxHeight: 160, overflowY: 'auto' }}>
                {urunler.map(u => {
                  const { lines, total } = barcodeLines(u.raf);
                  return (
                    <div key={u.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', padding: '6px 10px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, minWidth: 28, color: '#111' }}>{u.raf}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: '#111' }}>{u.ad} · {u.marka}</div>
                        <div style={{ color: '#666', fontSize: 10, fontWeight: 500 }}>{u.model} {u.yil} · {u.no}</div>
                      </div>
                      <svg viewBox={`0 0 ${total} 22`} height="22" width={total}>
                        {lines.map((l, i) => <rect key={i} x={l.x} y={0} width={l.w} height={22} fill="#111" />)}
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}