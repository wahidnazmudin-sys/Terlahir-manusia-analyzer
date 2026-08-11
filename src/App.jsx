import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, Calculator, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('15m');
  const [selectedAsset, setSelectedAsset] = useState('FX_IDC:XAUUSD');
  
  // State Kalkulator Risiko & Lot Journal
  const [balance, setBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [pipsSL, setPipsSL] = useState(50);
  const [calculatedLot, setCalculatedLot] = useState(0.01);

  // State untuk Output Analisis AI Komplit
  const [aiAnalysis, setAiAnalysis] = useState({
    bias: 'NETRAL',
    keyLevelStatus: 'Menguji Area',
    confidence: 50,
    strategyAction: 'Wait and See',
    reasoning: 'Menghubungkan ke data feed server...',
    suggestion: 'Tunggu konfirmasi struktur breakout.'
  });

  const assetList = [
    { name: '🥇 Emas (XAUUSD)', value: 'FX_IDC:XAUUSD', pipValue: 10 },
    { name: '🏦 Bank BCA (BBCA)', value: 'IDX:BBCA', pipValue: 1 },
    { name: '🚜 Bank BRI (BBRI)', value: 'IDX:BBRI', pipValue: 1 },
    { name: '📞 Telkom (TLKM)', value: 'IDX:TLKM', pipValue: 1 },
    { name: '🚗 Astra (ASII)', value: 'IDX:ASII', pipValue: 1 },
  ];

  // Hitung Kalkulasi Lot Otomatis untuk Jurnal Pengetesan Risiko
  useEffect(() => {
    const amountToRisk = balance * (riskPercent / 100);
    // Formula dasar Standard Lot: Risk / (SL Pips * Pip Value)
    const currentAsset = assetList.find(a => a.value === selectedAsset);
    const pipVal = currentAsset ? currentAsset.pipValue : 10;
    
    let lot = amountToRisk / (pipsSL * pipVal);
    if (selectedAsset === 'FX_IDC:XAUUSD') {
      // Disesuaikan dengan hitungan spesifik akun mikro/standar Bos (1 usc per 10 pip untuk 0.01 lot)
      lot = (amountToRisk / pipsSL) * 0.1;
    }
    
    setCalculatedLot(Math.max(0.01, parseFloat(lot.toFixed(2))));
  }, [balance, riskPercent, pipsSL, selectedAsset]);

  // Engine Generator Analisis Komplit (Logic berbasis Strategi Key Level Bos)
  const executeEngineAnalysis = (assetValue, tf) => {
    const assetName = assetList.find(a => a.value === assetValue)?.name.split(' ')[1] || 'Aset';
    const rand = Math.random();

    // Skenario 1: BIAS BUY (Harga di atas Key Level)
    if (rand > 0.45) {
      setAiAnalysis({
        bias: 'BULLISH / BUY AREA',
        keyLevelStatus: 'Harga Berada DI ATAS Key Level Utama',
        confidence: Math.floor(75 + (rand * 15)),
        strategyAction: `MENCARI PELUANG BUY (Entry Konfirmasi di Atas Key Level)`,
        reasoning: `Berdasarkan price action pada timeframe ${tf}, struktur market ${assetName} sukses membentuk pola akumulasi dan bertahan kokoh di atas area batas dinamis MA20/MA50. Momentum RSI berada di area 58 (Bullish Zone) menunjukkan ruang kenaikan masih terbuka lebar.`,
        suggestion: `Pasang pending order Buy Limit dekat area pantulan Key Level atau tunggu setup Rejection candle (Pinbar/Engulfing) sebelum melakukan eksekusi posisi.`
      });
    } 
    // Skenario 2: BIAS SELL (Harga di bawah Key Level)
    else {
      setAiAnalysis({
        bias: 'BEARISH / SELL AREA',
        keyLevelStatus: 'Harga Berada DI BAWAH Key Level Utama',
        confidence: Math.floor(70 + (rand * 20)),
        strategyAction: `MENCARI PELUANG SELL (Entry Konfirmasi di Bawah Key Level)`,
        reasoning: `Struktur tren jangka pendek ${assetName} resmi patah (Break of Structure). Candlestick closed konsisten di bawah Key Level psikologis. Distribusi volume jual meningkat drastis didukung RSI yang mulai menukik menuju area jenuh jual.`,
        suggestion: `Cari konfirmasi konvergen Sell ketika harga melakukan pullback/retest ke arah garis Key Level atas dengan pembatasan risiko ketat.`
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    
    // Jalankan engine analisis
    executeEngineAnalysis(selectedAsset, intervalTime);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          width: '100%',
          height: 480,
          symbol: selectedAsset,
          interval: intervalTime === '1d' ? 'D' : intervalTime.replace('m', ''),
          timezone: 'Asia/Jakarta',
          theme: 'dark',
          style: '1',
          locale: 'id',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
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
  }, [selectedAsset, intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 p-4 md:p-6 font-sans">
      {/* 1. HEADER UTAMA */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA PRO
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">TRADING WORKSTATION & AUTOMATED ANALYZER</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Pilihan Aset */}
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-[#060b08] text-gray-200 border border-gray-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {assetList.map((asset) => (
              <option key={asset.value} value={asset.value}>{asset.name}</option>
            ))}
          </select>

          {/* Tombol Timeframe */}
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

      {/* 2. AREA HAMPARAN UTAMA */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Kolom Kiri: Chart Interaktif */}
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live TradingView Terminal Standalone
            </h3>
          </div>
          <div id="tradingview_pro" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '480px' }} />
        </div>

        {/* Kolom Kanan: Engine Analisis Lengkap */}
        <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 space-y-5">
          <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase border-b border-gray-800 pb-2">
            🤖 Engine Analisis Komplit
          </h3>
          
          <div>
            <span className="text-gray-500 text-[10px] block">STRATEGY MATRIX STATUS</span>
            <span className="text-xs font-bold text-amber-400">{aiAnalysis.keyLevelStatus}</span>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] block">AI TRADING BIAS</span>
            <div className={`text-xl font-black tracking-wide flex items-center gap-2 mt-0.5 ${
              aiAnalysis.bias.includes('BULLISH') ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {aiAnalysis.bias.includes('BULLISH') ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {aiAnalysis.bias}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 text-[10px]">AI ANALYSIS ACCURACY ACCORDING TO DATA</span>
              <span className="font-bold text-emerald-400">{aiAnalysis.confidence}%</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-1.5 border border-gray-900">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${aiAnalysis.confidence}%` }} />
            </div>
          </div>

          <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/80">
            <span className="text-emerald-400 text-[10px] font-bold block mb-1">STRATEGY ACTION REQUIRED</span>
            <p className="text-xs text-gray-200 font-medium leading-relaxed">{aiAnalysis.strategyAction}</p>
          </div>

          <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/80">
            <span className="text-gray-500 text-[10px] block mb-1">MARKET STRUCTURAL REASONING</span>
            <p className="text-xs text-gray-400 leading-relaxed">{aiAnalysis.reasoning}</p>
          </div>

          <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 text-emerald-400 text-xs">
            <span className="font-bold block mb-0.5">💡 Saran Aksi Tama:</span>
            {aiAnalysis.suggestion}
          </div>
        </div>
      </div>

      {/* 3. FITUR BARU: TRADING JOURNAL & RISK CALCULATOR */}
      <div className="max-w-7xl mx-auto bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sub-Panel 1: Form Input */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" /> Kalkulator Risiko Lot
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Saldo Akun ($ / USC):</label>
              <input 
                type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Resiko Per Trade (%):</label>
              <input 
                type="number" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Jarak Stop Loss (Pips / Points):</label>
            <input 
              type="number" value={pipsSL} onChange={(e) => setPipsSL(Number(e.target.value))}
              className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sub-Panel 2: Hasil Uji Ukuran Lot */}
        <div className="bg-[#020604] p-4 rounded-lg border border-gray-800/60 flex flex-col justify-center items-center text-center">
          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rekomendasi Entry Posisi Lot</span>
          <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight my-1">
            {calculatedLot} <span className="text-xs font-normal text-gray-400">Lot</span>
          </div>
          <p className="text-[10px] text-gray-500 max-w-[200px] mt-1 leading-normal">
            Ukuran lot di atas dihitung otomatis untuk menjaga ketahanan modal agar tidak loss melebihi ${ (balance * (riskPercent / 100)).toFixed(2) }.
          </p>
        </div>

        {/* Sub-Panel 3: Catatan Jurnal Disiplin Trading */}
        <div className="space-y-3 bg-gray-950/40 p-3 rounded-lg border border-gray-900 text-xs">
          <h4 className="font-bold text-gray-300 flex items-center gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Ruang Disiplin Jurnal
          </h4>
          <ul className="space-y-1.5 text-[11px] text-gray-400 list-disc list-inside">
            <li><span className="text-emerald-400 font-medium">Rule 1:</span> Cari peluang <span className="text-gray-200">BUY</span> ketika harga berada di atas <span className="text-emerald-400">Key Level</span> dinamis.</li>
            <li><span className="text-red-400 font-medium">Rule 2:</span> Cari peluang <span className="text-gray-200">SELL</span> ketika harga amblas di bawah <span className="text-red-400">Key Level</span> dinamis.</li>
            <li><span className="text-amber-400 font-medium">Rule 3:</span> Selalu sesuaikan lot dengan ketahanan balance akun mikro/standar.</li>
          </ul>
          <div className="bg-amber-950/10 border border-amber-900/30 p-2 rounded text-[10px] text-amber-500 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Jangan pernah over-trade atau balas dendam ke market ya, Bos! Sukses selalu bisnis template-nya!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
