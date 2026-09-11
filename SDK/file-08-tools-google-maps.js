import { GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function main() {

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    input: "What are the best Italian restaurants within a 15-minute walk from here?",
    tools: [{
      type: "google_maps",
      latitude: 34.050481,
      longitude: -118.248526
    }]
  });

  // Print the model's text response
  for (const step of interaction.steps) {
    if (step.type === 'model_output') {
      for (const contentBlock of step.content) {
        if (contentBlock.type === 'text') {
          console.log(contentBlock.text);
        }
      }
    }
  }
}

console.log("\n -------------------------------- \n");
console.log(interaction);

main();
