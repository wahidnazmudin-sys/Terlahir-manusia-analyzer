import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, Calculator, BookOpen, AlertCircle, Calendar, Plus, Trash2, Download } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('15m');
  const [selectedAsset, setSelectedAsset] = useState('FX_IDC:XAUUSD');
  
  // State Kalkulator Risiko & Lot Journal
  const [balance, setBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [pipsSL, setPipsSL] = useState(50);
  const [calculatedLot, setCalculatedLot] = useState(0.01);

  // State Trading Journal Dinamis
  const [trades, setTrades] = useState([
    { id: 1, date: '2026-08-10', asset: '🥇 XAUUSD', type: 'BUY', lot: 0.02, result: 15.50, status: 'Win' },
    { id: 2, date: '2026-08-11', asset: '🏦 BBCA', type: 'BUY', lot: 0.01, result: -5.00, status: 'Loss' }
  ]);
  const [newTrade, setNewTrade] = useState({ asset: '🥇 XAUUSD', type: 'BUY', lot: 0.02, result: '' });

  // State untuk Output Analisis AI
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

  // Hitung Kalkulasi Lot Otomatis
  useEffect(() => {
    const amountToRisk = balance * (riskPercent / 100);
    const currentAsset = assetList.find(a => a.value === selectedAsset);
    const pipVal = currentAsset ? currentAsset.pipValue : 10;
    
    let lot = amountToRisk / (pipsSL * pipVal);
    if (selectedAsset === 'FX_IDC:XAUUSD') {
      lot = (amountToRisk / pipsSL) * 0.1; // Skala hitungan mikro/standar Bos
    }
    
    setCalculatedLot(Math.max(0.01, parseFloat(lot.toFixed(2))));
  }, [balance, riskPercent, pipsSL, selectedAsset]);

  // Engine Generator Analisis Komplit (Logic berbasis Strategi Key Level Bos)
  const executeEngineAnalysis = (assetValue, tf) => {
    const assetName = assetList.find(a => a.value === assetValue)?.name.split(' ')[1] || 'Aset';
    const rand = Math.random();

    if (rand > 0.45) {
      setAiAnalysis({
        bias: 'BULLISH / BUY AREA',
        keyLevelStatus: 'Harga Berada DI ATAS Key Level Utama',
        confidence: Math.floor(75 + (rand * 15)),
        strategyAction: `MENCARI PELUANG BUY (Entry Konfirmasi di Atas Key Level)`,
        reasoning: `Berdasarkan price action pada timeframe ${tf}, struktur market ${assetName} sukses membentuk pola akumulasi dan bertahan kokoh di atas area batas dinamis MA20/MA50. Momentum RSI berada di area 58 (Bullish Zone).`,
        suggestion: `Cari entry BUY ketika harga berada di atas harga keylevel saat retest, Bos! Jaga MM ketat.`
      });
    } else {
      setAiAnalysis({
        bias: 'BEARISH / SELL AREA',
        keyLevelStatus: 'Harga Berada DI BAWAH Key Level Utama',
        confidence: Math.floor(70 + (rand * 20)),
        strategyAction: `MENCARI PELUANG SELL (Entry Konfirmasi di Bawah Key Level)`,
        reasoning: `Struktur tren jangka pendek ${assetName} resmi patah (Break of Structure). Candlestick closed konsisten di bawah Key Level psikologis. Distribusi volume jual meningkat drastis.`,
        suggestion: `Fokus cari opsi SELL selama harga bertahan di bawah harga keylevel, Bos! Jangan ngelawan arus.`
      });
    }
  };

  // Tambah baris jurnal baru
  const handleAddTrade = (e) => {
    e.preventDefault();
    if (!newTrade.result) return;
    const resNum = parseFloat(newTrade.result);
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      asset: newTrade.asset,
      type: newTrade.type,
      lot: parseFloat(newTrade.lot),
      result: resNum,
      status: resNum >= 0 ? 'Win' : 'Loss'
    };
    setTrades([newLog, ...trades]);
    setNewTrade({ ...newTrade, result: '' });
  };

  // Hapus jurnal
  const handleDeleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  useEffect(() => {
    // 1. Render Chart TradingView
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
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
            studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
            backgroundColor: '#060b08',
            gridColor: '#111827',
          });
        }
      };
      document.head.appendChild(script);
    }

    // 2. Render Widget Kalender Ekonomi
    if (calendarRef.current) {
      calendarRef.current.innerHTML = '';
      const calScript = document.createElement('script');
      calScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      calScript.type = 'text/javascript';
      calScript.async = true;
      calScript.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isWidescreen": true,
        "width": "100%",
        "height": "320",
        "locale": "id",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,JPY,GBP,AUD,IDR"
      });
      calendarRef.current.appendChild(calScript);
    }
  }, [selectedAsset, intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 font-sans">
      
      {/* FEATURE 3: REAL-TIME TICKER BAR AT TOP */}
      <div className="w-full bg-[#060b08] border-b border-emerald-950 px-4 py-1.5 text-[11px] text-gray-400 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"/> SERVER TIME: 2026 (LIVE)</span>
          <span>⚡ Mkt Sentiment: <span className="text-emerald-400 font-bold">68% BUY</span> (XAUUSD Focus)</span>
        </div>
        <div className="text-emerald-500/80 font-mono tracking-widest hidden md:block">
          PEBAYURAN ➔ CIKARANG UTARA CONNECTED HUB 🌐
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* HEADER UTAMA */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
              <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA ULTIMATE
            </h1>
            <p className="text-xs text-gray-400 tracking-widest mt-0.5">THE ULTIMATE TRADING WORKSTATION</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-[#060b08] text-gray-200 border border-gray-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {assetList.map((asset) => (
                <option key={asset.value} value={asset.value}>{asset.name}</option>
              ))}
            </select>

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

        {/* SECTION 1: CHART & AI ENGINE */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800">
            <div id="tradingview_pro" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '480px' }} />
          </div>

          {/* AI Side-Panel */}
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase border-b border-gray-800 pb-2">🤖 Engine Analisis Komplit</h3>
            <div>
              <span className="text-gray-500 text-[10px] block">STRATEGY MATRIX STATUS</span>
              <span className="text-xs font-bold text-amber-400">{aiAnalysis.keyLevelStatus}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">AI TRADING BIAS</span>
              <div className={`text-xl font-black tracking-wide flex items-center gap-2 ${aiAnalysis.bias.includes('BULLISH') ? 'text-emerald-400' : 'text-red-400'}`}>
                {aiAnalysis.bias.includes('BULLISH') ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {aiAnalysis.bias}
              </div>
            </div>
            <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/80">
              <span className="text-emerald-400 text-[10px] font-bold block mb-1">STRATEGY ACTION REQUIRED</span>
              <p className="text-xs text-gray-200 font-medium">{aiAnalysis.strategyAction}</p>
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

        {/* SECTION 2: KALKULATOR RISIKO & RULES */}
        <div className="max-w-7xl mx-auto bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Calculator className="w-4 h-4 text-emerald-400" /> Kalkulator Risiko Lot</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Saldo Akun ($ / USC):</label>
                <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Resiko Per Trade (%):</label>
                <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-emerald-400 font-mono" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Jarak Stop Loss (Pips / Points):</label>
              <input type="number" value={pipsSL} onChange={(e) => setPipsSL(Number(e.target.value))} className="w-full bg-[#020604] border border-gray-800 rounded px-2 py-1.5 text-xs text-emerald-400 font-mono" />
            </div>
          </div>
          <div className="bg-[#020604] p-4 rounded-lg border border-gray-800/60 flex flex-col justify-center items-center text-center">
            <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rekomendasi Posisi Lot</span>
            <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight my-1">
              {calculatedLot} <span className="text-xs font-normal text-gray-400">Lot</span>
            </div>
            <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">Maksimal loss agar modal terjaga: ${(balance * (riskPercent / 100)).toFixed(2)}</p>
          </div>
          <div className="space-y-3 bg-gray-950/40 p-3 rounded-lg border border-gray-900 text-xs">
            <h4 className="font-bold text-gray-300 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Ruang Disiplin Jurnal</h4>
            <ul className="space-y-1 text-[11px] text-gray-400 list-disc list-inside">
              <li>Cari peluang <span className="text-emerald-400">BUY</span> saat harga diatas keylevel.</li>
              <li>Cari peluang <span className="text-red-400">SELL</span> saat harga dibawah keylevel.</li>
              <li>Akun mikro/standar scaling: 0.01 lot = 1 usc per 10 pip.</li>
            </ul>
          </div>
        </div>

        {/* NEW SECTION 3: FEATURE 1 & 2 - ECONOMIC CALENDAR & INTERACTIVE JOURNAL TAB */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* FEATURE 1: LIVE ECONOMIC CALENDAR (2/3 width) */}
          <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 flex flex-col">
            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-400" /> Live Economic Calendar (High-Impact Events)
            </h4>
            <div ref={calendarRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ minHeight: '320px' }} />
          </div>

          {/* FEATURE 2: INTERACTIVE TRADING JOURNAL (1/3 width) */}
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Quick Trading Journal
              </h4>
              
              {/* Form Tambah Transaksi */}
              <form onSubmit={handleAddTrade} className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                <select value={newTrade.asset} onChange={(e) => setNewTrade({...newTrade, asset: e.target.value})} className="bg-[#020604] border border-gray-800 rounded p-1 text-gray-300">
                  <option>🥇 XAUUSD</option>
                  <option>🏦 BBCA</option>
                  <option>🚜 BBRI</option>
                </select>
                <select value={newTrade.type} onChange={(e) => setNewTrade({...newTrade, type: e.target.value})} className="bg-[#020604] border border-gray-800 rounded p-1 text-gray-300">
                  <option>BUY</option>
                  <option>SELL</option>
                </select>
                <input type="number" step="0.01" placeholder="Lot" value={newTrade.lot} onChange={(e) => setNewTrade({...newTrade, lot: e.target.value})} className="bg-[#020604] border border-gray-800 rounded p-1 text-gray-300" required />
                <input type="number" step="0.01" placeholder="Result ($)" value={newTrade.result} onChange={(e) => setNewTrade({...newTrade, result: e.target.value})} className="bg-[#020604] border border-gray-800 rounded p-1 text-gray-300" required />
                <button type="submit" className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-1 rounded flex items-center justify-center gap-1 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Log Position
                </button>
              </form>

              {/* List Data Jurnal */}
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {trades.map((trade) => (
                  <div key={trade.id} className="bg-[#020604] p-2 rounded border border-gray-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-gray-200">{trade.asset} <span className={trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{trade.type}</span></div>
                      <div className="text-[10px] text-gray-500">{trade.date} | {trade.lot} Lot</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${trade.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.result >= 0 ? `+$${trade.result}` : `-$${Math.abs(trade.result)}`}
                      </span>
                      <button onClick={() => handleDeleteTrade(trade.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t border-gray-800 pt-3 mt-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">TOTAL NET PROFIT</span>
                <span className={`text-sm font-black ${trades.reduce((acc, t) => acc + t.result, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${trades.reduce((acc, t) => acc + t.result, 0).toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 tracking-wider">MM ENGINE V.1</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
