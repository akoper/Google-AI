import { GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

const interaction = await ai.interactions.create({
  agent: "antigravity-preview-05-2026",
  input: "Write a Python script that generates the first 20 Fibonacci numbers and saves them to fibonacci.txt. Then read the file and print its contents.",
  environment: "remote",
});

console.log(`Enivornment: ${interaction.environment_id}`);
console.log(interaction.output_text);
