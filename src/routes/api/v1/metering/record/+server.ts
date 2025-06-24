import type { RequestHandler } from './$types';
import { activityTable, usersTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const meteringRecord: {
    user: { name: string; email: string; role: string; id: string };
    activity: {
      id: string;
      timestamp: number;
      user_id: string;
      model: string;
      prompt_token: number;
      completion_token: number;
      reasoning_token?: number;
      cost: number;
      cached_tokens: number;
    };
  } = await request.json();
  const user: typeof usersTable.$inferInsert = {
    id: meteringRecord?.user?.id,
    name: meteringRecord?.user?.name,
    email: meteringRecord?.user?.email,
    role: meteringRecord?.user?.role
  };
  await db.insert(usersTable).values(user).onConflictDoNothing();
  const activity: typeof activityTable.$inferInsert = {
    id: meteringRecord?.activity?.id,
    timestamp: meteringRecord?.activity?.timestamp,
    user_id: meteringRecord?.activity?.user_id,
    model: meteringRecord?.activity?.model,
    prompt_token: meteringRecord?.activity?.prompt_token,
    completion_token: meteringRecord?.activity?.completion_token,
    reasoning_token: meteringRecord?.activity?.reasoning_token,
    cost: meteringRecord?.activity?.cost ?? 0.0,
    cached_tokens: meteringRecord?.activity?.cached_tokens
  };
  await db.insert(activityTable).values(activity).onConflictDoNothing();
  console.info(
    `Metering record was created; Timetstamp: ${activity.timestamp}; user: ${user.id}: cost: ${activity.cost}`
  );
  return json({ success: true });
};
