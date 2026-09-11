import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({});

const prompt = `A close up of two people staring at a cryptic drawing on a wall, torchlight flickering.
A man murmurs, 'This must be it. That's the secret code.' The woman looks at him and whispering excitedly, 'What did you find?'
Include natural spoken dialogue with ambient sound and soft footsteps, so the video contains both visuals and audio.`;

let operation = await ai.models.generateVideos({
    model: "veo-3.1-generate-preview",
    prompt: prompt,
    // config: {
    //     generateAudio: true,  //apparently only avaialbe with enterprise edition 
    // },
});

// Poll the operation status until the video is ready.
while (!operation.done) {
    console.log("Waiting for video generation to complete...")
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
        operation: operation,
    });
}

// Download the generated video.
ai.files.download({
    file: operation.response.generatedVideos[0].video,
    downloadPath: "veo-model-video-dialogue.mp4",
});
console.log(`Generated video saved to veo-model-video-dialogue.mp4`);