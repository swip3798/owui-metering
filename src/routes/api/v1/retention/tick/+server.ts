import { db } from '$lib/server/db';
import { activityTable } from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import 'dotenv/config';
import { lt } from 'drizzle-orm';
import ms from 'ms';

const retentionDuration: number | null = process.env.ACTIVITY_RETENTION
	? (() => {
			try {
				return ms(<ms.StringValue>process.env.ACTIVITY_RETENTION);
			} catch {
				return null;
			}
		})()
	: null;

export const POST: RequestHandler = async ({}) => {
	if (retentionDuration !== null) {
		const retentionTimestamp = Math.floor((new Date().getTime() - retentionDuration) / 1000);
		await db.delete(activityTable).where(lt(activityTable.timestamp, retentionTimestamp));
	}
	return json({ success: true }, { status: 200 });
};
