from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from agents.youtube_agent import YouTubeAgent
from agents.travel_agent import TravelAgent
from agents.finance_agent import FinanceAgent
from agents.news_agent import NewsAgent
from agents.music_agent import MusicAgent
from agents.data_agent import DataAgent
import asyncio
import os
from dotenv import load_dotenv
import traceback
import re

load_dotenv()

app = FastAPI(title="AgentBay API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize all agents
youtube_agent = YouTubeAgent()
travel_agent = TravelAgent()
finance_agent = FinanceAgent()
news_agent = NewsAgent()
music_agent = MusicAgent()
data_agent = DataAgent()

class ChatRequest(BaseModel):
    agent: str
    input: Dict[str, Any]

class ChatResponse(BaseModel):
    message: str
    type: Optional[str] = None
    source: Optional[str] = None

def detect_intent_and_route(message: str) -> str:
    """Detect user intent and route to appropriate agent."""
    message_lower = message.lower()
    
    # YouTube detection
    youtube_patterns = [
        r'youtube\.com/watch\?v=',
        r'youtu\.be/',
        r'youtube\.com/embed/',
    ]
    
    if any(re.search(pattern, message_lower) for pattern in youtube_patterns):
        return "YouTubeAgent"
    
    if any(keyword in message_lower for keyword in ['youtube', 'video', 'analyze video']):
        return "YouTubeAgent"
    
    # Finance detection
    finance_keywords = [
        'stock', 'price', 'share', 'market', 'crypto', 'bitcoin', 'ethereum',
        'portfolio', 'investment', 'trading', 'finance', 'financial', 'nasdaq',
        'dow jones', 's&p', 'ticker', 'earnings', 'dividend'
    ]
    
    if any(keyword in message_lower for keyword in finance_keywords):
        return "FinanceAgent"
    
    # News detection
    news_keywords = [
        'news', 'breaking', 'current events', 'headlines', 'article',
        'tech news', 'business news', 'sports news', 'latest news'
    ]
    
    if any(keyword in message_lower for keyword in news_keywords):
        return "NewsAgent"
    
    # Music detection
    music_keywords = [
        'music', 'generate music', 'create music', 'compose', 'song',
        'melody', 'beat', 'instrumental', 'audio', 'sound'
    ]
    
    if any(keyword in message_lower for keyword in music_keywords):
        return "MusicAgent"
    
    # Data analysis detection
    data_keywords = [
        'data', 'analyze', 'csv', 'dataset', 'statistics', 'correlation',
        'data analysis', 'analyze data', 'process data'
    ]
    
    if any(keyword in message_lower for keyword in data_keywords):
        return "DataAgent"
    
    # Travel detection
    travel_keywords = [
        'travel', 'trip', 'vacation', 'holiday', 'visit', 'itinerary',
        'plan', 'destination', 'tour', 'explore', 'journey', 'flight',
        'hotel', 'booking', 'sightseeing'
    ]
    
    if any(keyword in message_lower for keyword in travel_keywords):
        return "TravelAgent"
    
    # Default to travel agent for general queries
    return "TravelAgent"

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with intelligent routing."""
    try:
        print(f"Received chat request: {request}")
        
        message = request.input.get("message", "")
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Auto-detect the appropriate agent
        detected_agent = detect_intent_and_route(message)
        print(f"Auto-detected agent: {detected_agent} for message: {message}")
        
        # Route to appropriate agent
        if detected_agent == "YouTubeAgent":
            result = await youtube_agent.run_tool({"message": message})
        elif detected_agent == "TravelAgent":
            result = await travel_agent.run_tool({"message": message})
        elif detected_agent == "FinanceAgent":
            result = await finance_agent.run_tool({"message": message})
        elif detected_agent == "NewsAgent":
            result = await news_agent.run_tool({"message": message})
        elif detected_agent == "MusicAgent":
            result = await music_agent.run_tool({"message": message})
        elif detected_agent == "DataAgent":
            result = await data_agent.run_tool({"message": message})
        else:
            raise HTTPException(status_code=400, detail=f"Unknown agent: {detected_agent}")
        
        if result.get("type") == "error":
            print(f"{detected_agent} error: {result['content']}")
            return ChatResponse(
                message=result["content"],
                type="error",
                source=result["source"]
            )
        
        return ChatResponse(
            message=result["content"],
            type=result["type"],
            source=result["source"]
        )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/agents")
async def get_agents():
    """Get list of available agents."""
    return [
        {
            "id": "youtube-agent",
            "name": "YouTube Assistant",
            "description": "Analyzes YouTube videos, provides summaries, generates quizzes, and answers questions about video content",
            "tools": ["video_analysis", "quiz_generation", "question_answering", "doubt_clarification"]
        },
        {
            "id": "travel-agent",
            "name": "Travel Planner",
            "description": "Creates personalized travel itineraries, researches destinations, and provides travel advice",
            "tools": ["destination_research", "itinerary_planning", "budget_estimation", "travel_tips"]
        },
        {
            "id": "finance-agent",
            "name": "Finance Assistant",
            "description": "Provides stock prices, market analysis, crypto data, and financial insights",
            "tools": ["stock_prices", "market_analysis", "crypto_data", "portfolio_analysis"]
        },
        {
            "id": "news-agent",
            "name": "News Assistant",
            "description": "Searches for news articles, breaking news, and current events across various topics",
            "tools": ["news_search", "breaking_news", "topic_analysis", "news_summary"]
        },
        {
            "id": "music-agent",
            "name": "Music Generator",
            "description": "Generates custom music using AI, creates compositions in various genres and styles",
            "tools": ["music_generation", "composition", "genre_creation", "audio_processing"]
        },
        {
            "id": "data-agent",
            "name": "Data Analyst",
            "description": "Analyzes data, processes CSV files, provides statistical insights and data visualizations",
            "tools": ["data_analysis", "csv_processing", "statistics", "data_insights"]
        }
    ]

@app.get("/credits")
async def get_credits():
    """Get user credits (mock implementation)."""
    return {"credits": 1000}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "AgentBay API is running with all agents"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
