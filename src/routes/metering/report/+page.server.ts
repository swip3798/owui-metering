import type { PageServerLoad } from './$types';
import {
  getDailyCost,
  getReportData,
  getTimeBoundaries,
  getTimeBoundariesForMonth
} from '$lib/server/activityReport';

export const load: PageServerLoad = async ({ url }) => {
  const boundaries = await getTimeBoundaries();
  const params = url.searchParams;
  const month = parseInt(params.get('month') ?? String(boundaries.last.getUTCMonth()));
  const year = parseInt(params.get('year') ?? String(boundaries.last.getUTCFullYear()));
  const { start, end } = getTimeBoundariesForMonth(year, month);
  const reportData = await getReportData(start, end);
  const dailyUsage = await getDailyCost(start, end);
  return {
    dailyUsage,
    boundaries,
    reportData,
    month,
    year
  };
};
