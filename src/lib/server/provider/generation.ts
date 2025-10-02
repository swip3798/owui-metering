import * as z from 'zod/v4';

export const getGeneration = async (id: string) => {
  const url = `https://openrouter.ai/api/v1/generation?id=${id}`;

  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
  };

  const response = await fetch(url, options);

  const GenerationResponse = z.object({
    data: z.object({
      id: z.string(),
      total_cost: z.number(),
      created_at: z.string(),
      model: z.string(),
      origin: z.nullish(z.string()),
      usage: z.nullish(z.number()),
      is_byok: z.nullish(z.boolean()),
      upstream_id: z.nullish(z.string()),
      cache_discount: z.nullish(z.number()),
      upstream_inference_cost: z.nullish(z.number()),
      app_id: z.nullish(z.number()),
      streamed: z.nullish(z.boolean()),
      cancelled: z.nullish(z.boolean()),
      provider_name: z.nullish(z.string()),
      latency: z.nullish(z.number()),
      moderation_latency: z.nullish(z.number()),
      generation_time: z.nullish(z.number()),
      finish_reason: z.nullish(z.string()),
      native_finish_reason: z.nullish(z.string()),
      tokens_prompt: z.nullish(z.number()),
      tokens_completion: z.nullish(z.number()),
      native_tokens_prompt: z.nullish(z.number()),
      native_tokens_completion: z.nullish(z.number()),
      native_tokens_reasoning: z.nullish(z.number()),
      num_media_prompt: z.nullish(z.number()),
      num_media_completion: z.nullish(z.number()),
      num_search_results: z.nullish(z.number())
    })
  });
  const body = await response.json();
  const generationRecord = GenerationResponse.parse(body);
  return generationRecord.data;
};
