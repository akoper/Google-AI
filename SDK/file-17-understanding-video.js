import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({});

async function main() {
  const myfile = await ai.files.upload({
    file: "files/clownfish.mp4",
    config: { mimeType: "video/mp4" },

  });

  let getFile = await ai.files.get({ name: myfile.name });

  while (getFile.state === 'PROCESSING') {
      getFile = await ai.files.get({ name: myfile.name });
      console.log(`current file status: ${getFile.state}`);
      console.log('Video is still being processed, retrying in 5 seconds');

      await new Promise((resolve) => {
          setTimeout(resolve, 5000);
      });
  }
  if (getFile.state === 'FAILED') {
      throw new Error('Video processing failed.');
  }

  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: [
      { type: "video", uri: myfile.uri, mime_type: myfile.mimeType },
      { type: "text", text: "Summarize this video. Then create a quiz with an answer key based on the information in this video." }
    ],
  });

  console.log(interaction.output_text);
}

await main();