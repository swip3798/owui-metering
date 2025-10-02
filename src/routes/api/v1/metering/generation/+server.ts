import type { RequestHandler } from './$types';
import { pendingGenerationsTable, usersTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import * as z from 'zod/v4';

export const POST: RequestHandler = async ({ request }) => {
	const GenerationQueueRecord = z.object({
		user: z.object({ name: z.string(), email: z.string(), role: z.string(), id: z.string() }),
		generationId: z.string()
	});
	let now = new Date().getTime() / 1000;
	let input = GenerationQueueRecord.parse(await request.json());
	const user: typeof usersTable.$inferInsert = input.user;
	await db.insert(usersTable).values(user).onConflictDoUpdate({ target: usersTable.id, set: user });
	const pendingGeneration: typeof pendingGenerationsTable.$inferInsert = {
		id: input.generationId,
		timestamp: now,
		user_id: input.user.id
	};
	await db.insert(pendingGenerationsTable).values(pendingGeneration).onConflictDoNothing();
	console.info(`Pending generation record was created; Timetstamp: ${now}; user: ${user.id}`);
	return json({ success: true });
};
