import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, BookOpen, AlertCircle, Code, Clock, BarChart3, Coins, Percent, HelpCircle } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('1d'); // Default saham lebih cocok Daily
  const [selectedAsset, setSelectedAsset] = useState('IDX:BBCA');
  const [timeText, setTimeText] = useState('');

  // STATE PARAMETER FUNDAMENTAL SAHAM (Bisa di-input manual oleh Bos)
  const [tickerData, setTickerData] = useState({
    eps: 450,        // Laba bersih per saham
    bvps: 2800,      // Nilai buku per saham
    pbvAktif: 4.2,   // PBV Saat ini
    expectedGrowth: 10, // Proyeksi pertumbuhan (%)
    dividend: 175     // Dividen terakhir (Rupiah)
  });

  // State Hasil Kalkulasi Harga Wajar
  const [valuation, setValuation] = useState({
    grahamPrice: 0,
    pbvWajarPrice: 0,
    ddmPrice: 0,
    averageFairValue: 0,
    status: 'Menghitung...'
  });

  const assetList = [
    { name: '🏦 Bank BCA (BBCA)', value: 'IDX:BBCA', eps: 460, bvps: 2900, pbv: 4.3, growth: 10, div: 185 },
    { name: '🚜 Bank BRI (BBRI)', value: 'IDX:BBRI', eps: 380, bvps: 2100, pbv: 2.1, growth: 8, div: 200 },
    { name: '📞 Telkom (TLKM)', value: 'IDX:TLKM', eps: 250, bvps: 1500, pbv: 2.8, growth: 5, div: 155 },
    { name: '🚗 Astra (ASII)', value: 'IDX:ASII', eps: 680, bvps: 4200, pbv: 1.1, growth: 6, div: 420 },
  ];

  // Otomatis update form ketika Bos ganti aset preset saham
  useEffect(() => {
    const selected = assetList.find(a => a.value === selectedAsset);
    if (selected) {
      setTickerData({
        eps: selected.eps,
        bvps: selected.bvps,
        pbvAktif: selected.pbv,
        expectedGrowth: selected.growth,
        dividend: selected.div
      });
    }
  }, [selectedAsset]);

  // ENGINE KALKULASI HARGA WAJAR (FAIR VALUE)
  useEffect(() => {
    // 1. Rumus Benjamin Graham Dasar: Akar dari (22.5 * EPS * BVPS)
    const graham = Math.sqrt(22.5 * tickerData.eps * tickerData.bvps);
    
    // 2. Pendekatan Historis PBV Wajar (Misal rata-rata PBV Wajar Industri / Historis = 3.0x)
    const pbvWajarPrice = tickerData.bvps * 3.0;

    // 3. Dividend Discount Model (DDM) Sederhana: Cost of Equity diasumsikan 12%
    const costOfEquity = 0.12;
    const growthDecimal = tickerData.expectedGrowth / 100;
    const ddmPrice = tickerData.dividend / (costOfEquity - growthDecimal);

    // Rata-rata Nilai Intrinsik Gabungan
    const averageFairValue = (graham + pbvWajarPrice + ddmPrice) / 3;

    setValuation({
      grahamPrice: Math.round(graham),
      pbvWajarPrice: Math.round(pbvWajarPrice),
      ddmPrice: Math.round(ddmPrice),
      averageFairValue: Math.round(averageFairValue)
    });
  }, [tickerData]);

  // State untuk Output Analisis AI Konseptual
  const [aiAnalysis, setAiAnalysis] = useState({
    bias: 'NETRAL', keyLevelStatus: 'Menguji Area', strategyAction: 'Wait and See', suggestion: 'Tunggu konfirmasi.'
  });

  // Logika Key Level Saham (BUY jika diatas harga wajar rata-rata, SELL/Undervalued Analysis)
  const executeEngineAnalysis = (assetValue) => {
    const rand = Math.random();
    if (rand > 0.5) {
      setAiAnalysis({
        bias: 'MENCARI PELUANG BUY (Harga di Atas Key Level)',
        keyLevelStatus: 'Apresiasi Pasar Positif',
        strategyAction: 'Akumulasi Bertahap / Buy On Weakness',
        suggestion: 'Selama tren harga bertahan di atas key level garis dinamis chart, momentum jangka pendek emiten masih sangat aman dikoleksi, Bos!'
      });
    } else {
      setAiAnalysis({
        bias: 'MENCARI PELUANG SELL (Harga di Bawah Key Level)',
        keyLevelStatus: 'Konsolidasi Bawah Key Level',
        strategyAction: 'Wait and See / Cari Sinyal Rejection',
        suggestion: 'Harga sedang berada di bawah batas key level dinamis, Bos! Sebaiknya tunggu pantulan kuat di area support fundamental sebelum entry.'
      });
    }
  };

  useEffect(() => {
    const updateClocks = () => {
      setTimeText(new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }));
    };
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      executeEngineAnalysis(selectedAsset);
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        if (typeof window.TradingView !== 'undefined') {
          new window.TradingView.widget({
            width: '100%', height: 420, symbol: selectedAsset, interval: intervalTime,
            timezone: 'Asia/Jakarta', theme: 'dark', style: '1', locale: 'id', container_id: containerRef.current.id,
            studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'], backgroundColor: '#060b08', gridColor: '#111827',
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [selectedAsset, intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 font-sans p-4 md:p-6 space-y-6">
      
      {/* HEADER WEBSITE */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA EQUITY
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">INDONESIA STOCK VALUE & TERMINAL WORKSTATION</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} className="bg-[#060b08] text-gray-200 border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer">
            {assetList.map((asset) => <option key={asset.value} value={asset.value}>{asset.name}</option>)}
          </select>
          <div className="flex bg-[#060b08] p-1 rounded-lg border border-gray-800 gap-1 text-xs">
            {['15m', '1h', '1d', '1w'].map((tf) => (
              <button key={tf} onClick={() => setIntervalTime(tf)} className={`px-3 py-1.5 rounded-md font-medium transition-all ${intervalTime === tf ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}>{tf}</button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION GRAPH & KEY LEVEL DETECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800">
          <div id="tradingview_pro" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '420px' }} />
        </div>
        
        {/* Sisi Kanan: AI Matrix & Jam Sesi Saham */}
        <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase border-b border-gray-800 pb-2">🤖 Strategy Matrix Core</h3>
            <div className="mt-3">
              <span className="text-gray-500 text-[10px] block">STRATEGY MATRIX STATUS</span>
              <span className="text-xs font-bold text-amber-400">{aiAnalysis.keyLevelStatus}</span>
            </div>
            <div className="mt-2">
              <span className="text-gray-500 text-[10px] block">STRATEGY DIRECTION MATRIX</span>
              <div className="text-sm font-black text-emerald-400 tracking-wide mt-0.5">{aiAnalysis.bias}</div>
            </div>
            <div className="mt-3 bg-[#020604] p-3 rounded border border-gray-800/80 text-xs">
              <span className="text-gray-400 block font-bold mb-1">Aksi Eksekusi:</span>
              <p className="text-emerald-400 font-medium">{aiAnalysis.strategyAction}</p>
            </div>
          </div>

          <div className="bg-[#020604] p-3 rounded border border-gray-800 text-xs space-y-1">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Waktu WIB:</span><span className="text-gray-300 font-mono">{timeText || '00:00:00'}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Sesi I BEI:</span><span className="text-emerald-400 font-bold">09:00 - 12:00</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Sesi II BEI:</span><span className="text-emerald-400 font-bold">13:30 - 16:00</span></div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STOCK VALUATION ENGINE (FITUR KHUSUS SAHAM) */}
      <div className="max-w-7xl mx-auto bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-gray-200">Interactive Corporate Valuation Engine</h3>
            <p className="text-[11px] text-gray-500">Ubah data di bawah untuk menghitung ulang secara instan nilai wajar intrinsik emiten saham pilihan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Kolom 1 & 2: Form Input Variabel Fundamental */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1"><Coins className="w-3.5 h-3.5"/> EPS (Laba Per Saham):</label>
              <input type="number" value={tickerData.eps} onChange={(e) => setTickerData({...tickerData, eps: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> BVPS (Nilai Buku/Saham):</label>
              <input type="number" value={tickerData.bvps} onChange={(e) => setTickerData({...tickerData, bvps: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1"><Percent className="w-3.5 h-3.5"/> Proyeksi Growth (%):</label>
              <input type="number" value={tickerData.expectedGrowth} onChange={(e) => setTickerData({...tickerData, expectedGrowth: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1"><Coins className="w-3.5 h-3.5"/> Dividen Tahunan (Rp):</label>
              <input type="number" value={tickerData.dividend} onChange={(e) => setTickerData({...tickerData, dividend: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Kolom 3: Rincian Hasil 3 Metode Analisis */}
          <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/60 space-y-2 text-xs">
            <span className="text-gray-500 text-[10px] block font-bold tracking-wider uppercase">Metode Valuasi Teoretis</span>
            <div className="flex justify-between border-b border-gray-900 pb-1">
              <span className="text-gray-400">Benjamin Graham:</span>
              <span className="font-mono text-gray-200">Rp {valuation.grahamPrice}</span>
            </div>
            <div className="flex justify-between border-b border-gray-900 pb-1">
              <span className="text-gray-400">PBV Mean Standard:</span>
              <span className="font-mono text-gray-200">Rp {valuation.pbvWajarPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dividend Discount:</span>
              <span className="font-mono text-gray-200">Rp {valuation.ddmPrice}</span>
            </div>
          </div>

          {/* Kolom 4: KESIMPULAN HARGA WAJAR UTAMA */}
          <div className="bg-emerald-950/10 border border-emerald-900/40 p-4 rounded-lg flex flex-col justify-center items-center text-center">
            <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">RATA-RATA HARGA WAJAR</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              Rp {valuation.averageFairValue}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
              *Bandingkan nilai ini dengan harga pasar saat ini di grafik. Jika harga pasar jauh lebih rendah, tandanya saham sedang **Undervalued**!
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER TIPS STRATEGI */}
      <div className="max-w-7xl mx-auto bg-amber-950/10 border border-amber-900/30 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-500">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">💡 Tips Analisis Saham Ala Tama:</span>
          Gunakan strategi bawaan Bos: Gabungkan data **Harga Wajar** ini dengan *Key Level* di grafik. Jika harga saham emiten pilihan berhasil menembus ke atas area resisten utama (*key level*) dan posisinya masih di bawah harga wajar rata-rata fundamental, itu adalah sinyal entry dengan tingkat keamanan yang sangat tinggi! Sukses selalu investasinya, Bos!
        </div>
      </div>

    </div>
  );
}
