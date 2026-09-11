import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY || "REPLACE_WITH_YOUR_GOOGLE_API_KEY";
const ai = new GoogleGenAI({ apiKey });

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Explain how AI works in a few words",
});

// console.log(interaction.output_text);
console.log(interaction);