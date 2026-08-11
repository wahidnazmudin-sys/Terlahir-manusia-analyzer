import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, RefreshCw } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('15m');
  
  // State untuk menyimpan aset yang dipilih Bos lewat web
  const [selectedAsset, setSelectedAsset] = useState('FX_IDC:XAUUSD');

  // Daftar pilihan aset (Bisa Bos tambah sendiri daftarnya di sini)
  const assetList = [
    { name: '🥇 Emas (XAUUSD)', value: 'FX_IDC:XAUUSD' },
    { name: '🏦 Bank BCA (BBCA)', value: 'IDX:BBCA' },
    { name: '🚜 Bank BRI (BBRI)', value: 'IDX:BBRI' },
    { name: '📞 Telkom (TLKM)', value: 'IDX:TLKM' },
    { name: '🚗 Astra (ASII)', value: 'IDX:ASII' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Bersihkan kontainer sebelum merender ulang saat aset atau timeframe berubah
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
          symbol: selectedAsset, // Otomatis mengikuti aset yang dipilih Bos
          interval: intervalTime === '1d' ? 'D' : intervalTime.replace('m', ''),
          timezone: 'Asia/Jakarta',
          theme: 'dark',
          style: '1',
          locale: 'id',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true, // Bos juga bisa ketik manual kodenya di chart
          container_id: containerRef.current.id,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          backgroundColor: '#060b08',
          gridColor: '#111827',
        });
      }
    };

    document.head.appendChild(script);
  }, [selectedAsset, intervalTime]); // Efek akan jalan ulang setiap kali Aset atau Timeframe berubah

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">MULTI-ASSET REAL-TIME ANALYZER</p>
        </div>
        
        {/* Kontrol Aset & Timeframe */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* ========================================== */}
          {/* DROPDOWN MENU PILIHAN ASET LANGSUNG DI WEB */}
          {/* ========================================== */}
          <div className="flex flex-col">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-[#060b08] text-gray-200 border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {assetList.map((asset) => (
                <option key={asset.value} value={asset.value}>
                  {asset.name}
                </option>
              ))}
            </select>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Chart (Kiri) */}
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300">
              Live Advanced Candlestick ({assetList.find(a => a.value === selectedAsset)?.name || 'Asset'})
            </h3>
          </div>

          {/* Tempat Widget TradingView Di-render */}
          <div id="tradingview_multiasset" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '450px' }} />
        </div>

        {/* Kolom Sinyal AI (Kanan) */}
        <div className="space-y-6">
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4">AI Analytical Engine</h3>
            
            <div className="space-y-5">
              <div>
                <span className="text-gray-400 text-xs block mb-1">SELECTED MARKET</span>
                <div className="text-lg font-black tracking-wide text-emerald-400 uppercase">
                  {assetList.find(a => a.value === selectedAsset)?.name.split(' ')[1] || 'ACTIVE'}
                </div>
              </div>

              <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/60">
                <span className="text-gray-400 text-[10px] block mb-1">PANDUAN NAVIGASI</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Bos bisa mengganti target analisa secara instan lewat menu pilihan di pojok kanan atas halaman ini. Indikator MA dan RSI akan langsung menyesuaikan otomatis dengan aset terpilih.
                </p>
              </div>

              <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 text-amber-400 text-xs">
                <span className="font-bold block mb-0.5">📌 Catatan Tama:</span>
                Jika memilih saham Indonesia (IDX), grafik hanya akan bergerak aktif saat jam buka bursa saham saja ya, Bos! (Senin - Jumat jam 09:00 - 16:00 WIB).
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
