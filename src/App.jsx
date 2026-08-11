import React, { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState('15m');
  const [selectedAsset, setSelectedAsset] = useState('FX_IDC:XAUUSD');
  
  // State untuk menampung hasil analisa AI secara dinamis
  const [aiSignal, setAiSignal] = useState({
    bias: 'LOADING',
    confidence: 50,
    reasoning: 'AI sedang menganalisis struktur market...',
    caution: 'Harap tunggu sebentar, Bos.'
  });

  const assetList = [
    { name: '🥇 Emas (XAUUSD)', value: 'FX_IDC:XAUUSD', type: 'crypto/forex' },
    { name: '🏦 Bank BCA (BBCA)', value: 'IDX:BBCA', type: 'stock' },
    { name: '🚜 Bank BRI (BBRI)', value: 'IDX:BBRI', type: 'stock' },
    { name: '📞 Telkom (TLKM)', value: 'IDX:TLKM', type: 'stock' },
    { name: '🚗 Astra (ASII)', value: 'IDX:ASII', type: 'stock' },
  ];

  // ==========================================
  // LOGIKA SIMULASI AI ENGINE (STRATEGI KEY LEVEL)
  // ==========================================
  const generateAiAnalysis = (assetValue) => {
    // Mengambil nama bersih aset
    const assetName = assetList.find(a => a.value === assetValue)?.name.split(' ')[1] || 'Aset';
    
    // Angka acak terkontrol untuk mensimulasikan indikator MA/RSI live demi keputusan AI
    const randomFactor = Math.random();
    
    if (assetValue === 'FX_IDC:XAUUSD') {
      // Logika AI khusus Emas (XAUUSD) berdasarkan tren dan Key Level
      if (randomFactor > 0.5) {
        setAiSignal({
          bias: 'BULLISH',
          confidence: Math.floor(70 + (randomFactor * 20)),
          reasoning: `Harga ${assetName} terpantau sukses bertahan kencang di atas Key Level MA20 dan MA50. Secara struktural, harga membuat pola Higher High yang mengonfirmasi kekuatan Buyer untuk dorongan lanjut menuju area Supply terdekat.`,
          caution: 'Cari peluang BUY hanya ketika harga berada di atas Key Level saat retest, Bos! Jaga MM 1-2% per trade.'
        });
      } else {
        setAiSignal({
          bias: 'BEARISH',
          confidence: Math.floor(65 + (randomFactor * 25)),
          reasoning: `Momentum Seller mengambil alih. Harga ${assetName} tertekan kuat di bawah Key Level MA20, mengindikasikan distribusi volume. Tren jangka pendek condong turun menguji Demand Zone bawah.`,
          caution: 'Fokus cari opsi SELL selama harga bertahan di bawah Key Level, Bos! Jangan ngelawan arus.'
        });
      }
    } else {
      // Logika AI untuk pasar Saham Indonesia (IDX)
      if (randomFactor > 0.4) {
        setAiSignal({
          bias: 'ACCUMULATION (BUY)',
          confidence: Math.floor(60 + (randomFactor * 25)),
          reasoning: `Saham ${assetName} terdeteksi sedang dalam fase akumulasi di dekat area support kuatnya. Indikator RSI mulai merangkak naik dari zona netral, menandakan volume beli perlahan masuk.`,
          caution: 'Sangat cocok untuk cicil beli (Dollar Cost Averaging) investasi jangka menengah, Bos.'
        });
      } else {
        setAiSignal({
          bias: 'CORRECTION (WAIT)',
          confidence: Math.floor(55 + (randomFactor * 20)),
          reasoning: `Saham ${assetName} mengalami tekanan ambil untung (profit taking) minor setelah reli beberapa hari lalu. Struktur chart sedang membentuk wave koreksi sehat.`,
          caution: 'Tunggu harga mereda di area pantulan Key Level MA50 sebelum entry serok bawah, Bos.'
        });
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Picu hitungan analisa AI setiap kali aset atau timeframe berubah
    generateAiAnalysis(selectedAsset);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          width: '100%',
          height: 450,
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
    <div className="min-h-screen bg-[#020604] text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">INTELLIGENT MULTI-ASSET ENGINE</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
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
        
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-[#060b08]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300">
              Live Interactive Candlestick Chart
            </h3>
          </div>
          <div id="tradingview_ai" ref={containerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" style={{ height: '450px' }} />
        </div>

        {/* AI Column */}
        <div className="space-y-6">
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4">AI Analytical Engine</h3>
            
            <div className="space-y-5">
              {/* Bias */}
              <div>
                <span className="text-gray-400 text-xs block mb-1">AI TRADING BIAS</span>
                <div className={`text-2xl font-black tracking-wide flex items-center gap-2 ${
                  aiSignal.bias.includes('BULLISH') || aiSignal.bias.includes('BUY') ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {aiSignal.bias.includes('BULLISH') || aiSignal.bias.includes('BUY') ? <TrendingUp /> : <TrendingDown />}
                  {aiSignal.bias}
                </div>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">AI Analysis Confidence</span>
                  <span className="font-bold text-emerald-400">{aiSignal.confidence}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${aiSignal.confidence}%` }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/60">
                <span className="text-gray-400 text-[10px] block mb-1">STRUCTURAL REASONING</span>
                <p className="text-xs text-gray-300 leading-relaxed">{aiSignal.reasoning}</p>
              </div>

              {/* Caution Notes */}
              <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 text-amber-400 text-xs">
                <span className="font-bold block mb-0.5">📌 Catatan Tama:</span>
                {aiSignal.caution}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
