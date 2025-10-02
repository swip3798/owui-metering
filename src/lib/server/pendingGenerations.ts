import { lt, asc, eq } from 'drizzle-orm';
import { db } from './db';
import { activityTable, pendingGenerationsTable } from './db/schema';
import { getGeneration } from './provider/generation';

export const getActivePendingGenerations = async () => {
  let now = new Date().getTime() / 1000;
  return await db
    .select({ pendingGenerations: pendingGenerationsTable })
    .from(pendingGenerationsTable)
    .where(lt(pendingGenerationsTable.timestamp, now - 900))
    .limit(50)
    .orderBy(asc(pendingGenerationsTable.timestamp));
};

export const insertActivityFromGenerations = async (
  pendingGenerations: {
    pendingGenerations: {
      id: string;
      user_id: string;
      timestamp: number;
    };
  }[]
) => {
  for (const pendGen of pendingGenerations) {
    let generation = await getGeneration(pendGen.pendingGenerations.id);

    const activity: typeof activityTable.$inferInsert = {
      id: generation.id,
      user_id: pendGen.pendingGenerations.user_id,
      prompt_token: generation.tokens_prompt ?? generation.native_tokens_prompt ?? 0,
      completion_token: generation.tokens_completion ?? generation.native_tokens_completion ?? 0,
      reason: generation.finish_reason ?? 'stop',
      model: generation.model,
      provider: generation.provider_name ?? null,
      reasoning_token: generation.native_tokens_reasoning ?? null,
      timestamp: pendGen.pendingGenerations.timestamp,
      cost: generation.total_cost
    };

    await db.insert(activityTable).values(activity).onConflictDoNothing();
    await db
      .delete(pendingGenerationsTable)
      .where(eq(pendingGenerationsTable.id, pendGen.pendingGenerations.id));
  }
};
