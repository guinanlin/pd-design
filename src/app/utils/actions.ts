'use server';

import { generateText } from 'ai';
import { azure } from '@ai-sdk/azure';

interface AzureConfig {
  azureApiKey: string;
  azureEndpoint: string;
  azureDeploymentName: string;
  azureApiVersion: string;
}

export async function getAnswer(question: string, config: AzureConfig) {
  const { text, finishReason, usage } = await generateText({
    model: config.azureDeploymentName,
    azure: {
      apiKey: config.azureApiKey,
      endpoint: config.azureEndpoint,
      apiVersion: config.azureApiVersion,
    },
    prompt: question,
  });

  return { text, finishReason, usage };
}