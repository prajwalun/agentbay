"""
Finance Agent for stock analysis, crypto prices, and market data
"""

import yfinance as yf
import requests
from typing import Dict, List, Any
import json

class FinanceAgent:
    def __init__(self):
        self.name = "Finance Agent"
        self.description = "Provides stock prices, market analysis, crypto data, and financial insights"
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process finance-related requests"""
        try:
            message = input_data.get("message", "").lower()
            
            # Stock price requests
            if any(keyword in message for keyword in ["stock price", "share price", "stock quote"]):
                symbol = self.extract_stock_symbol(message)
                if symbol:
                    result = self.get_stock_price(symbol)
                    return {
                        "content": result,
                        "type": "stock_price",
                        "source": "FinanceAgent"
                    }
            
            # Crypto price requests
            elif any(keyword in message for keyword in ["crypto", "bitcoin", "ethereum", "btc", "eth"]):
                symbol = self.extract_crypto_symbol(message)
                if symbol:
                    result = self.get_crypto_price(symbol)
                    return {
                        "content": result,
                        "type": "crypto_price",
                        "source": "FinanceAgent"
                    }
            
            # Market indicators
            elif any(keyword in message for keyword in ["market", "indicators", "economic", "s&p", "dow"]):
                result = self.get_economic_indicators()
                return {
                    "content": result,
                    "type": "market_indicators",
                    "source": "FinanceAgent"
                }
            
            # Portfolio analysis
            elif any(keyword in message for keyword in ["portfolio", "holdings", "calculate value"]):
                # Extract holdings from message if provided
                holdings = self.extract_holdings(message)
                if holdings:
                    result = self.calculate_portfolio_value(holdings)
                    return {
                        "content": result,
                        "type": "portfolio_analysis",
                        "source": "FinanceAgent"
                    }
                else:
                    return {
                        "content": "To calculate portfolio value, please provide holdings in format: 'AAPL:100,GOOGL:50,MSFT:75'",
                        "type": "help",
                        "source": "FinanceAgent"
                    }
            
            # General finance help
            else:
                return {
                    "content": """I'm your Finance Assistant! I can help you with:

• Stock prices and quotes - "What's the price of AAPL?"
• Cryptocurrency prices - "Bitcoin price" or "ETH price"
• Market indicators - "Show me market indicators"
• Portfolio analysis - "Calculate portfolio: AAPL:100,GOOGL:50"
• Company fundamentals - "TSLA fundamentals"

What financial information would you like to know?""",
                    "type": "help",
                    "source": "FinanceAgent"
                }
                
        except Exception as e:
            return {
                "content": f"I encountered an error processing your finance request: {str(e)}",
                "type": "error",
                "source": "FinanceAgent"
            }
    
    def extract_stock_symbol(self, message: str) -> str:
        """Extract stock symbol from message"""
        # Common stock symbols
        symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "AMD", "NFLX", "UBER"]
        for symbol in symbols:
            if symbol.lower() in message:
                return symbol
        
        # Look for pattern like "price of SYMBOL"
        import re
        pattern = r'\b([A-Z]{1,5})\b'
        matches = re.findall(pattern, message.upper())
        if matches:
            return matches[0]
        
        return None
    
    def extract_crypto_symbol(self, message: str) -> str:
        """Extract crypto symbol from message"""
        crypto_map = {
            "bitcoin": "BTC",
            "btc": "BTC",
            "ethereum": "ETH",
            "eth": "ETH",
            "dogecoin": "DOGE",
            "doge": "DOGE",
            "cardano": "ADA",
            "ada": "ADA"
        }
        
        for key, symbol in crypto_map.items():
            if key in message:
                return symbol
        
        return "BTC"  # Default to Bitcoin
    
    def extract_holdings(self, message: str) -> str:
        """Extract portfolio holdings from message"""
        import re
        # Look for pattern like "AAPL:100,GOOGL:50"
        pattern = r'([A-Z]{1,5}:\d+(?:,\s*[A-Z]{1,5}:\d+)*)'
        match = re.search(pattern, message.upper())
        if match:
            return match.group(1)
        return None
    
    def get_stock_price(self, symbol: str) -> str:
        """Get current stock price for a given symbol"""
        try:
            ticker = yf.Ticker(symbol.upper())
            info = ticker.info
            
            if 'regularMarketPrice' in info and info['regularMarketPrice']:
                price = info['regularMarketPrice']
                currency = info.get('currency', 'USD')
                company_name = info.get('longName', symbol.upper())
                change = info.get('regularMarketChangePercent', 0)
                
                return f"""**{company_name} ({symbol.upper()})**

