import { GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

// A custom function and two turns
// During Turn 1, the model returns a response with status requires_action and the function_call
// After the function runs locally and submits the result (Turn 2), the final completed interaction returns

const weatherTool = {
  type: "function",
  name: "get_current_temperature",
  description: "Get the current temperature for a given location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city name.  For example: 'San Francisco, CA'",
      }
    },
    required: ["location"]
  }
}

const availableFunctions = {
  get_current_temperature: ({ location }) => ({
    location, temperature: "22", unit: "celsius"
  }),
};

let input = "What is the temperature in London?";
let previousId = null;
let interaction;

while(true) {
  interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    input,
    tools: [weatherTool],
    previous_interaction_id: previousId
  });

  const functionResults = [];
  for (const step of interaction.steps) {
    if (step.type === "function_call") {
      const result = availableFunctions[step.name](step.arguments);
      console.log(`Called ${step.name}(${JSON.stringify(step.arguments)}) => `, result);
      functionResults.push({
        type: "function_result",
        name: step.name,
        call_id: step.id,
        result: [{ type: "text", text: JSON.stringify(result) }]
      });
    }
  }

  if (functionResults.length === 0) { break; }

  previousId = interaction.id;
  input = functionResults;

  console.log
}
