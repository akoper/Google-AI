import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

async function main() {

  const ai = new GoogleGenAI({apiKey});

  const prompt ="Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-image",
    input: prompt,
  });

  const generatedImage = interaction.output_image;

  if (generatedImage) {
    const buffer = Buffer.from(generatedImage.data, "base64");
    fs.writeFileSync("nanobanana-restaurant.png", buffer);

    console.log("Image saved as nanobanana-restaurant.png");
  }
}

main();