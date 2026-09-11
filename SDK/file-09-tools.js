import { GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Who won the Euro 2024?",
  tools: [{ type: "google_search" }]
});

console.log(interaction);
console.log("\n -------------------------------- \n");

console.log(interaction.output_text);

// print citations
for (const step of interaction.steps) {
  if (step.type === "model_output") {
    for (const contentBlock of step.content) {
      if (contentBlock.type == "text" && contentBlock.annotations) {
        console.log("\nCitations:");
        for (const annotation of contentBlock.annotations) {
          if(annotation.type === "url_citation") {
            console.log(`  [${annotation.title}](${annotation.url})`);
          }
        }
      }
    }
  }
}
