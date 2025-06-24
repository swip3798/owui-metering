import 'dotenv/config';
import { getTimeBoundariesForMonth } from '$lib/server/activityReport';
import { getModelCostForUser } from '$lib/server/activityUser';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { spawn } from 'node:child_process';
async function spawnBuffered(
  command: string,
  args: string[] = []
): Promise<{ stdout: Buffer; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'] // stdin: ignore, stdout/stderr: pipe
    });

    const chunks: Buffer[] = []; // Collect binary chunks
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (data: Buffer) => (stderr += data.toString()));

    child.on('error', reject);
    child.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}\n${stderr}`));
      } else {
        resolve({
          stdout: Buffer.concat(chunks), // Combine chunks into a single Buffer
          stderr
        });
      }
    });
  });
}
const MINIMUM_CHARGE_FEE = parseFloat(process.env.MINIMUM_CHARGE_FEE ?? '0');

export const POST: RequestHandler = async ({ request }) => {
  let { userId, year, month } = await request.json();
  const data = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = data[0] ?? null;
  if (user === null) {
    return json({ success: false, message: 'User not found' }, { status: 404 });
  }
  if (!userId || [year, month].includes(NaN)) {
    return json(
      { success: false, message: 'UserId, year or month is missing or wrong' },
      { status: 400 }
    );
  }

  const { start, end } = getTimeBoundariesForMonth(year, month);
  const modelCosts = await getModelCostForUser(userId, start, end);

  const lines = modelCosts.reduce(
    (array, line) => array.concat([line.model, line.input_token, line.output_token, line.cost]),
    <any[]>[]
  );
  const billableCost = (
    modelCosts.reduce((totalCost, modelCost) => totalCost + modelCost.cost, 0) + MINIMUM_CHARGE_FEE
  ).toFixed(2);
  const footer =
    'Please pay the costs quickly. I appreciate it very much! The additional total cost due comes from running the chat service.';
  const { stdout } = await spawnBuffered('typst', [
    'compile',
    '--input',
    `userid=${userId}`,
    '--input',
    `username=${user.name}`,
    '--input',
    `email=${user.email}`,
    '--input',
    `month=${month}`,
    '--input',
    `year=${year}`,
    '--input',
    `tablecontent=${JSON.stringify(lines)}`,
    '--input',
    `total_amount=${billableCost}`,
    '--input',
    `footer=${footer}`,
    '--format',
    'pdf',
    'scripts/invoice.typ',
    '-'
  ]);

  return new Response(stdout, { headers: { 'Content-Type': 'application/pdf' } });
};
