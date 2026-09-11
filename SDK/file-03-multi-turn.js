import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Stateful (recommended): Continue a conversation on the server using previous_interaction_id.
// Ideal for most chat and agentic workflows where you want the server to manage history
// and optimize caching.

dotenv.config();

const ai = new GoogleGenAI({});

// server-side state
const interaction1 = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "I have 2 dogs in my house.",
});

console.log("Response 1:", interaction1.output_text);

const interaction2 = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "How many paws are in my house?",
  previous_interaction_id: interaction1.id,
});

console.log("Response 2:", interaction2.output_text);