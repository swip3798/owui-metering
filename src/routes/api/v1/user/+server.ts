import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  const userId = url.searchParams.get('userid');
  if (!userId) {
    return json({ success: false, message: 'UserId is missing or wrong' }, { status: 400 });
  }
  const data = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = data[0] ?? null;
  if (user === null) {
    return json({ success: false, message: 'User not found' }, { status: 404 });
  }
  return json({ success: true, user });
};
