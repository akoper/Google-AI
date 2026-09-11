import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

async function main() {
  const ai = new GoogleGenAI({apiKey});

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-image",
    input: "Visualize the current weather forecast for the next 5 days in San Francisco as a clean, modern weather chart. Add a visual on what I should wear each day",
    tools: [{"type": "google_search"}],
    response_format: {
      type: "image",
      mime_type: "image/jpeg",
      aspect_ratio: "16:9",
      image_size: "2K"
    },
  });

  const buffer = Buffer.from(interaction.output_image.data, 'base64');

  fs.writeFileSync('weather.png', buffer);
  
  console.log("Image created as weather.png");
}

main();