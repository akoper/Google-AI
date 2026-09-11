import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const client = new GoogleGenAI({});

const createChartFunctionDeclaration = {
  type: 'function',
  name: 'create_bar_chart',
  description: 'Creates a bar chart given a title, labels, and values.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'The title for the chart.' },
      labels: { type: 'array', items: { type: 'string' } },
      values: { type: 'array', items: { type: 'number' } },
    },
    required: ['title', 'labels', 'values'],
  },
};

const interaction = await client.interactions.create({
  model: 'gemini-3.6-flash',
  input: "Create a bar chart titled 'Quarterly Sales' with Q1: 50000, Q2: 75000, Q3: 60000.",
  tools: [createChartFunctionDeclaration],
});

for (const step of interaction.steps) {
  if (step.type === 'function_call') {
    console.log(`${step.name}(${JSON.stringify(step.arguments)})`);
  }
}