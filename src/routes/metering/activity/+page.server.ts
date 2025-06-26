import type { PageServerLoad } from './$types';
import { buildActivityTableData, getLatestActivity } from '$lib/server/activityLog';

export const load: PageServerLoad = async ({ }) => {
  const { columns, rows } = buildActivityTableData(await getLatestActivity());

  return {
    columns,
    rows
  };
};
