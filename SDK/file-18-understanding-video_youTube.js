import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({});

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: [
    { type: "text", text: "Please summarize the video in 3 sentences." },
    {
      type: "video",
      uri: "https://www.youtube.com/watch?v=9hE5-98ZeCg",
    }
  ],
});
console.log(interaction.output_text);