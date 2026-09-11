import os
from google import genai

# pip install -U google-genai

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY", "REPLACE_WITH_YOUR_GOOGLE_API_KEY"))

interaction = client.interactions.create(
    model="gemini-3.5-flash",
    input="Explain how AI works in a few words"
)

print(interaction.output_text)