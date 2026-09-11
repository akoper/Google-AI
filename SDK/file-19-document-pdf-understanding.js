import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const ai = new GoogleGenAI({});

async function main() {
    const pdfData = fs.readFileSync("files/oil-prices.pdf", {
        encoding: "base64"
    });

    const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: [
            { type: "text", text: "Summarize this document" },
            {
                type: "document",
                data: pdfData,
                mime_type: "application/pdf"
            }
        ]
    });
    console.log(interaction.output_text);
}

main();