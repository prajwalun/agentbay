import os
from typing import Dict, Any, Optional
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    CouldNotRetrieveTranscript
)
from langchain_openai import ChatOpenAI
import re

class YouTubeAgent:
    """
    YouTube Assistant for analyzing YouTube videos.
    Provides summaries, answers questions, generates quizzes, and helps with doubts.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
        self._video_cache = {}  # Cache for processed videos

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

    def _get_transcript(self, video_id: str) -> Optional[str]:
        """Get transcript for a YouTube video."""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript_data = None
            try:
                transcript = transcript_list.find_transcript(['en'])
                transcript_data = transcript.fetch()
            except NoTranscriptFound:
                try:
                    transcript = transcript_list.find_generated_transcript(['en'])
                    transcript_data = transcript.fetch()
                except NoTranscriptFound:
                    for transcript in transcript_list:
                        try:
                            transcript_data = transcript.fetch()
                            break
                        except:
                            continue
            if not transcript_data:
                print(f"❌ No transcript data found for video ID: {video_id}")
                return None
            full_transcript = " ".join(item.get('text', '') for item in transcript_data if isinstance(item, dict))
            return full_transcript.strip()
        except TranscriptsDisabled:
            print("❌ Transcripts are disabled for this video.")
            return None
        except NoTranscriptFound:
            print("❌ No transcript found for this video.")
            return None
        except VideoUnavailable:
            print("❌ The video is unavailable.")
            return None
        except CouldNotRetrieveTranscript as e:
            print(f"❌ Could not retrieve transcript: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error while fetching transcript: {str(e)}")
            return None

    def _detect_intent(self, message: str, has_video: bool) -> str:
        message_lower = message.lower()
        if self._extract_video_id(message):
            return "new_video"
        if not has_video:
            return "need_video"
        if any(word in message_lower for word in ['quiz', 'test', 'questions', 'mcq', 'multiple choice']):
            return "generate_quiz"
        elif any(word in message_lower for word in ['doubt', 'clarify', 'explain', 'confused', 'understand']):
            return "clarify_doubt"
        elif any(word in message_lower for word in ['summary', 'summarize', 'overview', 'main points']):
            return "summarize"
        return "ask_question"

    def _is_answerable_from_video(self, question: str, transcript: str) -> bool:
        question_lower = question.lower()
        personal_info_keywords = [
            'how old', 'age', 'birthday', 'born', 'birth year',
            'married', 'wife', 'husband', 'family', 'children',
            'net worth', 'salary', 'income', 'personal life',
            'biography', 'bio', 'background', 'history',
            'where does', 'where did', 'lives in', 'home',
            'education', 'school', 'university', 'degree'
        ]
        is_personal_question = any(keyword in question_lower for keyword in personal_info_keywords)
        if is_personal_question:
            question_keywords = question_lower.split()
            relevant_keywords = sum(1 for kw in question_keywords if kw in transcript.lower() and len(kw) > 3)
            if len(question_keywords) > 0 and relevant_keywords / len(question_keywords) < 0.3:
                return False
        return True

    async def _process_new_video(self, youtube_url: str) -> Dict[str, Any]:
        video_id = self._extract_video_id(youtube_url)
        if not video_id:
            return {"type": "error", "content": "Invalid YouTube URL.", "source": "YouTubeAgent"}
        print(f"Processing new video: {video_id}")
        transcript = self._get_transcript(video_id)
        if not transcript:
            return {"type": "error", "content": "Sorry, I couldn't access the transcript for this video.", "source": "YouTubeAgent"}
        self._video_cache[video_id] = {"url": youtube_url, "transcript": transcript}
        summary = await self._generate_summary(transcript)
        return {
            "type": "video_summary",
            "content": f"Video Analysis Complete!\n\n{summary}",
            "source": "YouTubeAgent",
            "video_id": video_id
        }

    async def _generate_summary(self, transcript: str) -> str:
        if len(transcript) > 4000:
            transcript = transcript[:4000] + "..."
        prompt = f"""Analyze this YouTube transcript and provide a comprehensive summary.
        
**Main Topic:**
[Brief description]

**Key Points:**
• [Point 1]
• [Point 2]

**Key Insights:**
[Insights]

**Content Overview:**
[Structure overview]

Transcript:
{transcript}
"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    async def _generate_quiz(self, transcript: str, user_message: str) -> str:
        if len(transcript) > 3500:
            transcript = transcript[:3500] + "..."
        prompt = f"""Based on this transcript, create a quiz.
User request: {user_message}

**Quiz:**
Q1: [Text]
A) ...
B) ...
C) ...
D) ...

**Answer Key:**
1. Correct answer: [explanation]

Transcript:
{transcript}
"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"Error generating quiz: {str(e)}"

    async def _answer_question(self, transcript: str, question: str) -> str:
        if len(transcript) > 3500:
            transcript = transcript[:3500] + "..."
        if not self._is_answerable_from_video(question, transcript):
            return self._generate_fallback_message(question)
        prompt = f"""Based on this transcript, answer:
Question: {question}
Transcript:
{transcript}
"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"Error answering question: {str(e)}"

    def _generate_fallback_message(self, question: str) -> str:
        return f"""I understand you're asking about "{question}", but it doesn’t seem to be discussed in the video.
I can help with:
• Questions from the video
• Explaining concepts
• Summaries

Try asking something like: "Can you explain [topic]?" or "What are the main points?" """

    async def _clarify_doubt(self, transcript: str, doubt: str) -> str:
        if len(transcript) > 3500:
            transcript = transcript[:3500] + "..."
        prompt = f"""User's confusion: {doubt}
Help them understand step-by-step using the video transcript below.

Transcript:
{transcript}
"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            return f"Error clarifying doubt: {str(e)}"

    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            message = input_data.get("message", "")
            print(f"Processing message: {message}")
            has_video = len(self._video_cache) > 0
            intent = self._detect_intent(message, has_video)
            print(f"Detected intent: {intent}")
            if intent == "new_video":
                return await self._process_new_video(message.strip())
            elif intent == "need_video":
                return {
                    "type": "need_video",
                    "content": "Paste a YouTube URL to start.",
                    "source": "YouTubeAgent"
                }
            elif not self._video_cache:
                return {
                    "type": "need_video",
                    "content": "Please provide a YouTube URL first.",
                    "source": "YouTubeAgent"
                }
            latest_video = list(self._video_cache.values())[-1]
            transcript = latest_video["transcript"]
            if intent == "generate_quiz":
                content = await self._generate_quiz(transcript, message)
            elif intent == "clarify_doubt":
                content = await self._clarify_doubt(transcript, message)
            elif intent == "summarize":
                content = await self._generate_summary(transcript)
            else:
                content = await self._answer_question(transcript, message)
            return {
                "type": intent,
                "content": content,
                "source": "YouTubeAgent"
            }
        except Exception as e:
            return {
                "type": "error",
                "content": f"Error: {str(e)}",
                "source": "YouTubeAgent"
            }

    async def __call__(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.run_tool(input_data)
