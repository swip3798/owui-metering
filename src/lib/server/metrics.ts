import { sql } from 'drizzle-orm';
import { db } from './db';

export const getMetricsForModels = async () => {
  const data = await db.all<{
    model: string;
    count: number;
    cost: number;
    input_token: number;
    output_token: number;
  }>(
    sql<{
      model: string;
      count: number;
      cost: number;
      input_token: number;
      output_token: number;
    }>`SELECT model, count(id) AS count, SUM(cost) AS cost, SUM(prompt_token) AS input_token, SUM(completion_token) AS output_token FROM activities GROUP BY model;`
  );

  return data;
};
