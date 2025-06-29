from mcp.server.fastmcp import FastMCP
from agents.tutor_agent import TutorAgent
import asyncio

mcp = FastMCP("CombinedTools")

# Initialize TutorAgent
tutor_agent = TutorAgent()

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers together. Use this for addition operations like 'sum', 'plus', 'add', 'total'."""
    return a + b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Multiply two numbers. Use this for multiplication operations like 'times', 'multiply', 'product', 'x'."""
    return a * b

@mcp.tool()
def subtract(a: int, b: int) -> int:
    """Subtract the second number from the first. Use this for subtraction operations like 'minus', 'subtract', 'difference'."""
    return a - b

@mcp.tool()
def divide(a: int, b: int) -> float:
    """Divide the first number by the second. Use this for division operations like 'divide', 'divided by', '/'."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

@mcp.tool()
async def get_weather(location: str) -> str:
    """Get weather information for a specific location. Use this when users ask about weather, temperature, climate, or current conditions in a place."""
    return f"Weather data for {location}: Sunny with 75°F"

@mcp.tool()
def calculate_percentage(value: float, percentage: float) -> float:
    """Calculate a percentage of a value. Use this for percentage calculations like 'what is X% of Y'."""
    return (value * percentage) / 100

@mcp.tool()
def power(base: float, exponent: float) -> float:
    """Calculate base raised to the power of exponent. Use this for power operations like 'squared', 'cubed', 'to the power of'."""
    return base ** exponent

@mcp.tool()
async def tutor_agent_tool(youtube_url: str, mode: str = "summary", question: str = None) -> dict:
    """
    Process YouTube videos for educational purposes.
    
    Args:
        youtube_url: The YouTube video URL to process
        mode: Either 'summary' for video summary or 'qa' for question answering
        question: Required if mode is 'qa' - the question to answer about the video
    
    Returns:
        Dictionary with processed content from the video
    """
    input_data = {
        "youtube_url": youtube_url,
        "mode": mode,
        "question": question
    }
    
    result = await tutor_agent.run_tool(input_data)
    return result

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
