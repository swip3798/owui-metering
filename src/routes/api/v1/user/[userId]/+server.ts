import { db } from '$lib/server/db';
import { activityTable, usersTable } from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params: { userId } }) => {
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

export const PUT: RequestHandler = async ({ params: { userId } }) => {
  if (!userId) {
    return json({ success: false, message: 'UserId is missing or wrong' }, { status: 400 });
  }

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  await db
    .update(activityTable)
    .set({ user_id: '[Deleted user]' })
    .where(eq(activityTable.id, userId));
  return json({ success: true, message: 'Success, user soft deleted' });
};

export const DELETE: RequestHandler = async ({ params: { userId } }) => {
  if (!userId) {
    return json({ success: false, message: 'UserId is missing or wrong' }, { status: 400 });
  }

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  await db.delete(activityTable).where(eq(activityTable.user_id, userId));
  return json({ success: true, message: 'Success, user hard deleted' });
};
