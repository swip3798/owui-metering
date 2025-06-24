import { getDailyCost, getModelTokenStat } from '$lib/server/activityReport';
import type { PageServerLoad } from './$types';
import { buildActivityTableData, getLatestActivity } from '$lib/server/activityLog';

const getOptionalCredits = async () => {
  if (!process.env.OPENROUTER_API_KEY) {
    return null;
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/credits', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const {
      data: { total_credits, total_usage }
    }: { data: { total_credits: number; total_usage: number } } = await res.json();
    return { total_credits, total_usage };
  } catch {
    return null;
  }
};

export const load: PageServerLoad = async ({ }) => {
  const end = new Date();
  const start = new Date((end.getTime() / 1000 - 7 * 86400) * 1000);
  return {
    credits: getOptionalCredits(),
    topModels: getModelTokenStat(start, end, 5),
    dailyUsage: getDailyCost(start, end),
    recentActivity: buildActivityTableData(await getLatestActivity(5))
  };
};
