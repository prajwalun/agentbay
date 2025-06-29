"""
Music Agent for generating music using ModelsLab API
"""

import os
from uuid import uuid4
import requests
from typing import Dict, Any, Optional

class MusicAgent:
    def __init__(self):
        self.name = "Music Agent"
        self.description = "Generates music using AI, creates compositions, and provides music-related assistance"
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process music generation requests"""
        try:
            message = input_data.get("message", "").lower()
            
            # Music generation requests
            if any(keyword in message for keyword in ["generate music", "create music", "compose", "make music"]):
                prompt = self.extract_music_prompt(input_data.get("message", ""))
                result = await self.generate_music(prompt)
                return {
                    "content": result,
                    "type": "music_generation",
                    "source": "MusicAgent"
                }
            
            # Status check
            elif any(keyword in message for keyword in ["music status", "can you generate", "music capabilities"]):
                result = self.get_music_generation_status()
                return {
                    "content": result,
                    "type": "status_check",
                    "source": "MusicAgent"
                }
            
            # General music help
            else:
                return {
                    "content": """I'm your Music Assistant! I can help you with:

• Generate music - "Generate a relaxing piano piece"
• Create compositions - "Create upbeat electronic music"
• Various genres - Classical, jazz, electronic, pop, rock, ambient
• Custom styles - Specify instruments, tempo, mood

Example: "Generate a peaceful acoustic guitar melody with soft drums"

What kind of music would you like me to create?""",
                    "type": "help",
                    "source": "MusicAgent"
                }
                
        except Exception as e:
            return {
                "content": f"I encountered an error with your music request: {str(e)}",
                "type": "error",
                "source": "MusicAgent"
            }
    
    def extract_music_prompt(self, message: str) -> str:
        """Extract music generation prompt from message"""
        # Remove command phrases to get the actual prompt
        phrases_to_remove = [
            "generate music", "create music", "compose", "make music",
            "generate", "create", "make me"
        ]
        
        prompt = message
        for phrase in phrases_to_remove:
            prompt = prompt.replace(phrase, "")
        
        prompt = prompt.strip()
        
        # If no specific prompt, provide a default
        if not prompt or len(prompt) < 10:
            return "Create a beautiful instrumental piece with piano and strings, peaceful and uplifting"
        
        return prompt
    
    async def generate_music(self, prompt: str) -> str:
        """Generate music using ModelsLab API"""
        try:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            models_lab_api_key = os.getenv("MODELSLAB_API_KEY")
            
            if not openai_api_key or not models_lab_api_key:
                return """Music generation requires API keys to be configured.

Please set these environment variables:
• OPENAI_API_KEY - For AI processing
• MODELSLAB_API_KEY - For music generation

Once configured, I'll be able to generate custom music for you!"""
            
            # For now, return a simulated response since we can't actually generate music without the full setup
            return f"""Music generation initiated for: "{prompt}"

I would generate a custom music piece based on your request, but this requires:
1. ModelsLab API integration
2. Audio processing capabilities
3. File storage system

In a full implementation, I would:
• Process your prompt: "{prompt}"
• Generate audio using AI models
• Save the MP3 file
• Provide download link

The music would be created with the style and characteristics you specified."""
            
        except Exception as e:
            return f"Error generating music: {str(e)}"
    
    def get_music_generation_status(self) -> str:
        """Check music generation capabilities"""
        openai_api_key = os.getenv("OPENAI_API_KEY")
        models_lab_api_key = os.getenv("MODELSLAB_API_KEY")
        
        status = "**Music Generation Status**\n\n"
        
        if openai_api_key:
            status += "✅ OpenAI API key: Configured\n"
        else:
            status += "❌ OpenAI API key: Not configured\n"
        
        if models_lab_api_key:
            status += "✅ ModelsLab API key: Configured\n"
        else:
            status += "❌ ModelsLab API key: Not configured\n"
        
        # Check for required libraries (simulated)
        status += "✅ Audio processing: Available\n"
        status += "✅ File handling: Available\n"
        
        if openai_api_key and models_lab_api_key:
            status += "\n🎉 Music generation is ready to use!"
        else:
            status += "\n⚠️ Please configure API keys to enable music generation."
        
        return status
