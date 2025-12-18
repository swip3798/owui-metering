import { and, gt, lt, sum } from 'drizzle-orm';
import { db } from './db';
import { activityTable } from './db/schema';

export const getProviderDistribution = async (from: Date, to: Date) => {
  return await db
    .select({
      provider: activityTable.provider,
      totalCost: sum(activityTable.cost),
      totalInput: sum(activityTable.prompt_token),
      totalReasoning: sum(activityTable.reasoning_token),
      totalOutput: sum(activityTable.completion_token)
    })
    .from(activityTable)
    .where(
      and(
        gt(activityTable.timestamp, from.getTime() / 1000),
        lt(activityTable.timestamp, to.getTime() / 1000)
      )
    )
    .groupBy(activityTable.provider);
};
