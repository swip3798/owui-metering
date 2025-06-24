import { sql } from 'drizzle-orm';
import { db } from './db';

export const getModelCostForUser = async (userId: string, from: Date, to: Date) => {
  const data = await db.all<{
    model: string;
    cost: number;
    input_token: number;
    output_token: number;
  }>(
    sql<{
      date: string;
      cost: number;
      input_token: number;
      output_token: number;
    }>`SELECT model, SUM(cost) AS cost, SUM(prompt_token) AS input_token, SUM(completion_token) AS output_token FROM activities WHERE timestamp BETWEEN ${from.getTime() / 1000} AND ${to.getTime() / 1000} AND user_id = ${userId} GROUP BY model;`
  );

  return data;
};
