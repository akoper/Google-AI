import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import wav from 'wav';

dotenv.config();

const client = new GoogleGenAI({});

const uploadedFile = await client.files.upload({
    file: "files/audio-sample.mp3",
    config: { mime_type: "audio/mp3" }
});

const interaction = await client.interactions.create({
    model: "gemini-3.6-flash",
    input: [
        {type: "text", text: "Describe this audio clip"},
        {
            type: "audio",
            uri: uploadedFile.uri,
            mime_type: uploadedFile.mimeType
        }
    ]
});

console.log(interaction.output_text);