// Vercel Serverless Function — fetches stock data server-side (no CORS issues)
const BASE = 'https://query1.finance.yahoo.com';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const ticker = (req.query.ticker || '').toString().toUpperCase().trim();
  if (!ticker) return res.status(400).json({ error: 'Missing ticker parameter' });
  
  try {
    // Fetch chart data
    const chartRes = await fetch(
      `${BASE}/v8/finance/chart/${ticker}?range=1y&interval=1d`
    );
    if (!chartRes.ok) {
      return res.status(404).json({ error: 'Ticker not found on Yahoo Finance' });
    }
    const chartData = await chartRes.json();
    const meta = chartData.chart?.result?.[0]?.meta;
    if (!meta) return res.status(404).json({ error: 'No data available for this ticker' });
    
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose || price;
    const high52 = meta.fiftyTwoWeekHigh || price * 1.3;
    const low52 = meta.fiftyTwoWeekLow || price * 0.7;
    const dayChange = ((price - prevClose) / prevClose * 100);
    const pctFromHigh = ((price - high52) / high52 * 100);
    const mktCap = meta.marketCap || 0;
    const exchange = meta.exchangeName || 'N/A';
    const rangePct = low52 !== high52 ? ((price - low52) / (high52 - low52) * 100) : 50;
    
    const result = {
      ticker,
      price,
      prevClose,
      high52,
      low52,
      dayChange: +dayChange.toFixed(2),
      pctFromHigh: +pctFromHigh.toFixed(1),
      mktCap,
      exchange,
      rangePct: +rangePct.toFixed(0),
      stats: {}
    };
    
    // Fetch detailed stats
    try {
      const summRes = await fetch(
        `${BASE}/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail`
      );
      const summ = await summRes.json();
      const fd = summ.quoteSummary?.result?.[0]?.financialData || {};
      const ks = summ.quoteSummary?.result?.[0]?.defaultKeyStatistics || {};
      const sd = summ.quoteSummary?.result?.[0]?.summaryDetail || {};
      
      result.stats = {
        pe: sd.trailingPE?.fmt || '—',
        fwdPe: sd.forwardPE?.raw || null,
        fwdPeFmt: sd.forwardPE?.fmt || '—',
        peg: ks.pegRatio?.raw || null,
        pegFmt: ks.pegRatio?.fmt || '—',
        eps: ks.trailingEps?.fmt || '—',
        revGrowth: fd.revenueGrowth ? +(fd.revenueGrowth.raw * 100).toFixed(1) : null,
        revGrowthFmt: fd.revenueGrowth ? (fd.revenueGrowth.raw * 100).toFixed(1) + '%' : '—',
        gm: fd.grossMargins ? +(fd.grossMargins.raw * 100).toFixed(1) : null,
        gmFmt: fd.grossMargins ? (fd.grossMargins.raw * 100).toFixed(1) + '%' : '—',
        opm: fd.operatingMargins ? +(fd.operatingMargins.raw * 100).toFixed(1) : null,
        opmFmt: fd.operatingMargins ? (fd.operatingMargins.raw * 100).toFixed(1) + '%' : '—',
        pm: fd.profitMargins ? +(fd.profitMargins.raw * 100).toFixed(1) : null,
        pmFmt: fd.profitMargins ? (fd.profitMargins.raw * 100).toFixed(1) + '%' : '—',
        fcf: fd.freeCashflow ? +(fd.freeCashflow.raw / 1e9).toFixed(1) : null,
        fcfFmt: fd.freeCashflow ? '$' + (fd.freeCashflow.raw / 1e9).toFixed(1) + 'B' : '—',
        de: fd.debtToEquity?.fmt || '—',
        roe: fd.returnOnEquity ? +(fd.returnOnEquity.raw * 100).toFixed(1) : null,
        roeFmt: fd.returnOnEquity ? (fd.returnOnEquity.raw * 100).toFixed(1) + '%' : '—',
        dy: sd.dividendYield ? +(sd.dividendYield.raw * 100).toFixed(2) : null,
        dyFmt: sd.dividendYield ? (sd.dividendYield.raw * 100).toFixed(2) + '%' : 'None',
        beta: sd.beta?.raw || null,
        betaFmt: sd.beta?.fmt || '—',
        targetMean: fd.targetMeanPrice?.raw || null,
        targetHigh: fd.targetHighPrice?.raw || null,
        targetLow: fd.targetLowPrice?.raw || null,
        rec: fd.recommendationKey || '—',
        numAnalysts: fd.numberOfAnalystOpinions?.fmt || '—'
      };
    } catch (e) {
      // stats remain empty
    }
    
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
