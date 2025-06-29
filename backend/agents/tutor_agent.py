import os
import asyncio
from typing import Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_openai import ChatOpenAI
import re
from urllib.parse import urlparse, parse_qs

class TutorAgent:
    """
    TutorAgent for processing YouTube videos with summary and Q&A capabilities.
    Supports both summary generation and RAG-based question answering.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
        self._video_cache = {}  # Simple in-memory cache for processed videos
        
    def _extract_video_id(self, youtube_url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats."""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        return None
    
    def _get_transcript(self, video_id: str) -> str:
        """Get transcript for a YouTube video using updated API."""
        try:
            # Try multiple approaches to get transcript
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get English transcript first
            transcript_data = None
            try:
                transcript = transcript_list.find_transcript(['en'])
                transcript_data = transcript.fetch()
            except:
                try:
                    # Try generated transcript
                    transcript = transcript_list.find_generated_transcript(['en'])
                    transcript_data = transcript.fetch()
                except:
                    # Try any available transcript
                    for transcript in transcript_list:
                        try:
                            transcript_data = transcript.fetch()
                            break
                        except:
                            continue
            
            if not transcript_data:
                raise ValueError("No transcript available")
            
            # Handle different transcript data formats
            full_transcript = ""
            for item in transcript_data:
                if isinstance(item, dict):
                    full_transcript += item.get('text', '') + " "
                else:
                    # Handle if item is not a dict (newer API versions)
                    full_transcript += str(item) + " "
            
            return full_transcript.strip()
            
        except Exception as e:
            print(f"Error getting transcript: {str(e)}")
            # Return a helpful error message instead of raising
            return None
    
    async def _generate_summary(self, transcript: str) -> str:
        """Generate a summary of the video transcript."""
        if not transcript:
            return "Unable to generate summary - transcript not available."
            
        # Limit transcript length to avoid token limits
        max_length = 4000
        if len(transcript) > max_length:
            transcript = transcript[:max_length] + "..."
            
        prompt = f"""
        Please provide a comprehensive summary of the following video transcript. 
        Focus on the main topics, key points, and important insights discussed.
        Structure your summary with clear sections and bullet points where appropriate.
        
        Transcript:
        {transcript}
        
        Summary:
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return f"Error generating summary: {str(e)}"
    
    async def _answer_question(self, transcript: str, question: str) -> str:
        """Answer a question based on the video transcript."""
        if not transcript:
            return "Unable to answer question - transcript not available."
            
        # Limit transcript length to avoid token limits
        max_length = 3000
        if len(transcript) > max_length:
            transcript = transcript[:max_length] + "..."
            
        prompt = f"""
        Based on the following video transcript, please answer the user's question.
        If the answer is not clearly available in the transcript, please say so.
        
        Transcript:
        {transcript}
        
        Question: {question}
        
        Answer:
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Error answering question: {str(e)}")
            return f"Error answering question: {str(e)}"
    
    async def _generate_fallback_response(self, youtube_url: str, mode: str, question: str = None) -> str:
        """Generate a fallback response when transcript is not available."""
        video_id = self._extract_video_id(youtube_url)
        
        if mode == "summary":
            prompt = f"""
            I cannot access the transcript for this YouTube video (ID: {video_id}) due to access restrictions.
            However, I can provide some general guidance:
            
            1. This appears to be a YouTube video that may have transcript restrictions
            2. You could try:
               - Enabling captions manually on YouTube
               - Using a different video with available transcripts
               - Providing the transcript text directly if you have it
            
            Please provide a helpful response explaining this limitation and suggesting alternatives.
            """
        else:
            prompt = f"""
            I cannot access the transcript for this YouTube video (ID: {video_id}) to answer the question: "{question}"
            
            Please provide a helpful response explaining this limitation and suggesting alternatives like:
            - Watching the video directly and taking notes
            - Finding videos with available transcripts
            - Providing transcript text directly
            """
        
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"Unable to process this YouTube video due to access restrictions. Please try a different video or provide the transcript directly."
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to process YouTube video requests.
        """
        try:
            youtube_url = input_data.get("youtube_url")
            mode = input_data.get("mode", "summary")
            question = input_data.get("question")
            
            print(f"Processing request: URL={youtube_url}, Mode={mode}, Question={question}")
            
            if not youtube_url:
                raise ValueError("YouTube URL is required")
            
            if mode == "qa" and not question:
                raise ValueError("Question is required for Q&A mode")
            
            # Extract video ID
            video_id = self._extract_video_id(youtube_url)
            if not video_id:
                raise ValueError("Invalid YouTube URL format")
            
            print(f"Extracted video ID: {video_id}")
            
            # Try to get transcript
            transcript = self._get_transcript(video_id)
            
            if transcript:
                print(f"Retrieved transcript length: {len(transcript)} characters")
                
                if mode == "summary":
                    content = await self._generate_summary(transcript)
                elif mode == "qa":
                    content = await self._answer_question(transcript, question)
                else:
                    raise ValueError("Mode must be 'summary' or 'qa'")
            else:
                print("Transcript not available, generating fallback response")
                content = await self._generate_fallback_response(youtube_url, mode, question)
            
            return {
                "type": mode,
                "content": content,
                "source": "TutorAgent"
            }
                
        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            print(error_msg)
            return {
                "type": "error",
                "content": error_msg,
                "source": "TutorAgent"
            }
    
    async def __call__(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Allow the agent to be called directly."""
        return await self.run_tool(input_data)
