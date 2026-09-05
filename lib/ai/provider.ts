import { createOpenAI } from '@ai-sdk/openai';
import { env, isOpenRouterConfigured } from '@/lib/config/env';

export { isOpenRouterConfigured };

export const getOpenRouterClient = () => {
  if (!isOpenRouterConfigured) {
    throw new Error('OPENROUTER_API_KEY is missing. Add it to your environment before using AI parsing.');
  }

  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: env.OPENROUTER_API_KEY,
  });
};
