#!/usr/bin/env node
/**
 * Stock Data Fetcher for Debate Generator
 * Usage: node fetch-stock-data.js TICKER
 * Outputs JSON with key metrics for debate generation
 */

const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();

const ticker = (process.argv[2] || '').toUpperCase();
if (!ticker) {
  console.error('Usage: node fetch-stock-data.js TICKER');
  process.exit(1);
}

async function main() {
  try {
    const [quote, summary] = await Promise.all([
      yf.quote(ticker),
      yf.quoteSummary(ticker, {
        modules: [
          'financialData', 'defaultKeyStatistics', 'summaryDetail',
          'incomeStatementHistory', 'balanceSheetHistory',
          'cashflowStatementHistory', 'insiderHolders',
          'fundOwnership', 'institutionOwnership'
        ]
      })
    ]);

    const fd = summary.financialData || {};
    const ks = summary.defaultKeyStatistics || {};
    const sd = summary.summaryDetail || {};
    const bs = summary.balanceSheetHistory?.balanceSheetStatements?.[0] || {};
    const inc = summary.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const cf = summary.cashflowStatementHistory?.cashflowStatements?.[0] || {};
    const holders = summary.insiderHolders?.holders || [];

    const data = {
      ticker,
      price: quote.regularMarketPrice,
      prevClose: quote.regularMarketPreviousClose,
      dayChange: ((quote.regularMarketPrice - quote.regularMarketPreviousClose) / quote.regularMarketPreviousClose * 100).toFixed(2),
      high52: quote.fiftyTwoWeekHigh,
      low52: quote.fiftyTwoWeekLow,
      pctFromHigh: ((quote.regularMarketPrice - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh * 100).toFixed(1),
      mktCap: quote.marketCap,
      beta: sd.beta,
      sector: ks.sector || ks.industry || 'N/A',
      industry: ks.industry || 'N/A',
      
      // Valuation
      fwdPE: sd.forwardPE,
      trailPE: sd.trailingPE,
      peg: ks.pegRatio,
      ps: ks.priceToSalesTrailing12Months,
      pb: sd.priceToBook,
      ev: ks.enterpriseValue,
      ebitda: fd.ebitda,
      
      // Margins
      gm: fd.grossMargins,
      opm: fd.operatingMargins,
      pm: fd.profitMargins,
      
      // Cash flow
      fcf: fd.freeCashflow,
      fcfYield: fd.freeCashflowYield,
      
      // Returns
      roe: fd.returnOnEquity,
      roic: fd.returnOnCapital,
      
      // Debt
      de: fd.debtToEquity,
      totalCash: bs.cashAndCashEquivalents?.raw,
      totalDebt: bs.totalDebt?.raw,
      
      // Growth
      revGrowth: fd.revenueGrowth,
      epsGrowth: fd.earningsGrowth,
      eps: ks.trailingEps,
      
      // Dividend
      divYield: sd.dividendYield,
      
      // Targets
      targetMean: fd.targetMeanPrice,
      targetHigh: fd.targetHighPrice,
      targetLow: fd.targetLowPrice,
      rec: fd.recommendationKey,
      recMean: fd.recommendationMean,
      numAnalysts: fd.numberOfAnalystOpinions,
      
      // Revenue history
      revTTM: inc.totalRevenue?.raw,
      netIncome: inc.netIncomeFromContinuingOps?.raw,
      grossProfit: inc.grossProfit?.raw,
      
      // Cash flow history
      ocf: cf.operatingCashFlow?.raw,
      capex: cf.capitalExpenditures?.raw,
      buybacks: cf.repurchaseOfCapitalStock?.raw,
      
      // Insiders (top 3 by name recognition)
      insiders: holders.slice(0, 5).map(h => ({
        name: h.name,
        shares: h.positionDirect,
        pctHeld: h.percentHeld
      }))
    };

    // Calculate net cash
    data.netCash = (data.totalCash || 0) - (data.totalDebt || 0);
    
    // FCF calculation
    data.fcfCalc = data.ocf + data.capex;

    // Print as clean JSON for the prompt
    console.log(JSON.stringify(data, null, 2));
    
    // Also print a readable summary
    console.error('\n=== DATA FETCHED SUCCESSFULLY ===');
    console.error(`Ticker: ${ticker}`);  
    console.error(`Price: $${quote.regularMarketPrice?.toFixed(2)} | ${data.pctFromHigh}% from ATH`);
    console.error(`Market Cap: $${(quote.marketCap / 1e9).toFixed(1)}B`);
    console.error(`Forward P/E: ${sd.forwardPE?.toFixed(1)} | PEG: ${ks.pegRatio?.toFixed(2)}`);
    console.error(`Rev Growth: ${((fd.revenueGrowth || 0) * 100).toFixed(1)}% | FCF: $${(fd.freeCashflow / 1e9).toFixed(1)}B`);
    console.error(`Analysts: ${fd.recommendationKey} (${fd.numberOfAnalystOpinions}) | Target: $${fd.targetMeanPrice?.toFixed(2)}`);

  } catch (e) {
    console.error(`Error fetching ${ticker}: ${e.message}`);
    process.exit(1);
  }
}

main();
