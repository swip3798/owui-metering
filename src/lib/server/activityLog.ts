import { db } from './db';
import { activityTable, usersTable } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ConfigColumns } from 'datatables.net-dt';

type Activity = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  activity: {
    id: string;
    timestamp: number;
    user_id: string;
    model: string;
    prompt_token: number;
    completion_token: number;
    reasoning_token: number | null;
    cost: number;
    cached_tokens: number | null;
  };
}[];

const makeTokenString = (activity: {
  id: string;
  timestamp: number;
  user_id: string;
  model: string;
  prompt_token: number;
  completion_token: number;
  reasoning_token: number | null;
  cost: number;
  cached_tokens: number | null;
}) => {
  if (!activity.reasoning_token) {
    return `${activity.prompt_token} -> ${activity.completion_token}`;
  } else {
    return `${activity.prompt_token} -> ${activity.reasoning_token} -> ${activity.completion_token}`;
  }
};

export async function getLatestActivity(
  limit: number = 5000,
  userId: string | null = null
): Promise<Activity> {
  const select = db
    .select({
      user: usersTable,
      activity: activityTable
    })
    .from(activityTable)
    .leftJoin(usersTable, eq(activityTable.user_id, usersTable.id))
    .orderBy(desc(activityTable.timestamp))
    .limit(limit);
  if (userId !== null) {
    return await select.where(eq(usersTable.id, userId));
  } else {
    return await select;
  }
}

export function buildActivityTableData(activity: Activity): {
  columns: ConfigColumns[];
  rows: (string | Date | number)[][];
} {
  const columns = [
    { title: 'Timestamp' },
    { title: 'Model' },
    { title: 'Tokens' },
    { title: 'User' },
    { title: 'Cost' }
  ];
  let rows = activity.map((activity) => {
    return [
      new Date(activity.activity.timestamp * 1000),
      activity.activity.model,
      makeTokenString(activity.activity),
      activity.user?.id + '|' + activity.user?.name,
      activity.activity.cost
    ];
  });
  return { columns, rows };
}
