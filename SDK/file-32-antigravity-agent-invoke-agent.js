import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import fs from "fs";
import { execSync } from "child_process";

dotenv.config();

const client = new GoogleGenAI({});

const result = await client.interactions.create({
    agent: "fibonacci-analyst",
    input: "Generate the first 50 prime numbers, plot their distribution, and save a PDF report.",
    environment: "remote",
}, {
    timeout: 300_000,
});

console.log(result.output_text);