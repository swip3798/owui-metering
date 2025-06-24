import type { PageServerLoad } from './$types';

type Model = {
  id: string;
  name: string;
  created: Date;
  description: string;
  contextLength: number;
  pricing: { prompt: string; completion: string; reasoning: string | null };
  supportedParams: string[];
};
let cache: Model[] | null = null;
let lastCache: Date | null = null;

export const load: PageServerLoad = async ({ }) => {
  if (lastCache !== null && cache !== null) {
    const now = new Date();
    const cacheAge = now.getTime() - lastCache.getTime();
    if (cacheAge < 300 * 1000) {
      return { models: cache };
    }
  }
  const url = 'https://openrouter.ai/api/v1/models';
  const apiRes = await fetch(url);
  const apiData = await apiRes.json();

  let models: Model[] = apiData.data.map((model: any) => {
    return {
      id: model?.id,
      name: model?.name,
      created: new Date((model?.created ?? 0) * 1000),
      description: model?.description,
      contextLength: model?.context_length,
      pricing: {
        prompt: model?.pricing?.prompt,
        completion: model?.pricing?.completion,
        reasoning: model?.pricing?.reasoning
      },
      supportedParams: model?.supported_params
    };
  });
  models = models.filter(
    (model: any) => !model.id.startsWith('xAI') && model.name.search('(free)') == -1
  );
  cache = models;
  lastCache = new Date();

  return {
    models: models
  };
};