Current Price: ${price:.2f} {currency}
Previous Close: ${info.get('previousClose', 'N/A'):.2f}
Change: {change:+.2f}%
Market Cap: ${info.get('marketCap', 0):,.0f}
Volume: {info.get('volume', 'N/A'):,}
52W High: ${info.get('fiftyTwoWeekHigh', 'N/A'):.2f}
52W Low: ${info.get('fiftyTwoWeekLow', 'N/A'):.2f}"""
            else:
                return f"Could not retrieve stock price for {symbol.upper()}. Please check the symbol."
                
        except Exception as e:
            return f"Error retrieving stock price for {symbol}: {str(e)}"
    
    def get_crypto_price(self, symbol: str) -> str:
        """Get current cryptocurrency price"""
        try:
            if not symbol.endswith('-USD'):
                symbol = f"{symbol.upper()}-USD"
            
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            if 'regularMarketPrice' in info and info['regularMarketPrice']:
                price = info['regularMarketPrice']
                change = info.get('regularMarketChangePercent', 0)
                
                return f"""**{symbol.replace('-USD', '')} Price**

Current Price: ${price:,.2f} USD
24h Change: {change:+.2f}%
Market Cap: ${info.get('marketCap', 0):,.0f}
Volume: {info.get('volume', 'N/A'):,}"""
            else:
                return f"Could not retrieve price for {symbol.replace('-USD', '')}."
                
        except Exception as e:
            return f"Error retrieving crypto price: {str(e)}"
    
    def get_economic_indicators(self) -> str:
        """Get key economic indicators"""
        try:
            indicators = {
                '^GSPC': 'S&P 500',
                '^DJI': 'Dow Jones',
                '^IXIC': 'NASDAQ',
                '^VIX': 'VIX (Fear Index)',
                'GC=F': 'Gold',
                'CL=F': 'Oil'
            }
            
            result = "**Market Indicators**\n\n"
            
            for symbol, name in indicators.items():
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    
                    if 'regularMarketPrice' in info:
                        price = info['regularMarketPrice']
                        change = info.get('regularMarketChangePercent', 0)
                        trend = "📈" if change > 0 else "📉" if change < 0 else "➡️"
                        
                        result += f"{trend} **{name}**: {price:,.2f} ({change:+.2f}%)\n"
                        
                except Exception:
                    result += f"❌ **{name}**: Data unavailable\n"
            
            return result
            
        except Exception as e:
            return f"Error retrieving market indicators: {str(e)}"
    
    def calculate_portfolio_value(self, holdings: str) -> str:
        """Calculate portfolio value from holdings string"""
        try:
            holdings_dict = {}
            for holding in holdings.split(','):
                if ':' in holding:
                    symbol, shares = holding.strip().split(':')
                    holdings_dict[symbol.strip().upper()] = int(shares)
            
            total_value = 0
            portfolio_details = []
            
            for symbol, shares in holdings_dict.items():
                try:
                    ticker = yf.Ticker(symbol)
                    price = ticker.info.get('regularMarketPrice', 0)
                    value = price * shares
                    total_value += value
                    
                    portfolio_details.append(f"• **{symbol}**: {shares} shares @ ${price:.2f} = ${value:,.2f}")
                    
                except Exception:
                    portfolio_details.append(f"• **{symbol}**: Error retrieving data")
            
            result = f"""**Portfolio Analysis**

**Holdings:**
{chr(10).join(portfolio_details)}

**Total Portfolio Value: ${total_value:,.2f}**"""
            
            return result
            
        except Exception as e:
            return f"Error calculating portfolio value: {str(e)}"
