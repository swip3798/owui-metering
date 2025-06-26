import { getDailyCost, getModelTokenStat } from '$lib/server/activityReport';
import type { PageServerLoad } from './$types';
import { buildActivityTableData, getLatestActivity } from '$lib/server/activityLog';
import { getOptionalCredits } from '$lib/server/provider/credits';

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
