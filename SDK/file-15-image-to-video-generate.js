import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const ai = new GoogleGenAI({});

const base64Image = fs.readFileSync('files/fish-drawing.png').toString('base64');

const spinnerFrames = ['|', '/', '-', '\\'];
let spinnerIndex = 0;
const spinnerInterval = setInterval(() => {
  process.stdout.write(`\rGenerating video... ${spinnerFrames[spinnerIndex++]}`);
  if (spinnerIndex >= spinnerFrames.length) spinnerIndex = 0;
}, 120);

let interaction;
try {
  interaction = await ai.interactions.create({
    model: 'gemini-omni-flash-preview',
    input: [
      { type: 'image', data: base64Image, mime_type: 'image/png' },
      { type: 'text', text: 'turn this into realistic footage, using the drawing only as a guide for movement, do not show the drawing in the final video' }
    ]
  });
} finally {
  clearInterval(spinnerInterval);
  process.stdout.write('\rGenerating video... done.\n');
}

if (interaction.output_video?.data) {
  fs.writeFileSync('clownfish.mp4', Buffer.from(interaction.output_video.data, 'base64'));
}