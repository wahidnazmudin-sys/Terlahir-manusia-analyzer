import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('15m');

  // Widget TradingView akan otomatis merender chart XAUUSD secara real-time
  useEffect(() => {
    if (!containerRef.current) return;

    // Bersihkan kontainer sebelum merender ulang saat timeframe diganti
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          width: '100%',
          height: 450,
          symbol: 'FX_IDC:XAUUSD', // Menggunakan data live Gold spot (XAUUSD)
          interval: intervalTime === '1d' ? 'D' : intervalTime.replace('m', ''), // Menyesuaikan format timeframe
          timezone: 'Asia/Jakarta',
          theme: 'dark',
          style: '1', // Candlestick style
          locale: 'id',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          calendar: false,
          studies: [
            'MASimple@tv-basicstudies', // Menambahkan MA20 otomatis di chart
            'RSI@tv-basicstudies'        // Menambahkan RSI otomatis di chart
          ],
          container_id: containerRef.current.id,
          backgroundColor: '#060b08',
          gridColor: '#111827',
        });
      }
    };

    document.head.appendChild(script);
  }, [intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">XAUUSD REAL-TIME ANALYZER</p>
        </div>
        
        {/* Timeframe Toggles */}
        <div className="flex bg-[#060b08] p-1 rounded-lg border border-gray-800 gap-1 text-xs">
          {['5m', '15m', '30m', '1h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setIntervalTime(tf)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${intervalTime === tf ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Chart (Kiri - Lebar) */}
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300">
              Live Advanced Candlestick (TradingView Engine)
            </h3>
          </div>

          {/* Tempat Widget TradingView Di-render */}
          <div id="tradingview_xauusd" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '450px' }} />
        </div>

        {/* Kolom Sinyal AI (Kanan) */}
        <div className="space-y-6">
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4">AI Analytical Engine</h3>
            
            <div className="space-y-5">
              <div>
                <span className="text-gray-400 text-xs block mb-1">REAL-TIME BIAS DIRECTION</span>
                <div className="text-2xl font-black tracking-wide flex items-center gap-2 text-emerald-400">
                  <TrendingUp /> AUTOMATIC
                </div>
              </div>

              <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/60">
                <span className="text-gray-400 text-[10px] block mb-1">AI ANALYSIS REASONING</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Widget di sebelah kiri sudah dilengkapi dengan indikator MA dan RSI bawaan pabrik. Bos bisa langsung menganalisis struktur market secara visual secara real-time.
                </p>
              </div>

              <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 text-amber-400 text-xs">
                <span className="font-bold block mb-0.5">📌 Catatan Tama:</span>
                Gunakan alat gambar di panel kiri chart untuk memetakan Key Level, Supply, dan Demand andalan Bos secara manual biar makin tajam akurasinya!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
