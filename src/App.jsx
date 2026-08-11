import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Shield, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const ma20SeriesRef = useRef(null);
  const ma50SeriesRef = useRef(null);

  const [intervalTime, setIntervalTime] = useState('15m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketSummary, setMarketSummary] = useState(null);
  const [signal, setSignal] = useState(null);

  // Fungsi untuk menarik data XAUUSD langsung dari API publik (Tanpa VPS)
  const fetchMarketData = async (inv) => {
    setLoading(true);
    setError(null);
    try {
      // Menggunakan alternatif endpoint publik Yahoo Finance yang open
      const response = await fetch(`https://query1.financeapp.net/v8/finance/chart/GC=F?interval=${inv}&range=5d`);
      if (!response.ok) throw new Error('Gagal mengambil data dari server market publik');
      
      const json = await response.json();
      const result = json.chart.result[0];
      const timestamps = result.timestamp;
      const indicators = result.indicators.quote[0];

      // Format data agar sesuai format Lightweight Charts
      let formattedCandles = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (indicators.open[i] && indicators.high[i] && indicators.low[i] && indicators.close[i]) {
          formattedCandles.push({
            time: timestamps[i], // Menggunakan timestamp unix
            open: indicators.open[i],
            high: indicators.high[i],
            low: indicators.low[i],
            close: indicators.close[i],
          });
        }
      }

      // Hitung Moving Average 20 & 50 secara lokal di browser
      formattedCandles = formattedCandles.map((candle, idx, arr) => {
        const ma20 = idx >= 19 ? arr.slice(idx - 19, idx + 1).reduce((sum, c) => sum + c.close, 0) / 20 : null;
        const ma50 = idx >= 49 ? arr.slice(idx - 49, idx + 1).reduce((sum, c) => sum + c.close, 0) / 50 : null;
        return { ...candle, ma20, ma50 };
      });

      const lastCandle = formattedCandles[formattedCandles.length - 1];
      
      // Update data Chart
      if (candleSeriesRef.current) candleSeriesRef.current.setData(formattedCandles);
      if (ma20SeriesRef.current) ma20SeriesRef.current.setData(formattedCandles.filter(c => c.ma20).map(c => ({ time: c.time, value: c.ma20 })));
      if (ma50SeriesRef.current) ma50SeriesRef.current.setData(formattedCandles.filter(c => c.ma50).map(c => ({ time: c.time, value: c.ma50 })));

      // Logic AI Engine Lokal (Strategi Key Level Bos)
      const currentPrice = lastCandle.close;
      const isBullish = currentPrice > (lastCandle.ma20 || currentPrice);
      
      setMarketSummary({
        last_close: currentPrice.toFixed(2),
        ma20: lastCandle.ma20 ? lastCandle.ma20.toFixed(2) : 'Calculating...',
        ma50: lastCandle.ma50 ? lastCandle.ma50.toFixed(2) : 'Calculating...',
        trend: isBullish ? 'bullish' : 'bearish'
      });

      setSignal({
        bias: isBullish ? 'BULLISH' : 'BEARISH',
        confidence: isBullish ? 75 : 68,
        reasoning: isBullish 
          ? `Harga XAUUSD (${currentPrice.toFixed(2)}) sukses bertahan di atas Key Level MA20. Struktur market mendukung opsi BUY.`
          : `Harga memotong ke bawah Key Level MA20. Momentum condong ke opsi SELL.`,
        caution_notes: "Konfirmasi dengan volume sebelum entry, Bos! Jaga MM."
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup Canvas Grafik
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: '#060b08' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#111827' }, horzLines: { color: '#111827' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444'
    });

    ma20SeriesRef.current = chartRef.current.addLineSeries({ color: '#3b82f6', lineWidth: 1.5 });
    ma50SeriesRef.current = chartRef.current.addLineSeries({ color: '#eab308', lineWidth: 1.5 });

    fetchMarketData(intervalTime);

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      fetchMarketData(intervalTime);
    }
  }, [intervalTime]);

  return (
    <div className="min-h-screen bg-[#020604] text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/40 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-6 h-6 animate-pulse" /> TERLAHIR MANUSIA
          </h1>
          <p className="text-xs text-gray-400 tracking-widest mt-0.5">XAUUSD STANDALONE ANALYZER</p>
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
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 flex items-center gap-2">
              Live Candlestick (yFinance Serverless)
            </h3>
            <button onClick={() => fetchMarketData(intervalTime)} className="text-gray-400 hover:text-emerald-400 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-4 text-xs">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden bg-[#060b08]" />
        </div>

        {/* Kolom Sinyal AI (Kanan) */}
        <div className="space-y-6">
          <div className="bg-[#060b08]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800">
            <h3 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4">AI Analytical Engine</h3>
            
            {signal ? (
              <div className="space-y-5">
                <div>
                  <span className="text-gray-400 text-xs block mb-1">REAL-TIME BIAS DIRECTION</span>
                  <div className={`text-2xl font-black tracking-wide flex items-center gap-2 ${signal.bias === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {signal.bias === 'BULLISH' ? <TrendingUp /> : <TrendingDown />}
                    {signal.bias}
                  </div>
                </div>

                <div className="bg-[#020604] p-3 rounded-lg border border-gray-800/60">
                  <span className="text-gray-400 text-[10px] block mb-1">AI ANALYSIS REASONING</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{signal.reasoning}</p>
                </div>

                <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 text-amber-400 text-xs">
                  <span className="font-bold block mb-0.5">📌 Catatan Tama:</span>
                  {signal.caution_notes}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-xs text-center py-10">Memuat analisis sinyal...</div>
            )}
          </div>

          {/* Info Tambahan */}
          {marketSummary && (
            <div className="bg-[#060b08]/40 p-4 rounded-xl border border-gray-800 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-gray-400">Harga Emas Terakhir:</span> <span className="font-mono">${marketSummary.last_close}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Key Level MA20:</span> <span className="font-mono text-blue-400">${marketSummary.ma20}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Key Level MA50:</span> <span className="font-mono text-yellow-500">${marketSummary.ma50}</span></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
