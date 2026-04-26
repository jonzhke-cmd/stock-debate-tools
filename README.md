# Stock Debate Generator — Prompt Template

## How to use:
Say "Stock debate [TICKER]" — I'll run the analysis and generate the debate.

## Alternate commands:
- `stock debate TSLA`
- `debate AAPL`
- `stock debate NVDA`
- `run the stock debate for MSFT`

## Data Source:
`node scripts/fetch-stock-data.js TICKER`

## Prompt Template (I follow this every time):

🎯 *STOCK DEBATE: {{TICKER}}*
📅 {{date}}

💰 *$[PRICE]* | [PCT]% from ATH
📊 [MARKET CAP] | [SECTOR] | [MOAT RATING] Moat

*Key Metrics*
• Forward P/E: [VALUE]
• PEG Ratio: [VALUE]
• Rev Growth: [VALUE]
• FCF: [VALUE]
• Dividend: [VALUE]

🐂 *Bull:* [1 sentence]
🐻 *Risk:* [1 sentence]
🎯 *Wall St:* [RATING] | Target [TARGET]

━━━━━━━━━━━━━━━━━━
🏦 *Warren B. (Value)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

📉 *M. Burry (Contrarian)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

🚀 *C. Wood (Growth)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

⚖️ *R. Dalio (Macro)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

📊 *P. Lynch (GARP)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

🎯 *B. Ackman (Activist)*
[2-3 sentence argument with real numbers]
Verdict: [BUY ▲ / HOLD ◆ / SELL ▼]

━━━━━━━━━━━━━━━━━━
📊 *PANEL VOTE*
🟢 BUY: [X]/6
🟡 HOLD: [X]/6
🔴 SELL: [X]/6

🏆 *FINAL VERDICT: [BUY ▲ / HOLD ◆ / SELL ▼]*
[X] of 6 analysts recommend [action] at $[PRICE]
