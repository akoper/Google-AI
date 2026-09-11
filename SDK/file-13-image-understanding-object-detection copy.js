import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as z from "zod";

dotenv.config();
// const apiKey = process.env.GOOGLE_API_KEY;

const client = new GoogleGenAI({});

const prompt = "Detect the all of the prominent items in the image. The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000.";

const boundingBoxesSchema = z.object({
  boxes: z.array(z.object({
    box_2d: z.array(z.number()),
    mask: z.array(z.array(z.number())),
    label: z.string()
  }))
});

// extra junk because of where create has to get the image from filepath no beauno
const uploadedFile = await client.files.upload({
  file: "files/counter.jpg",
  config: { mimeType: "image/jpeg" }
});

const interaction = await client.interactions.create({
  model: "gemini-3.5-flash",
  input: [
    { type: "text", text: prompt },
    {
      type: "image",
      uri: uploadedFile.uri,
      mime_type: "image/jpeg"
    }
  ],
  response_format: {
    type: 'text',
    mime_type: 'application/json',
    schema: z.toJSONSchema(boundingBoxesSchema)
  },
});

const result = boundingBoxesSchema.parse(JSON.parse(interaction.output_text));

console.log(result);