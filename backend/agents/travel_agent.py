import os
import asyncio
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
import re
import json

class TravelAgent:
    """
    Travel Agent for creating personalized travel itineraries.
    Researches destinations and creates detailed travel plans.
    Also serves as a general assistant for non-travel questions.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
        self._cache = {}  # Cache for processed requests
        
    def _extract_travel_info(self, message: str) -> Dict[str, Any]:
        """Extract destination and duration from user message."""
        # Look for destination patterns
        destination_patterns = [
            r'(?:to|visit|go to|travel to)\s+([A-Za-z\s,]+?)(?:\s+for|\s+\d+|$)',
            r'(?:plan.*trip.*to|itinerary.*for)\s+([A-Za-z\s,]+?)(?:\s+for|\s+\d+|$)',
            r'^([A-Za-z\s,]+?)(?:\s+for|\s+\d+|\s+trip|$)'
        ]
        
        destination = None
        for pattern in destination_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                destination = match.group(1).strip()
                break
        
        # Look for duration patterns
        duration_patterns = [
            r'(\d+)\s*(?:days?|day)',
            r'for\s+(\d+)',
            r'(\d+)\s*(?:nights?|night)',
        ]
        
        duration = 7  # default
        for pattern in duration_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                duration = int(match.group(1))
                break
        
        return {
            "destination": destination,
            "duration": duration,
            "raw_message": message
        }
    
    def _detect_intent(self, message: str) -> str:
        """Detect what the user wants to do."""
        message_lower = message.lower()
        
        travel_keywords = [
            'travel', 'trip', 'vacation', 'holiday', 'visit', 'itinerary',
            'plan', 'destination', 'tour', 'explore', 'journey'
        ]
        
        if any(keyword in message_lower for keyword in travel_keywords):
            return "plan_trip"
        
        # Check if it's a math/calculation request
        math_keywords = ['calculate', 'compute', 'math', 'solve', 'equation']
        has_numbers = bool(re.search(r'\d+', message))
        has_operators = bool(re.search(r'[+\-*/=]', message))
        
        if any(keyword in message_lower for keyword in math_keywords) or (has_numbers and has_operators):
            return "math_calculation"
        
        # Check if it's a general knowledge question
        question_starters = ['what', 'who', 'when', 'where', 'why', 'how', 'is', 'are', 'can', 'do', 'does']
        if any(message_lower.startswith(starter) for starter in question_starters):
            return "general_question"
        
        return "general_assistance"
    
    def _is_video_related_but_misrouted(self, message: str) -> bool:
        """Check if this seems like a video-related question that was misrouted."""
        video_indicators = [
            'video', 'watch', 'youtube', 'clip', 'footage',
            'artist', 'singer', 'musician', 'performer',
            'song', 'music', 'album', 'track',
            'how old', 'age', 'born', 'biography'
        ]
        
        return any(indicator in message.lower() for indicator in video_indicators)
    
    async def _handle_misrouted_video_question(self, message: str) -> str:
        """Handle questions that seem video-related but were routed to travel agent."""
        return f"""I notice you're asking about something that might be related to a video or media content, but I'm the Travel Planning assistant.

If you're asking about a YouTube video or media content, you might want to:
1. Share the YouTube URL first so I can analyze the video
2. Ask questions specifically about what's discussed in the video content

**I specialize in:**
• Travel planning and itineraries
• Destination recommendations
• General assistance and calculations
• Answering knowledge questions

**For video analysis, please:**
• Share a YouTube URL first
• Then ask questions about the video content

