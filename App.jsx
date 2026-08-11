import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Clock,
  LayoutDashboard
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_SYMBOL = 'GC=F';

export default function App() {
  const [interval, setIntervalState] = useState('15m');
  const [period, setPeriod] = useState('5d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const ma20SeriesRef = useRef(null);
  const ma50SeriesRef = useRef(null);

  // Fetch Data dari Backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Menggunakan endpoint /api/signal karena mencakup data candle + indikator + AI signal
      const response = await fetch(`${BASE_URL}/api/signal?symbol=${DEFAULT_SYMBOL}&interval=${interval}&period=${period}`);
      if (!response.ok) throw new Error('Gagal mengambil data dari server.');
      
      const result = await response.json();
      setData(result);
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Koneksi ke backend (http://localhost:8000) gagal. Pastikan server FastAPI sudah berjalan.');
    } finally {
      setLoading(false);
    }
  }, [interval, period]);

  // Efek Pemicu Fetch Awal & Perubahan Parameter
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efek Auto Refresh 60 Detik
  useEffect(() => {
    let timer;
    if (autoRefresh && !loading && !error) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchData();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [autoRefresh, loading, error, fetchData]);

  // Inisialisasi & Update Chart (Lightweight Charts)
  useEffect(() => {
    if (!chartContainerRef.current || !data?.candles) return;

    // Bersihkan chart lama jika dimensi atau data berubah mendasar
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Inisialisasi Chart Utama dengan Tema Premium Dark
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0d1510' }, // Deep green-black
        textColor: '#a3b899', // Muted sage green text
      },
      grid: {
        vertLines: { color: 'rgba(34, 49, 38, 0.4)' },
        horzLines: { color: 'rgba(34, 49, 38, 0.4)' },
      },
      crosshair: {
        mode: 0,
      },
      priceScale: {
        borderColor: 'rgba(47, 72, 55, 0.5)',
      },
      timeScale: {
        borderColor: 'rgba(47, 72, 55, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
    });

    // Tambah Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Format data untuk Lightweight Charts
    const formattedCandles = data.candles.map(c => ({
      time: new Date(c.time).getTime() / 1000,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })).sort((a, b) => a.time - b.time);

    candleSeries.setData(formattedCandles);

    // Overlay Garis MA20
    const ma20Series = chart.addLineSeries({
      color: '#4ade80', // Light Green
      lineWidth: 1.5,
      priceLineVisible: false,
    });
    const ma20Data = data.candles
      .map(c => ({ time: new Date(c.time).getTime() / 1000, value: c.ma20 }))
      .filter(d => d.value !== undefined)
      .sort((a, b) => a.time - b.time);
    ma20Series.setData(ma20Data);

    // Overlay Garis MA50
    const ma50Series = chart.addLineSeries({
      color: '#3b82f6', // Blue
      lineWidth: 1.5,
      priceLineVisible: false,
    });
    const ma50Data = data.candles
      .map(c => ({ time: new Date(c.time).getTime() / 1000, value: c.ma50 }))
      .filter(d => d.value !== undefined)
      .sort((a, b) => a.time - b.time);
    ma50Series.setData(ma50Data);

    // Render Autochart Zones (Supply & Demand Bands) menggunakan Price Lines alternatif
    // Catatan: Untuk horizontal band murni berdurasi spesifik, biasanya memakai Autochart/Custom Canvas view.
    // Di sini kita gunakan garis batas harga penanda zona terdekat agar performan dan tetap informatif.
    if (data.zones) {
      data.zones.supply_zones?.forEach(zone => {
        candleSeries.createPriceLine({
          price: (zone.price_high + zone.price_low) / 2,
          color: 'rgba(239, 83, 80, 0.4)',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'Supply Zone',
        });
      });

      data.zones.demand_zones?.forEach(zone => {
        candleSeries.createPriceLine({
          price: (zone.price_high + zone.price_low) / 2,
          color: 'rgba(38, 166, 154, 0.4)',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'Demand Zone',
        });
      });
    }

    chart.timeScale().fitContent();

    // Handle Window Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    chartRef.current = chart;
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  // Helper Warna Bias Sinyal
  const getBiasColor = (bias) => {
    switch (bias?.toLowerCase()) {
      case 'bullish': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'bearish': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#060b08] text-slate-100 font-sans antialiased selection:bg-emerald-800/30">
      
      {/* NAVBAR / HEADER */}
      <nav className="border-b border-emerald-950/40 bg-[#0d1510]/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/30 border border-emerald-700/30 rounded-lg text-emerald-400">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-slate-200 uppercase">Terlahir Manusia</h1>
              <p className="text-xs text-emerald-600/80 tracking-widest font-mono">XAUUSD ANALYZER</p>
            </div>
          </div>

          {/* Timeframe Selector & Global Controls */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="bg-[#060b08] p-1 rounded-lg border border-emerald-950/60 flex gap-1">
              {['5m', '15m', '30m', '1h', '1d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setIntervalState(tf)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    interval === tf
                      ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 shadow-sm shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-2 bg-[#060b08] px-3 py-1.5 rounded-lg border border-emerald-950/60 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoRefresh} 
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded bg-slate-900 border-emerald-950 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>Auto ({countdown}s)</span>
              </label>
              <button 
                onClick={fetchData} 
                disabled={loading}
                className="hover:text-emerald-400 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* STRIP MARKET SUMMARY */}
      {data?.market_summary && (
        <div className="bg-[#090f0b] border-b border-emerald-950/30 py-2.5 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-start gap-x-8 gap-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">LAST PRICE:</span>
              <span className="text-slate-200 font-bold text-sm">${data.market_summary.last_close?.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">RSI(14):</span>
              <span className={`font-semibold ${data.market_summary.rsi14 > 70 ? 'text-rose-400' : data.market_summary.rsi14 < 30 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {data.market_summary.rsi14?.toFixed(2)}
              </span>
              <span className="text-[10px] uppercase text-slate-600">({data.market_summary.rsi_state})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">ATR(14):</span>
              <span className="text-slate-300 font-medium">{data.market_summary.atr14?.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">TREND MA:</span>
              <span className={`capitalize font-semibold ${data.market_summary.trend_ma_based === 'bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.market_summary.trend_ma_based}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT CONTENT */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        
        {/* LOADING & ERROR STATES */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-3 text-rose-300 text-sm backdrop-blur-sm">
            <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={18} />
            <div>
              <p className="font-semibold">Sistem Mengalami Kendala</p>
              <p className="text-rose-400/80 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1 & 2: CHART PANEL */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative bg-[#0d1510]/40 border border-emerald-950/40 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold tracking-wide text-slate-300">Live Advanced Candlestick</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#4ade80]" /> MA20</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#3b82f6]" /> MA50</div>
                </div>
              </div>

              {loading && !data ? (
                <div className="h-[450px] flex flex-col items-center justify-center gap-3 bg-[#0d1510]/20 rounded-xl border border-emerald-950/20 animate-pulse">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-mono">Synchronizing market nodes...</p>
                </div>
              ) : (
                <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
              )}
            </div>
          </div>

          {/* COLUMN 3: AI SIGNAL CARD SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#0d1510]/50 border border-emerald-950/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-500/80 mb-1">AI Analytical Engine</h3>
                <h2 className="text-lg font-bold text-slate-200">System Sinyal Real-Time</h2>
              </div>

              {loading && !data ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-emerald-950/20 rounded-xl border border-emerald-950/10"></div>
                  <div className="h-20 bg-emerald-950/20 rounded-xl border border-emerald-950/10"></div>
                  <div className="h-28 bg-emerald-950/20 rounded-xl border border-emerald-950/10"></div>
                </div>
              ) : data?.signal ? (
                <>
                  {/* Bias & Confidence Section */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`border p-4 rounded-xl flex flex-col justify-center items-center text-center ${getBiasColor(data.signal.bias)}`}>
                      <span className="text-[10px] font-mono uppercase opacity-60 tracking-wider">Market Bias</span>
                      <span className="text-lg font-bold capitalize mt-1 flex items-center gap-1.5">
                        {data.signal.bias === 'bullish' ? <TrendingUp size={18} /> : data.signal.bias === 'bearish' ? <TrendingDown size={18} /> : null}
                        {data.signal.bias}
                      </span>
                    </div>

                    <div className="bg-[#060b08]/60 border border-emerald-950/50 p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider text-center">Confidence</span>
                      <span className="text-2xl font-black text-center text-slate-100 mt-0.5">{data.signal.confidence}%</span>
                      
                      {/* Confidence Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1 mt-2 overflow-hidden border border-emerald-950/30">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${data.signal.bias === 'bullish' ? 'bg-emerald-500' : data.signal.bias === 'bearish' ? 'bg-rose-500' : 'bg-slate-500'}`}
                          style={{ width: `${data.signal.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reasoning Area */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">AI Rationale</span>
                    <div className="bg-[#060b08]/40 border border-emerald-950/40 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                      {data.signal.reasoning}
                    </div>
                  </div>

                  {/* Caution Notes */}
                  {data.signal.caution_notes && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 text-xs text-amber-300/90 leading-relaxed">
                      <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-400 block mb-0.5">Cautionary Warning</span>
                        {data.signal.caution_notes}
                      </div>
                    </div>
                  )}

                  {/* Nearest Zones Info */}
                  <div className="border-t border-emerald-950/40 pt-4 space-y-3">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                      <Layers size={12} className="text-emerald-600" />
                      Zona Proksimal Terdekat
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-3 bg-rose-500/5 border border-rose-900/20 rounded-lg">
                        <span className="text-rose-400/70 text-[10px] block mb-1">SUPPLY ZONE</span>
                        <span className="text-slate-200 font-semibold">
                          {data.signal.nearest_supply_zone?.price_low?.toFixed(1)} - {data.signal.nearest_supply_zone?.price_high?.toFixed(1)}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-900/20 rounded-lg">
                        <span className="text-emerald-400/70 text-[10px] block mb-1">DEMAND ZONE</span>
                        <span className="text-slate-200 font-semibold">
                          {data.signal.nearest_demand_zone?.price_low?.toFixed(1)} - {data.signal.nearest_demand_zone?.price_high?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-xs text-slate-500 font-mono">
                  No operational data matrices loaded.
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
