import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  getActivePendingGenerations,
  insertActivityFromGenerations
} from '$lib/server/pendingGenerations';

export const POST: RequestHandler = async ({ }) => {
  const generations = await getActivePendingGenerations();
  await insertActivityFromGenerations(generations);
  return json({ success: true });
};
