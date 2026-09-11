import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";

// npx adk run .\file-01-time.ts
// [user]: what can you do?
// [hello_time_agent]: I can help you find the current time in any city in the world
// [user]: London
// npx adk web .\file-01-time.ts
// http://localhost:8000

const getCurrentTime = new FunctionTool({
    name: 'get_current_time',
    description: 'Get the current time in a specified city',
    parameters: z.object({
        city: z.string().describe('The city for which to get the current time'),
    }),
    execute: ({city}) => {
        return {status: 'success', result: `The current time in ${city} is ${new Date().toLocaleString('en-US', { timeZone: city })}`};
    }
});

export const rootAgent = new LlmAgent({
    name: 'hello_time_agent',
    model: 'gemini-flash-latest',
    description: 'An agent that provides the current time in a specified city',
    instruction: `You are a helpful assistant that tells the current time in a city.
                Use the 'getCurrentTime' tool for this purpose.`,
    tools: [getCurrentTime],
});