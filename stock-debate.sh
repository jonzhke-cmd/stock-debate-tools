#!/bin/bash
# Stock Debate Generator
# Usage: ./stock-debate.sh TICKER
# Example: ./stock-debate.sh AAPL

TICKER=${1^^}

if [ -z "$TICKER" ]; then
  echo "Usage: ./stock-debate.sh TICKER"
  echo "Example: ./stock-debate.sh TSLA"
  exit 1
fi

echo "🎯 STOCK DEBATE: $TICKER"
echo "📅 $(date '+%B %d, %Y')"
echo ""
echo "Running data analysis for $TICKER..."

# Run the data fetch and analysis
node /home/ubuntu/.openclaw/workspace/scripts/fetch-stock-data.js "$TICKER" 2>/dev/null