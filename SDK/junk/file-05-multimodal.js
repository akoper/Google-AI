import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

// load a local image'
const imageBytes = fs.readFileSync('image.png');
const imageBase64 = imageBytes.toString('base64');

const interaction = await ai.interactions.create({
  model: 'gemini-3.5-flash',
  input: [
    { type: "text", text: "Compare this local image and this remote audio file."},
    { type: "image", data: imageBase64, mime_type: "image/png" },
    { type: "audio", uri: "https://storage.googleapis.com/generativeai-downloads/data/sample.mp3",
      mime_type: "audio/mp3" }
  ],
});

console.log(interaction.output_text);