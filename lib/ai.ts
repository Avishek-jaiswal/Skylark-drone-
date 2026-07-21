import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export function getAIModel() {
  const modelName =
    process.env.GROQ_MODEL_NAME || "llama-3.1-8b-instant";

  return groq(modelName);
}

interface StreamResponseOptions {
  system: string
  prompt: string
  temperature?: number
}

export async function streamAIResponse(options: StreamResponseOptions) {
  const model = getAIModel();

  const result = await streamText({
    model,
    system: options.system,
    prompt: options.prompt,
    temperature: options.temperature ?? 0.3,
  });

  return result;
}
