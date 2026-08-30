import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { AiProvider } from "@/lib/database.types";

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "OpenAI",
  deepseek: "DeepSeek",
};

export const PROVIDER_ENV_VAR: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

export const PROVIDER_DEFAULT_MODEL: Record<AiProvider, string> = {
  anthropic: "claude-sonnet-5",
  openai: "gpt-4.1",
  deepseek: "deepseek-chat",
};

/**
 * Calls the configured LLM provider with a single unified interface.
 * OpenAI and DeepSeek both speak the OpenAI Chat Completions API
 * (DeepSeek is wire-compatible), so they share one code path.
 */
export async function callLlm(opts: {
  provider: AiProvider;
  apiKey: string;
  model?: string | null;
  system: string;
  messages: LlmMessage[];
}): Promise<string> {
  const model = opts.model?.trim() || PROVIDER_DEFAULT_MODEL[opts.provider];

  if (opts.provider === "anthropic") {
    const client = new Anthropic({ apiKey: opts.apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 1200,
      system: opts.system,
      messages: opts.messages,
    });
    return response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }

  const client = new OpenAI({
    apiKey: opts.apiKey,
    baseURL: opts.provider === "deepseek" ? "https://api.deepseek.com" : undefined,
  });
  const response = await client.chat.completions.create({
    model,
    max_tokens: 1200,
    messages: [{ role: "system", content: opts.system }, ...opts.messages],
  });
  return response.choices[0]?.message?.content ?? "";
}
