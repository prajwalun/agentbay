"""
News Agent for searching and analyzing news articles
"""

from duckduckgo_search import DDGS
from datetime import datetime
from typing import Dict, Any

class NewsAgent:
    def __init__(self):
        self.name = "News Agent"
        self.description = "Searches for news articles, breaking news, and current events"
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process news-related requests"""
        try:
            message = input_data.get("message", "").lower()
            
            # Breaking news
            if any(keyword in message for keyword in ["breaking news", "latest news", "current events"]):
                result = self.search_breaking_news()
                return {
                    "content": result,
                    "type": "breaking_news",
                    "source": "NewsAgent"
                }
            
            # Tech news
            elif any(keyword in message for keyword in ["tech news", "technology", "ai news", "startup"]):
                result = self.search_tech_news()
                return {
                    "content": result,
                    "type": "tech_news",
                    "source": "NewsAgent"
                }
            
            # Business news
            elif any(keyword in message for keyword in ["business news", "finance news", "market news"]):
                result = self.search_business_news()
                return {
                    "content": result,
                    "type": "business_news",
                    "source": "NewsAgent"
                }
            
            # Sports news
            elif any(keyword in message for keyword in ["sports news", "sports", "game", "match"]):
                result = self.search_sports_news()
                return {
                    "content": result,
                    "type": "sports_news",
                    "source": "NewsAgent"
                }
            
            # Specific topic search
            elif any(keyword in message for keyword in ["news about", "search news", "find news"]):
                topic = self.extract_topic(message)
                result = self.search_news_articles(topic)
                return {
                    "content": result,
                    "type": "topic_news",
                    "source": "NewsAgent"
                }
            
            # General news help
            else:
                return {
                    "content": """I'm your News Assistant! I can help you with:

• Breaking news - "What's the latest breaking news?"
• Technology news - "Show me tech news"
• Business news - "Get business news"
• Sports news - "Sports news today"
• Topic search - "News about climate change"

What news would you like to see?""",
                    "type": "help",
                    "source": "NewsAgent"
                }
                
        except Exception as e:
            return {
                "content": f"I encountered an error searching for news: {str(e)}",
                "type": "error",
                "source": "NewsAgent"
            }
    
    def extract_topic(self, message: str) -> str:
        """Extract news topic from message"""
        # Remove common phrases to get the topic
        phrases_to_remove = [
            "news about", "search news", "find news", "get news", 
            "show me", "tell me", "what's", "latest"
        ]
        
        topic = message
        for phrase in phrases_to_remove:
            topic = topic.replace(phrase, "")
        
        return topic.strip() or "general news"
    
    def search_news_articles(self, topic: str, max_results: int = 5) -> str:
        """Search for news articles on a topic"""
        try:
            with DDGS() as ddg:
                search_query = f"{topic} news {datetime.now().strftime('%Y-%m')}"
                results = ddg.text(search_query, max_results=max_results)
                
                if results:
                    news_results = []
                    for i, result in enumerate(results, 1):
                        news_results.append(f"""**Article {i}:**
• **{result.get('title', 'No title')}**
• Source: {result.get('href', 'No URL')}
• {result.get('body', 'No summary')[:200]}...""")
                    
                    return f"**News about '{topic}'**\n\n" + "\n\n".join(news_results)
                else:
                    return f"No recent news found for '{topic}'. Try a different search term."
                    
        except Exception as e:
            return f"Error searching for news: {str(e)}"
    
    def search_breaking_news(self) -> str:
        """Search for breaking news"""
        try:
            with DDGS() as ddg:
                results = ddg.text("breaking news today", max_results=5)
                
                if results:
                    news_results = []
                    for i, result in enumerate(results, 1):
                        news_results.append(f"""**Breaking News {i}:**
• **{result.get('title', 'No title')}**
• {result.get('body', 'No summary')[:200]}...""")
                    
                    return f"**Breaking News - {datetime.now().strftime('%Y-%m-%d %H:%M')}**\n\n" + "\n\n".join(news_results)
                else:
                    return "No breaking news found at the moment."
                    
        except Exception as e:
            return f"Error searching for breaking news: {str(e)}"
    
    def search_tech_news(self) -> str:
        """Search for technology news"""
        try:
            with DDGS() as ddg:
                results = ddg.text("technology news today AI startup", max_results=5)
                
                if results:
                    news_results = []
                    for i, result in enumerate(results, 1):
                        news_results.append(f"""**Tech News {i}:**
• **{result.get('title', 'No title')}**
• {result.get('body', 'No summary')[:200]}...""")
                    
                    return f"**Technology News - {datetime.now().strftime('%Y-%m-%d')}**\n\n" + "\n\n".join(news_results)
                else:
                    return "No technology news found at the moment."
                    
        except Exception as e:
            return f"Error searching for tech news: {str(e)}"
    
    def search_business_news(self) -> str:
        """Search for business news"""
        try:
            with DDGS() as ddg:
                results = ddg.text("business news today market finance", max_results=5)
                
                if results:
                    news_results = []
                    for i, result in enumerate(results, 1):
                        news_results.append(f"""**Business News {i}:**
• **{result.get('title', 'No title')}**
• {result.get('body', 'No summary')[:200]}...""")
                    
                    return f"**Business News - {datetime.now().strftime('%Y-%m-%d')}**\n\n" + "\n\n".join(news_results)
                else:
                    return "No business news found at the moment."
                    
        except Exception as e:
            return f"Error searching for business news: {str(e)}"
    
    def search_sports_news(self) -> str:
        """Search for sports news"""
        try:
            with DDGS() as ddg:
                results = ddg.text("sports news today games results", max_results=5)
                
                if results:
                    news_results = []
                    for i, result in enumerate(results, 1):
                        news_results.append(f"""**Sports News {i}:**
• **{result.get('title', 'No title')}**
• {result.get('body', 'No summary')[:200]}...""")
                    
                    return f"**Sports News - {datetime.now().strftime('%Y-%m-%d')}**\n\n" + "\n\n".join(news_results)
                else:
                    return "No sports news found at the moment."
                    
        except Exception as e:
            return f"Error searching for sports news: {str(e)}"
