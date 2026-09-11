// Part of agent.ts --> Follow https://adk.dev/get-started/ to learn the setup
import { LoopAgent, LlmAgent, SequentialAgent, FunctionTool } from '@google/adk';
import { z } from 'zod';

// npx adk run file-08-multi-agent-loop-workflow.ts 

// --- Constants ---
const GEMINI_MODEL = 'gemini-flash-latest';
const STATE_INITIAL_TOPIC = "initial_topic";

// --- State Keys ---
const STATE_CURRENT_DOC = "current_document";
const STATE_CRITICISM = "criticism";
// Define the exact phrase the Critic should use to signal completion
const COMPLETION_PHRASE = "No major issues found.";

// --- Tool Definition ---
const exitLoopTool = new FunctionTool({
    name: 'exit_loop',
    description: 'Call this function ONLY when the critique indicates no further changes are needed, signaling the iterative process should end.',
    parameters: z.object({}),
    execute: (input, context) => {
        if (context) {
            console.log(`  [Tool Call] exit_loop triggered by ${context.agentName} with input: ${input}`);
            context.actions.escalate = true;
        }
        return {};
    },
});

// --- Agent Definitions ---

// STEP 0: Topic Capture Agent (Runs ONCE to populate state from user input)
const topicCaptureAgent = new LlmAgent({
    name: "TopicCaptureAgent",
    model: GEMINI_MODEL,
    instruction: `You are extracting the story topic from the latest user request.
    Return a concise topic phrase (around 5-20 words) that preserves the core idea.
    Output only the topic text and nothing else.`,
    description: "Captures the user-provided topic and stores it in state.",
    outputKey: STATE_INITIAL_TOPIC
});

// STEP 1: Initial Writer Agent (Runs ONCE at the beginning)
const initialWriterAgent = new LlmAgent({
    name: "InitialWriterAgent",
    model: GEMINI_MODEL,
    includeContents: 'none',
    // MODIFIED Instruction: Ask for a slightly more developed start
    instruction: `You are a Creative Writing Assistant tasked with starting a story.
    Write the *first draft* of a short story (aim for 2-4 sentences).
    Base the content *only* on the topic provided below. Try to introduce a specific element (like a character, a setting detail, or a starting action) to make it engaging.
    Topic: {{${STATE_INITIAL_TOPIC}}}

    Output *only* the story/document text. Do not add introductions or explanations.
    `,
    description: "Writes the initial document draft based on the topic, aiming for some initial substance.",
    outputKey: STATE_CURRENT_DOC
});

// STEP 2a: Critic Agent (Inside the Refinement Loop)
const criticAgentInLoop = new LlmAgent({
    name: "CriticAgent",
    model: GEMINI_MODEL,
    includeContents: 'none',
    // MODIFIED Instruction: More nuanced completion criteria, look for clear improvement paths.
    instruction: `You are a Constructive Critic AI reviewing a short document draft (typically 2-6 sentences). Your goal is balanced feedback.

    **Document to Review:**

    {{current_document}}


    **Task:**
    Review the document for clarity, engagement, and basic coherence according to the initial topic (if known).

    IF you identify 1-2 *clear and actionable* ways the document could be improved to better capture the topic or enhance reader engagement (e.g., "Needs a stronger opening sentence", "Clarify the character's goal"):
    Provide these specific suggestions concisely. Output *only* the critique text.

    ELSE IF the document is coherent, addresses the topic adequately for its length, and has no glaring errors or obvious omissions:
    Respond *exactly* with the phrase "${COMPLETION_PHRASE}" and nothing else. It doesn't need to be perfect, just functionally complete for this stage. Avoid suggesting purely subjective stylistic preferences if the core is sound.

    Do not add explanations. Output only the critique OR the exact completion.
`,
    description: "Reviews the current draft, providing critique if clear improvements are needed, otherwise signals completion.",
    outputKey: STATE_CRITICISM
});


// STEP 2b: Refiner/Exiter Agent (Inside the Refinement Loop)
const refinerAgentInLoop = new LlmAgent({
    name: "RefinerAgent",
    model: GEMINI_MODEL,
    // Relies solely on state via placeholders
    includeContents: 'none',
    instruction: `You are a Creative Writing Assistant refining a document based on feedback OR exiting the process.
    **Current Document:**

    {{current_document}}

    **Critique/Suggestions:**
    {{criticism}}

    **Task:**
    Analyze the 'Critique/Suggestions'.
    IF the critique is *exactly* "${COMPLETION_PHRASE}":
    You MUST call the 'exit_loop' function. Do not output any text.
    ELSE (the critique contains actionable feedback):
    Carefully apply the suggestions to improve the 'Current Document'. Output *only* the refined document text.

    Do not add explanations. Either output the refined document OR call the exit_loop function.
`,
    tools: [exitLoopTool],
    description: "Refines the document based on critique, or calls exit_loop if critique indicates completion.",
    outputKey: STATE_CURRENT_DOC
});


// STEP 2: Refinement Loop Agent
const refinementLoop = new LoopAgent({
    name: "RefinementLoop",
    // Agent order is crucial: Critique first, then Refine/Exit
    subAgents: [
        criticAgentInLoop,
        refinerAgentInLoop,
    ],
    maxIterations: 5 // Limit loops
});

// STEP 3: Overall Sequential Pipeline
// For ADK tools compatibility, the root agent must be named `root_agent`
export const rootAgent = new SequentialAgent({
    name: "IterativeWritingPipeline",
    subAgents: [
        topicCaptureAgent,  // Capture user input into initial_topic first
        initialWriterAgent, // Run first to create initial doc
        refinementLoop       // Then run the critique/refine loop
    ],
    description: "Writes an initial document and then iteratively refines it with critique using an exit tool."
});