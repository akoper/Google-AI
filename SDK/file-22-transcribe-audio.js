import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import wav from 'wav';

dotenv.config();

const client = new GoogleGenAI({});

const YOUTUBE_URL = "https://www.youtube.com/watch?v=ku-N-eS1lgM";

const prompt = `
  Process the audio file and generate a detailed transcription.

  Requirements:
  1. Identify distinct speakers (e.g., Speaker 1, Speaker 2).
  2. Provide accurate timestamps for each segment (Format: MM:SS).
  3. Detect the primary language of each segment.
  4. If not English, provide the English translation.
  5. Identify the primary emotion: Happy, Sad, Angry, or Neutral.
  6. Provide a brief summary at the beginning.
`;

const responseSchema = {
    type: "object",
    properties: {
        summary: { type: "string" },
        segments: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    speaker: { type: "string" },
                    timestamp: { type: "string" },
                    content: { type: "string" },
                },
                required: ["speaker", "timestamp", "content"]
            }
        }
    },
    required: ["summary", "segments"]
};

const interaction = await client.interactions.create({
    model: "gemini-3.6-flash",
    input: [
        { type: "video", uri: YOUTUBE_URL, mime_type: "video/mp4" },
        { type: "text", text: prompt }
    ],
    response_format: responseSchema,
});

console.log(JSON.parse(interaction.output_text));