import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as fs from 'node:fs';

dotenv.config();

const ai = new GoogleGenAI({});

const interaction = await ai.interactions.create({  
  model: 'gemini-omni-flash-preview',  
  input: 'A marble rolling fast on a chain reaction style track, continuous smooth shot.',
});

if (interaction.output_video?.data) {
  fs.writeFileSync('marble.mp4', Buffer.from(interaction.output_video.data, 'base64'));
}
