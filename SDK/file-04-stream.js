import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

const stream = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Explain how AI works",
  stream: true,
});

for await (const event of stream) {
  console.log(event);
}