import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import dotenv from "dotenv";
import * as z from "zod";

dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey });

const recipeJsonSchema = {
  type: "object",
  properties: {
    recipe_name: { type: "string", description: "Name of the recipe." },
    ingredients: {
      type: "array",
      items: { type: "string" },
      description: "List of ingredients."
    },
    prep_time_minutes: {
      type: "integer",
      description: "Prep time in minutes."
    }
  },
  required: ["recipe_name", "ingredients"]
};

const recipeSchema = z.fromJSONSchema(recipeJsonSchema);

const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: "Give me a recipe for banana bread",
  response_format: {
    type: "text",
    mime_type: "application/json",
    schema: recipeJsonSchema
  },
});

// console.log("Response:", interaction);
// consolelog("\n -------------------------------- \n");

const recipe = recipeSchema.parse(JSON.parse(interaction.output_text));

console.log(recipe);