import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { usersTable } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { buildActivityTableData, getLatestActivity } from '$lib/server/activityLog';

export const load: PageServerLoad = async ({ params }) => {
  const userSelect = await db.select().from(usersTable).where(eq(usersTable.id, params.userid));
  if (userSelect.length !== 1) {
    error(404, 'User not found');
  }
  const user = userSelect[0];
  const { columns, rows } = buildActivityTableData(await getLatestActivity(5000, user.id));

  return {
    user,
    columns,
    rows
  };
};