Would you like help with travel planning instead, or do you have a different question I can assist with?"""
    
    async def _research_destination(self, destination: str, duration: int) -> str:
        """Research a destination and gather travel information."""
        prompt = f"""
        Research the destination "{destination}" for a {duration}-day trip.
        
        Provide comprehensive information about:
        1. Top attractions and must-see places
        2. Best activities for the duration specified
        3. Recommended accommodations (different budget levels)
        4. Local cuisine and dining recommendations
        5. Transportation options
        6. Best time to visit and weather considerations
        7. Cultural tips and local customs
        8. Budget estimates
        9. Safety considerations
        10. Hidden gems and local favorites
        
        Format the response as detailed research findings that can be used to create an itinerary.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Error researching destination: {str(e)}")
            return f"Error researching {destination}: {str(e)}"
    
    async def _create_itinerary(self, destination: str, duration: int, research: str) -> str:
        """Create a detailed itinerary based on research."""
        prompt = f"""
        Based on the following research, create a detailed {duration}-day itinerary for {destination}.
        
        Research Information:
        {research}
        
        Create a well-structured itinerary that includes:
        
        **{duration}-Day {destination} Itinerary**
        
        **Trip Overview:**
        [Brief overview of the trip]
        
        **Day-by-Day Plan:**
        
        **Day 1: [Theme/Focus]**
        • Morning: [Activity with time and details]
        • Afternoon: [Activity with time and details]  
        • Evening: [Activity with time and details]
        • Accommodation: [Recommendation]
        • Dining: [Restaurant recommendations]
        
        [Continue for each day]
        
        **Budget Estimate:**
        • Accommodation: $X - $Y per night
        • Food: $X - $Y per day
        • Activities: $X - $Y total
        • Transportation: $X - $Y
        • **Total Estimated Cost: $X - $Y**
        
        **Travel Tips:**
        • [Important tip 1]
        • [Important tip 2]
        • [Important tip 3]
        
        **Packing Essentials:**
        • [Essential item 1]
        • [Essential item 2]
        • [Essential item 3]
        
        Make the itinerary engaging, practical, and well-organized with specific recommendations.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Error creating itinerary: {str(e)}")
            return f"Error creating itinerary: {str(e)}"
    
    async def _handle_math_calculation(self, message: str) -> str:
        """Handle mathematical calculations and problems."""
        prompt = f"""
        The user has a mathematical question or calculation request: "{message}"
        
        Please:
        1. Identify what calculation or math problem they're asking about
        2. Show the step-by-step solution
        3. Provide the final answer clearly
        4. If it's a word problem, explain your reasoning
        
        Be clear and educational in your response.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"I can help with calculations! Could you please rephrase your math question more clearly? For example: 'Calculate 15% of 200' or 'Solve: 2x + 5 = 15'"
    
    async def _handle_general_question(self, message: str) -> str:
        """Handle general knowledge questions."""
        prompt = f"""
        The user has a general question: "{message}"
        
        Please provide a helpful, accurate, and informative response. 
        If you're not certain about specific facts, mention that.
        Keep the response conversational and helpful.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"I'd be happy to help answer your question! Could you please provide a bit more context or rephrase it?"
    
    async def _provide_travel_help(self, message: str) -> str:
        """Provide general travel assistance."""
        prompt = f"""
        You are a helpful travel assistant. The user asked: "{message}"
        
        Provide helpful travel advice, tips, or information related to their question.
        Be friendly, informative, and practical in your response.
        
        If they're asking about travel planning in general, guide them on how to use your services:
        - They can ask you to plan a trip to any destination
        - They can specify the number of days
        - You'll research and create a detailed itinerary
        
        Examples of what you can help with:
        - "Plan a 5-day trip to Tokyo"
        - "Create an itinerary for Paris for 3 days"
        - "I want to visit Thailand for a week"
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"I'm here to help you plan amazing trips! Try asking me to plan a trip to a specific destination, like 'Plan a 5-day trip to Tokyo' or 'Create an itinerary for Paris'."
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main method to process travel requests."""
        try:
            message = input_data.get("message", "")
            
            print(f"Processing travel/general request: {message}")
            
            # Check if this seems like a misrouted video question
            if self._is_video_related_but_misrouted(message):
                content = await self._handle_misrouted_video_question(message)
                return {
                    "type": "misrouted_video",
                    "content": content,
                    "source": "TravelAgent"
                }
            
            # Detect intent
            intent = self._detect_intent(message)
            
            if intent == "plan_trip":
                # Extract travel information
                travel_info = self._extract_travel_info(message)
                destination = travel_info["destination"]
                duration = travel_info["duration"]
                
                if not destination:
                    return {
                        "type": "need_destination",
                        "content": "Travel Planning Assistant\n\nI'd love to help you plan a trip! Please tell me:\n• Where would you like to go?\n• How many days would you like to travel?\n\nFor example: 'Plan a 5-day trip to Tokyo' or 'Create an itinerary for Paris for 3 days'",
                        "source": "TravelAgent"
                    }
                
                print(f"Planning trip to {destination} for {duration} days")
                
                # Research the destination
                research = await self._research_destination(destination, duration)
                
                # Create the itinerary
                itinerary = await self._create_itinerary(destination, duration, research)
                
                return {
                    "type": "itinerary",
                    "content": itinerary,
                    "source": "TravelAgent",
                    "destination": destination,
                    "duration": duration
                }
            
            elif intent == "math_calculation":
                content = await self._handle_math_calculation(message)
                return {
                    "type": "math_calculation",
                    "content": content,
                    "source": "TravelAgent"
                }
            
            elif intent == "general_question":
                content = await self._handle_general_question(message)
                return {
                    "type": "general_question",
                    "content": content,
                    "source": "TravelAgent"
                }
            
            else:
                # General travel help
                content = await self._provide_travel_help(message)
                return {
                    "type": "travel_help",
                    "content": content,
                    "source": "TravelAgent"
                }
                
        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            print(error_msg)
            return {
                "type": "error",
                "content": "I apologize, but I encountered an issue. I can help you with:\n• Travel planning (e.g., 'Plan a 5-day trip to Tokyo')\n• General questions and calculations\n• Travel advice and recommendations\n\nPlease try rephrasing your request!",
                "source": "TravelAgent"
            }
    
    async def __call__(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Allow the agent to be called directly."""
        return await self.run_tool(input_data)
