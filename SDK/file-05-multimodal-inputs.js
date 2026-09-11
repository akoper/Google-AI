import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const uploadedFile = await ai.files.upload({
    file: "files/trumpet.jpg", // Replace with the path to your file
    config: { mimeType: "image/jpeg" } // Specify the MIME type of the file
  });

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    input: [
      {type: "text", text: "Tell me about this instrument."},
      {
        type: "image",
        uri: uploadedFile.uri,
        mime_type: uploadedFile.mimeType
      }
    ],
  });
  console.log(interaction.output_text);
}

await main();