import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const client = new GoogleGenAI({});

const interaction = await client.interactions.create({
    model: 'gemini-3.6-flash',
    input: 'Get the current weather in San Francisco. Return only the weather information.',
    tools: [
        {
            type: 'mcp_server',
            name: 'weather',
            url: 'https://gemini-api-demos.uc.r.appspot.com/mcp'
        }
    ]
});

console.log('Weather Information:');
for (const step of interaction.steps) {
    if (step.type === 'text') {
        console.log(step.text);
    } else if (step.type === 'tool_result') {
        console.log('Tool Result:', JSON.stringify(step.result, null, 2));
    }
}