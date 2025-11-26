import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types as genai_types

from app.schemas.goal import GoalGenerationResponse

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# The google-genai client automatically looks for the GEMINI_API_KEY environment variable.
# No need to pass it explicitly if the env var is set.
client = genai.Client()

def generate_goal_steps(goal_text: str) -> GoalGenerationResponse:
    """
    Uses Gemini to break down a vague goal into 5 actionable steps.
    """
    prompt = f"""
    You are an expert project manager and strategist. Your task is to break down a user's vague goal into exactly 5 simple, actionable, and sequential steps.
    
    The user's goal is: **"{goal_text}"**

    Return a single, valid JSON object.

    ### Rules
    - The `complexity` score must be an integer between 1 (very simple) and 10 (highly complex).
    - The `tasks` array must contain exactly 5 task objects.
    - Each task `title` should be a clear, concise action item.
    - Do not add any extra commentary or text outside of the final JSON object.
    """

    response = client.models.generate_content(
        model="models/gemini-flash-latest", # The model name might need the 'models/' prefix
        contents=prompt,
        config=genai_types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GoalGenerationResponse,
                temperature=0,
            ),

    )
    
    response_data = json.loads(response.text)
    data = GoalGenerationResponse.model_validate(response_data)
    print(data)
    return data

if __name__ == '__main__':
    # Example usage for testing
    test_goal = "Launch a startup"
    try:
        result = generate_goal_steps(test_goal)
        print("Successfully generated steps:")
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print(f"An error occurred: {e}")

