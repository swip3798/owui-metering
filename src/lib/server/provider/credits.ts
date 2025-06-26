const openrouterCredits = async () => {
  const res = await fetch('https://openrouter.ai/api/v1/credits', {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
  });
  const {
    data: { total_credits, total_usage }
  }: { data: { total_credits: number; total_usage: number } } = await res.json();
  return { provider: 'OpenRouter', total_credits, total_usage };
};

export const getOptionalCredits = async () => {
  if (process.env.OPENROUTER_API_KEY) {
    return await openrouterCredits();
  } else {
    return { provider: null };
  }
};
