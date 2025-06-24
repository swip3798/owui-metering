import { db } from './db';
import { activityTable, usersTable } from './db/schema';
import { and, min, eq, gt, lt, sum, max, sql } from 'drizzle-orm';

export const getTimeBoundariesForMonth = (year: number, month: number) => {
  const start = new Date();
  start.setUTCFullYear(year, month, 1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  month += 1;
  if (month > 11) {
    year += 1;
    month = 0;
  }
  end.setUTCFullYear(year, month, 1);
  end.setUTCHours(0, 0, 0, 0);
  return {
    start,
    end
  };
};

export const loadReportData = async (year: number, month: number) => {
  const { start, end } = getTimeBoundariesForMonth(year, month);
  return await getReportData(start, end);
};

export const getReportData = async (from: Date, to: Date) => {
  return await db
    .select({
      user: usersTable,
      totalCost: sum(activityTable.cost),
      totalInput: sum(activityTable.prompt_token),
      totalReasoning: sum(activityTable.reasoning_token),
      totalOutput: sum(activityTable.completion_token)
    })
    .from(activityTable)
    .leftJoin(usersTable, eq(activityTable.user_id, usersTable.id))
    .where(
      and(
        gt(activityTable.timestamp, from.getTime() / 1000),
        lt(activityTable.timestamp, to.getTime() / 1000)
      )
    )
    .groupBy(activityTable.user_id);
};

export const getTimeBoundaries = async () => {
  const firstActivityEntry = await db
    .select({
      value: min(activityTable.timestamp)
    })
    .from(activityTable);
  const lastActivityEntry = await db
    .select({
      value: max(activityTable.timestamp)
    })
    .from(activityTable);
  const firstActivity = new Date((firstActivityEntry[0].value ?? 0) * 1000);
  const lastActivity = new Date((lastActivityEntry[0].value ?? 0) * 1000);
  return { first: firstActivity, last: lastActivity };
};

export const getDailyCost = async (from: Date, to: Date) => {
  const data = await db.all<{
    date: string;
    cost: number;
    input_token: number;
    output_token: number;
  }>(
    sql<{
      date: string;
      cost: number;
      input_token: number;
      output_token: number;
    }>`SELECT strftime('%Y-%m-%d', datetime(timestamp, 'unixepoch')) AS date, SUM(cost) AS cost, SUM(prompt_token) AS input_token, SUM(completion_token) AS output_token FROM activities WHERE timestamp BETWEEN ${from.getTime() / 1000} AND ${to.getTime() / 1000} GROUP BY date ORDER BY date;`
  );

  return data;
};

export const getModelTokenStat = async (from: Date, to: Date, limit: number = 10) => {
  const data = await db.all<{ model: string; tokens: number }>(
    sql<{
      model: string;
      tokens: number;
    }>`SELECT model, SUM(prompt_token + completion_token) AS tokens FROM activities WHERE timestamp BETWEEN ${from.getTime() / 1000} AND ${to.getTime() / 1000} GROUP BY model ORDER BY tokens DESC LIMIT ${limit}`
  );
  return data;
};
