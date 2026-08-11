import React, { useEffect, useRef, useState } from 'react';
import { Shield, BookOpen, BarChart3, Coins, Percent, HelpCircle, Flame } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('1d');
  const [selectedAsset, setSelectedAsset] = useState('NASDAQ:NVDA');
  const [timeText, setTimeText] = useState('');

  // STATE PARAMETER FUNDAMENTAL SAHAM GABUNGAN (US & IDX)
  const [tickerData, setTickerData] = useState({
    eps: 4.22,
    bvps: 18.50,
    expectedGrowth: 25,
    dividend: 0.06,
    currency: '$'
  });

  // State Hasil Kalkulasi Tiga Level Harga
  const [valuation, setValuation] = useState({
    fairValue: 0,
    buyPrice: 0,
    fomoPrice: 0
  });

  // LIST SAHAM AMERIKA & INDONESIA
  const assetList = [
    // --- US STOCKS (Wall Street) ---
    { name: '🟢 Nvidia (NVDA) - US', value: 'NASDAQ:NVDA', eps: 4.22, bvps: 18.50, growth: 25, div: 0.06, currency: '$' },
    { name: '🍏 Apple (AAPL) - US', value: 'NASDAQ:AAPL', eps: 6.60, bvps: 4.80, growth: 10, div: 1.00, currency: '$' },
    { name: '🚗 Tesla (TSLA) - US', value: 'NASDAQ:TSLA', eps: 2.50, bvps: 21.00, growth: 20, div: 0.00, currency: '$' },
    { name: '💻 Microsoft (MSFT) - US', value: 'NASDAQ:MSFT', eps: 11.80, bvps: 34.00, growth: 12, div: 3.00, currency: '$' },
    { name: '📦 Amazon (AMZN) - US', value: 'NASDAQ:AMZN', eps: 4.30, bvps: 22.00, growth: 15, div: 0.00, currency: '$' },
    { name: '🔍 Alphabet / Google (GOOGL) - US', value: 'NASDAQ:GOOGL', eps: 7.10, bvps: 26.00, growth: 14, div: 0.80, currency: '$' },
    { name: '📺 Netflix (NFLX) - US', value: 'NASDAQ:NFLX', eps: 18.50, bvps: 52.00, growth: 12, div: 0.00, currency: '$' },
    
    // --- INDONESIAN STOCKS (BEI) ---
    { name: '🏦 Bank BCA (BBCA) - ID', value: 'IDX:BBCA', eps: 460, bvps: 2900, growth: 10, div: 185, currency: 'Rp ' },
    { name: '🚜 Bank BRI (BBRI) - ID', value: 'IDX:BBRI', eps: 380, bvps: 2100, growth: 8, div: 200, currency: 'Rp ' },
    { name: '📞 Telkom (TLKM) - ID', value: 'IDX:TLKM', eps: 250, bvps: 1500, growth: 5, div: 155, currency: 'Rp ' },
    { name: '🚗 Astra (ASII) - ID', value: 'IDX:ASII', eps: 680, bvps: 4200, growth: 6, div: 420, currency: 'Rp ' },
    { name: '⛏️ Adaro Energy (ADRO) - ID', value: 'IDX:ADRO', eps: 520, bvps: 3100, growth: 4, div: 350, currency: 'Rp ' }
  ];

  // DATA SAHAM TRENDING & BERITA BESAR
  const trendingStocks = [
    { ticker: 'NVDA', name: 'Nvidia Corp', sentiment: 'Super Bullish', catalyst: 'Permintaan Chip AI Next-Gen Melambung Tinggi & Rekor Earnings.', effect: '🔥 Rekomendasi Accumulate' },
    { ticker: 'TSLA', name: 'Tesla Inc', sentiment: 'Volatile', catalyst: 'Peluncuran Sistem Autopilot FSD Full Cloud & Ekspansi Pabrik.', effect: '⚠️ Wait and See' },
    { ticker: 'BBCA', name: 'Bank Central Asia', sentiment: 'Bullish Steady', catalyst: 'Rencana Pembagian Dividen Interim Besar & Kenaikan Kredit.', effect: '💎 Pas Buat Invest' },
    { ticker: 'MSFT', name: 'Microsoft', sentiment: 'Bullish', catalyst: 'Integrasi AI Agent ke Seluruh Software Komersial Global.', effect: '🚀 Hold Tren Atas' },
    { ticker: 'BBRI', name: 'Bank Rakyat Indonesia', sentiment: 'Recovery', catalyst: 'Efisiensi Kredit Mikro & Pemulihan Margin NPL Kuartal Ini.', effect: '🛒 Akumulasi Diskon' }
  ];

  // Sinkronisasi otomatis data fundamental saat dropdown aset berubah
  useEffect(() => {
    const selected = assetList.find(a => a.value === selectedAsset);
    if (selected) {
      setTickerData({
        eps: selected.eps,
        bvps: selected.bvps,
        expectedGrowth: selected.growth,
        dividend: selected.div,
        currency: selected.currency
      });
    }
  }, [selectedAsset]);

  // ENGINE VALUASI 3 LEVEL UTAMA (HARGA WAJAR, PAS BELI, FOMO)
  useEffect(() => {
    const baseValue = Math.sqrt(22.5 * tickerData.eps * tickerData.bvps);
    const growthPremium = baseValue * (1 + (tickerData.expectedGrowth / 100) * 0.5);
    const fairValue = (baseValue + growthPremium) / 2;

    const buyPrice = fairValue * 0.85; // Margin of Safety 15%
    const fomoPrice = fairValue * 1.25; // Overvalued Zone 25%

    setValuation({
      fairValue: tickerData.currency === '$' ? parseFloat(fairValue.toFixed(2)) : Math.round(fairValue),
      buyPrice: tickerData.currency === '$' ? parseFloat(buyPrice.toFixed(2)) : Math.round(buyPrice),
      fomoPrice: tickerData.currency === '$' ? parseFloat(fomoPrice.toFixed(2)) : Math.round(fomoPrice)
    });
  }, [tickerData]);

  // Clock Sesi Market
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // PERBAIKAN TOTAL: Suntik Iframe Murni Jalur Cepat (Anti-Limit & Anti-Stuck)
  useEffect(() => {
    if (!containerRef.current) return;

    // Bersihkan kontainer total
    containerRef.current.innerHTML = '';

    // Modifikasi kode interval ke format angka yang dipahami URL widgetembed TradingView
    let tvInterval = 'D';
    if (intervalTime === '15m') tvInterval = '15';
    if (intervalTime === '1h') tvInterval = '60';
    if (intervalTime === '1w') tvInterval = 'W';

    // Buat element iframe direct link ke mirror server TradingView
    const iframe = document.createElement('iframe');
    iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_secure&symbol=${selectedAsset}&interval=${tvInterval}&theme=dark&style=1&timezone=Asia%2FJakarta&studies=%5B%5D&locale=id&whitelabel=1`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('scrolling', 'no');

    containerRef.current.appendChild(iframe);
  }, [selectedAsset, intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 font-sans p-4 md:p-6 space-y-6">
      
      {/* HEADER WEBSITE */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA GLOBAL EQUITY
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">MULTI-MARKET VALUASI SYSTEM & REALTIME WORKSTATION</p>
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

      {/* WORKSTATION FRAME & PANEL EDITOR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800">
          {/* Box penampung iframe dengan tinggi absolut yang pas */}
          <div id="tradingview_secure_frame" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '420px' }} />
        </div>
        
        {/* PANEL METRICS UTAMA */}
        <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase border-b border-gray-800 pb-2">📊 Live Financial Metrics Editor</h3>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 flex items-center gap-1"><Coins className="w-3.5 h-3.5"/> EPS (Earnings Per Share):</label>
                <input type="number" step="0.01" value={tickerData.eps} onChange={(e) => setTickerData({...tickerData, eps: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> BVPS (Book Value Per Share):</label>
                <input type="number" step="0.01" value={tickerData.bvps} onChange={(e) => setTickerData({...tickerData, bvps: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 flex items-center gap-1"><Percent className="w-3.5 h-3.5"/> Projected Growth Rate (%):</label>
                <input type="number" value={tickerData.expectedGrowth} onChange={(e) => setTickerData({...tickerData, expectedGrowth: Number(e.target.value)})} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#020604] p-2.5 rounded border border-gray-800 text-[11px] space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Waktu Jakarta:</span><span className="text-gray-300 font-mono">{timeText || '00:00:00'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mata Uang Aset:</span><span className="text-emerald-400 font-bold font-mono">{tickerData.currency === '$' ? 'USD ($)' : 'Rupiah (Rp)'}</span></div>
          </div>
        </div>
      </div>

      {/* VALUATION SPECTRUM MATRIX */}
      <div className="max-w-7xl mx-auto bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-gray-200">Corporate Multi-Level Valuation Output</h3>
            <p className="text-[11px] text-gray-500">Perhitungan batas area psikologis pasar untuk acuan transaksi beli dan jual, Bos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HARGA PAS BUAT BELI */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg text-center">
            <span className="text-emerald-400 text-[10px] font-bold tracking-wider block mb-1">🛒 HARGA PAS BUAT BELI (MOS ZONE)</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {tickerData.currency}{valuation.buyPrice}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Sangat aman untuk entri karena memiliki bantalan diskon harga murah.</p>
          </div>

          {/* HARGA WAJAR UTAMA */}
          <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-lg text-center">
            <span className="text-blue-400 text-[10px] font-bold tracking-wider block mb-1">⚖️ HARGA WAJAR INTRINSIK</span>
            <div className="text-xl font-black text-blue-400 font-mono">
              {tickerData.currency}{valuation.fairValue}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Nilai fundamental wajar emiten dihitung dari aset nyata dan performa laba.</p>
          </div>

          {/* HARGA FOMO */}
          <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg text-center">
            <span className="text-red-400 text-[10px] font-bold tracking-wider block mb-1">🚨 HARGA FOMO (OVERVALUED AREA)</span>
            <div className="text-xl font-black text-red-400 font-mono">
              {tickerData.currency}{valuation.fomoPrice}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Batas euforia retail! Rawan pembalikan arah karena harga sudah kemahalan.</p>
          </div>
        </div>
      </div>

      {/* TABEL SAHAM TRENDING GLOBAL & REGIONAL */}
      <div className="max-w-7xl mx-auto bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <h3 className="text-sm font-bold text-gray-200">Trending & High Catalyst Market Monitor</h3>
            <p className="text-[11px] text-gray-500">Daftar instrumen aktif dengan volume perdagangan besar dan sentimen berita utama dunia.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#020604] border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="p-3">Kode</th>
                <th className="p-3">Nama Emiten</th>
                <th className="p-3">Sentimen Pasar</th>
                <th className="p-3">Berita Besar / Katalis Utama</th>
                <th className="p-3 text-right">Rekomendasi Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900 text-gray-300">
              {trendingStocks.map((stock, i) => (
                <tr key={i} className="hover:bg-gray-950/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{stock.ticker}</td>
                  <td className="p-3 font-medium">{stock.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      stock.sentiment.includes('Bullish') ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                    }`}>
                      {stock.sentiment}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{stock.catalyst}</td>
                  <td className="p-3 text-right font-medium text-amber-400">{stock.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTIFIKASI PANDUAN EKSEKUSI */}
      <div className="max-w-7xl mx-auto bg-emerald-950/10 border border-emerald-900/30 p-3 rounded-lg flex items-start gap-2 text-xs text-emerald-400">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">💡 Langkah Taktis Jika Mengalami Kendala Koneksi:</span>
          Iframe murni ini memotong alur unduhan script pihak ketiga agar anti-limit. Namun, pastikan Bos tetap mematikan **Ad-Blocker** atau **Brave Shield** untuk domain web Bos ini, karena websocket data harga *real-time* bursa terkadang diblokir otomatis oleh ekstensi pengaman browser.
        </div>
      </div>

    </div>
  );
}
