import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
// const apiKey = process.env.GOOGLE_API_KEY;

const client = new GoogleGenAI({});

const uploadedFile = await client.files.upload({
    file: "files/red-corvette.jpg",
    config: { mimeType: "image/jpeg" }
});

const interaction = await client.interactions.create({
    model: "gemini-3.5-flash",
    input: [
        {type: "text", text: "Caption this image."},
        {
            type: "image",
            uri: uploadedFile.uri,
            mime_type: uploadedFile.mimeType
        }
    ]
});

console.log(interaction.output_text);