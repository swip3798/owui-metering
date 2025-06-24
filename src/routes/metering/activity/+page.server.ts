import { db } from '$lib/server/db';
import { activityTable, usersTable } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { buildActivityTableData, getLatestActivity } from '$lib/server/activityLog';

export const load: PageServerLoad = async ({ }) => {
  const { columns, rows } = buildActivityTableData(await getLatestActivity());

  return {
    columns,
    rows
  };
};
