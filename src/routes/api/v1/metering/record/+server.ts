import type { RequestHandler } from './$types';
import { activityTable, usersTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import * as z from 'zod/v4';

export const POST: RequestHandler = async ({ request }) => {
  const MeteringRecord = z.object({
    user: z.object({ name: z.string(), email: z.string(), role: z.string(), id: z.string() }),
    activity: z.object({
      id: z.string(),
      timestamp: z.int(),
      user_id: z.string(),
      model: z.string(),
      prompt_token: z.int(),
      completion_token: z.int(),
      reasoning_token: z.nullish(z.int()),
      cost: z.float64(),
      cached_tokens: z.nullish(z.int())
    })
  });
  const meteringRecord = MeteringRecord.parse(await request.json());
  const user: typeof usersTable.$inferInsert = meteringRecord.user;
  await db.insert(usersTable).values(user).onConflictDoUpdate({ target: usersTable.id, set: user });
  const activity: typeof activityTable.$inferInsert = {
    reasoning_token: meteringRecord.activity?.reasoning_token ?? null,
    ...meteringRecord.activity
  };
  await db.insert(activityTable).values(activity).onConflictDoNothing();
  console.info(
    `Metering record was created; Timetstamp: ${activity.timestamp}; user: ${user.id}: cost: ${activity.cost}`
  );
  return json({ success: true });
};
