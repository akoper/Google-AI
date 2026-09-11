import { GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({apiKey});

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Write a detailed analysis of the impact of artificial intelligence on modern healthcare.",
  background: true,
});

console.log(`Started background task id: ${interaction.id}`);

console.log(`Status: ${interaction.status}`);

// Poll for completion
while (true) {
  const result = await ai.interactions.get(interaction.id);
  console.log(`Status: ${result.status}`);
  if (result.status === "completed") {
    console.log(`\nResult:\n${result.output_text}`);
    break;
  } else if (result.status === "failed") {
    console.log(`Failed: ${result.error}`);
    break;
  }
  await new Promise(r => setTimeout(r, 5000));
}