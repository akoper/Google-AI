import {
  BaseLlm,
  Gemini,
  InMemoryRunner,
  LlmAgent,
  LlmRequest,
  RoutedLlm,
} from '@google/adk';

// npx adk run file-11-model-routing-smart.ts
// npx adk web file-11-model-routing-smart.ts

const APP_NAME = 'routing_demo_app';
const USER_ID = 'routing_demo_user';

const fastModel = new Gemini({ model: 'models/gemini-2.5-flash' });
const reasoningModel = new Gemini({ model: 'models/gemini-2.5-pro' });
const fallbackModel = new Gemini({ model: 'models/gemini-2.5-flash' });

type RouterErrorContext = {
  failedKeys: ReadonlySet<string>;
  lastError: unknown;
};

function extractLatestUserText(request: LlmRequest): string {
  const req = request as unknown as {
    contents?: Array<{ role?: string; parts?: Array<{ text?: string }> }>;
    messages?: Array<{ role?: string; parts?: Array<{ text?: string }> }>;
  };

  const turns = req.contents ?? req.messages ?? [];
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const turn = turns[i];
    if (turn.role === 'user') {
      return (turn.parts ?? []).map((part) => part.text ?? '').join('\n').trim();
    }
  }
  return '';
}

function needsDeepReasoning(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const deepKeywords = [
    'analyze',
    'tradeoff',
    'architecture',
    'root cause',
    'strategy',
    'prove',
    'derive',
    'complex',
    'multi-step',
    'step by step',
  ];

  const keywordMatch = deepKeywords.some((word) => text.includes(word));
  const longPrompt = text.length > 800;
  return keywordMatch || longPrompt;
}

const router = (
  models: Readonly<Record<string, BaseLlm>>,
  request: LlmRequest,
  errorContext?: RouterErrorContext,
): string | undefined => {
  if (errorContext) {
    if (!errorContext.failedKeys.has('reasoning')) {
      console.log('[router] Previous model failed, retrying with reasoning model.');
      return 'reasoning';
    }
    if (!errorContext.failedKeys.has('fast')) {
      console.log('[router] Previous model failed, retrying with fast model.');
      return 'fast';
    }
    if (!errorContext.failedKeys.has('fallback')) {
      console.log('[router] Previous model failed, retrying with fallback model.');
      return 'fallback';
    }
    console.log('[router] All model options exhausted.');
    return undefined;
  }

  const prompt = extractLatestUserText(request);
  const selected = needsDeepReasoning(prompt) ? 'reasoning' : 'fast';
  const reason = selected === 'reasoning' ? 'complex request' : 'fast-path request';

  if (!(selected in models)) {
    return 'fallback';
  }

  console.log(`[router] Selected model: ${selected} (${reason}).`);
  return selected;
};

const routedLlm = new RoutedLlm({
  models: {
    fast: fastModel,
    reasoning: reasoningModel,
    fallback: fallbackModel,
  },
  router,
});

export const rootAgent = new LlmAgent({
  name: 'model_routing_demo_agent',
  model: routedLlm,
  instruction: `You are a practical software assistant.
- Keep answers concise for simple requests.
- Provide deeper structured reasoning for complex requests.
- If information is uncertain, explicitly say so.`,
  description: 'Demonstrates dynamic model routing with fallback behavior.',
});

async function runOnePrompt(
  runner: InMemoryRunner,
  sessionId: string,
  text: string,
): Promise<void> {
  console.log(`\n>>> USER: ${text}`);

  const stream = runner.runAsync({
    userId: USER_ID,
    sessionId,
    newMessage: { role: 'user', parts: [{ text }] },
  });

  for await (const event of stream) {
    const responseText = event.content?.parts?.map((part) => part.text ?? '').join('');
    if (responseText) {
      console.log(`ASSISTANT: ${responseText}`);
    }
  }
}

async function main(): Promise<void> {
  const runner = new InMemoryRunner({
    appName: APP_NAME,
    agent: rootAgent,
  });

  const session = await runner.sessionService.createSession({
    appName: APP_NAME,
    userId: USER_ID,
  });

  await runOnePrompt(runner, session.id, 'Summarize the benefits of TypeScript in 3 bullets.');
  await runOnePrompt(
    runner,
    session.id,
    'Analyze tradeoffs between monolith and microservices for a 50-engineer B2B SaaS company. Include migration strategy and risk controls.',
  );
}

main().catch((error) => {
  console.error('Demo failed:', error);
  process.exitCode = 1;
});
