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
  {tip:'cikis',tarih:'21.05.2025 09:15',urunler:[{ad:'Amortisör Ön · Monroe · Megane 2018',adet:1}]},
  {tip:'giris',tarih:'20.05.2025 17:30',urunler:[{ad:'Yağ Filtresi · Bosch · Megane 2018',adet:10},{ad:'Ön Fren Balatası · TRW · Focus 2012',adet:5}]},
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', fontSize: 13, background: '#f5f5f5' }}>
      {/* SOL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginRight: 4 }}>
            Env<span style={{ color: '#1D9E75' }}>anta</span>
          </div>
          <div style={{ display: 'flex', gap: 2, background: '#f3f3f3', borderRadius: 8, padding: 3 }}>
            {['urunler','girdi','ozet'].map((t, i) => (
              <button key={t} onClick={() => setAktifTab(t)} style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: aktifTab === t ? '1px solid #e0e0e0' : 'none', background: aktifTab === t ? '#fff' : 'none', fontWeight: aktifTab === t ? 600 : 400, color: aktifTab === t ? '#111' : '#666' }}>
                {['Ürünler','Girdi Sepeti','Özet'][i]}
              </button>
            ))}
          </div>
        </div>

        {/* ÜRÜNLER */}
        {aktifTab === 'urunler' && (
          <>
            <div style={{ padding: '8px 14px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün, marka, araç modeli veya yıl ara..." style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {Object.keys(grups).map(ad => {
                const markalar = grups[ad];
                const toplam = markalar.reduce((a, u) => a + u.stok, 0);
                const acik = !!acikGruplar[ad] || search.length > 0;
                return (
                  <div key={ad} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                    <div onClick={() => toggleGrup(ad)} style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', cursor: 'pointer', gap: 8 }}>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{ad}</span>
                      <span style={{ fontSize: 11, color: '#888' }}>{markalar.length} varyant · toplam {toplam}</span>
                      <span style={{ fontSize: 12, color: '#888', transform: acik ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>▼</span>
                    </div>
                    {acik && (
                      <div style={{ borderTop: '1px solid #e5e5e5' }}>
                        {markalar.map(u => {
                          const isSecili = !!secili[u.id];
                          return (
                            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto auto 32px', alignItems: 'center', padding: '7px 12px 7px 24px', borderBottom: '1px solid #f0f0f0', gap: 8, background: isSecili ? '#EAF3DE' : 'transparent' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#888' }}>{u.no}</span>
                              <span style={{ fontSize: 12, fontWeight: 500 }}>{u.marka} · <span style={{ color: '#666', fontWeight: 400 }}>{u.model} {u.yil}</span></span>
                              <span style={{ fontSize: 11, background: '#f3f3f3', padding: '1px 6px', borderRadius: 6, color: '#666' }}>{u.raf}</span>
                              <span style={{ fontWeight: 600, fontSize: 12, color: u.stok === 0 ? '#A32D2D' : u.stok === 1 ? '#A32D2D' : '#3B6D11' }}>{u.stok}</span>
                              <button onClick={() => toggleSec(u.id)} disabled={u.stok === 0} style={{ width: 28, height: 24, borderRadius: 6, border: '1px solid #e0e0e0', background: isSecili ? '#1D9E75' : 'none', color: isSecili ? '#fff' : '#666', cursor: u.stok === 0 ? 'not-allowed' : 'pointer', opacity: u.stok === 0 ? 0.3 : 1, fontSize: 14 }}>
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
              <input value={girdiSearch} onChange={e => setGirdiSearch(e.target.value)} placeholder="Ürün ara..." style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ürün Listesi</div>
                <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '4px 10px', maxHeight: 400, overflowY: 'auto' }}>
                  {girdiFiltered.map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 12 }}>{u.ad}<br /><span style={{ color: '#888', fontSize: 10 }}>{u.marka} · {u.model} · {u.yil}</span></span>
                      <button onClick={() => girdiEkle(u.id)} style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6, padding: '1px 8px', cursor: 'pointer', fontSize: 14, color: '#1D9E75', fontWeight: 600 }}>+</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Girdi Sepeti</div>
                <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '4px 10px', minHeight: 60 }}>
                  {girdiKeys.length === 0 ? <div style={{ fontSize: 11, color: '#999', padding: '6px 0' }}>Henüz ürün eklenmedi</div> :
                    girdiKeys.map(id => {
                      const g = girdiSepet[id];
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', fontSize: 11, borderBottom: '1px solid #f0f0f0', gap: 6 }}>
                          <span style={{ flex: 1 }}>{g.ad}<br /><span style={{ color: '#888', fontSize: 10 }}>{g.marka} · {g.model} {g.yil}</span></span>
                          <input type="number" min="1" value={g.adet} onChange={e => setGirdiSepet(prev => ({ ...prev, [id]: { ...prev[id], adet: Math.max(1, +e.target.value) } }))} style={{ width: 42, fontSize: 12, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 6, padding: '2px 4px' }} />
                          <button onClick={() => setGirdiSepet(prev => { const next = { ...prev }; delete next[id]; return next; })} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 14 }}>✕</button>
                        </div>
                      );
                    })
                  }
                </div>
                <button onClick={girdiOnayla} style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>✓ Stoğa Ekle</button>
              </div>
            </div>
          </>
        )}

        {/* ÖZET */}
        {aktifTab === 'ozet' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>İşlem Geçmişi</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {gecmis.map((g, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                    <span style={{ background: g.tip === 'giris' ? '#EAF3DE' : '#FCEBEB', color: g.tip === 'giris' ? '#3B6D11' : '#A32D2D', fontSize: 10, padding: '1px 6px', borderRadius: 8 }}>{g.tip === 'giris' ? 'Giriş' : 'Çıkış'}</span>
                    <span style={{ color: '#888', fontSize: 10, marginLeft: 4 }}>{g.tarih}</span>
                  </div>
                  {g.urunler.map((u, j) => (
                    <div key={j} style={{ fontSize: 11, color: '#666', padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}><strong style={{ color: '#111' }}>{u.ad}</strong> × {u.adet}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SAĞ PANEL */}
      <div style={{ width: 256, background: '#fff', borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
        {/* ÜRÜN EKLE */}
        <div style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ürün Ekle</div>
          {[{v:fAd,s:setFAd,p:'Ürün adı'},{v:fMarka,s:setFMarka,p:'Marka'},{v:fNo,s:setFNo,p:'Ürün numarası'},{v:fRaf,s:setFRaf,p:'Raf kodu (A1, B3...)'}].map(({v,s,p}) => (
            <input key={p} value={v} onChange={e => s(e.target.value)} placeholder={p} style={{ width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid #e0e0e0', fontSize: 12, marginBottom: 5 }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 5, marginBottom: 5 }}>
            <input value={fModel} onChange={e => setFModel(e.target.value)} placeholder="Araç modeli" style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e0e0e0', fontSize: 12 }} />
            <input value={fYil} onChange={e => setFYil(e.target.value)} placeholder="Yıl" style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e0e0e0', fontSize: 12 }} />
          </div>
          <input value={fStok} onChange={e => setFStok(e.target.value)} type="number" placeholder="Başlangıç stoğu" min="0" style={{ width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid #e0e0e0', fontSize: 12, marginBottom: 5 }} />
          <button onClick={urunEkle} style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '6px', fontSize: 12, cursor: 'pointer' }}>+ Ekle</button>
        </div>

        {/* SEÇİLİ ÜRÜNLER */}
        <div style={{ padding: 12, borderBottom: '1px solid #e5e5e5', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Seçili Ürünler {satisKeys.length > 0 && <span style={{ fontWeight: 400, color: '#aaa' }}>({satisKeys.length})</span>}
          </div>
          {satisKeys.length === 0 ? <div style={{ fontSize: 11, color: '#999' }}>Listeden ürün seçin</div> :
            satisKeys.map(id => {
              const s = secili[id];
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0', gap: 4 }}>
                  <span style={{ flex: 1, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.ad}<br /><span style={{ fontSize: 10, color: '#888' }}>{s.marka} · {s.model} {s.yil}</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <button onClick={() => azalt(+id)} style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #e0e0e0', background: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{s.adet}</span>
                    <button onClick={() => artir(+id)} style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #e0e0e0', background: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => setSecili(prev => { const next = {...prev}; delete next[id]; return next; })} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              );
            })
          }
          {notif && <div style={{ background: '#1D9E75', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 11, marginTop: 6 }}>{notif}</div>}
        </div>

        <button onClick={satisOnayla} style={{ margin: '8px 10px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>🛒 Satışı Onayla</button>

        {/* EKSİK LİSTE */}
        <div style={{ padding: 12, borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Eksik Liste {eksikler.length > 0 && <span style={{ fontWeight: 400 }}>({eksikler.length})</span>}
          </div>
          {eksikler.length === 0 ? <div style={{ fontSize: 11, color: '#999' }}>Eksik ürün yok</div> :
            eksikler.map(u => (
              <div key={u.id} style={{ fontSize: 11, color: '#A32D2D', padding: '4px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 5, alignItems: 'center' }}>
                ⚠ {u.ad} — {u.marka} · {u.model} {u.yil}
              </div>
            ))
          }
        </div>

        {/* RAF ETİKETLERİ */}
        <div style={{ padding: 12 }}>
          <button onClick={() => setRafAcik(!rafAcik)} style={{ width: '100%', background: 'none', border: '1px solid #e0e0e0', borderRadius: 8, padding: '6px', fontSize: 11, cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            ▦ Raf Etiketleri
          </button>
          {rafAcik && (
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 6, marginTop: 6, maxHeight: 160, overflowY: 'auto' }}>
              {urunler.map(u => {
                const { lines, total } = barcodeLines(u.raf);
                return (
                  <div key={u.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', padding: '5px 8px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, minWidth: 28 }}>{u.raf}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{u.ad} · {u.marka}</div>
                      <div style={{ color: '#888', fontSize: 10 }}>{u.model} {u.yil} · {u.no}</div>
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
  );
}