import {GoogleGenAI} from "@google/genai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  throw new Error("Set the GOOGLE_GENAI_API_KEY environment variable before running this script.");
}

const ai = new GoogleGenAI({ apiKey });

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Explain how AI works in a few words.",
});

console.log(interaction.output_text);