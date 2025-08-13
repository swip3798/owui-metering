import { collectDefaultMetrics, register, Counter } from 'prom-client';
import type { RequestHandler } from './$types';
import { getMetricsForModels } from '$lib/server/metrics';

const AI_CALLS = new Counter({
  name: 'owui_metering_ai_calls',
  help: 'Total number of AI calls',
  labelNames: ['model']
});
const COST = new Counter({
  name: 'owui_metering_ai_cost',
  help: 'Total cost of AI calls',
  labelNames: ['model']
});

const INPUT_TOKEN = new Counter({
  name: 'owui_metering_input_token',
  help: 'Total prompt token',
  labelNames: ['model']
});

const OUTPUT_TOKEN = new Counter({
  name: 'owui_metering_output_token',
  help: 'Total completion token',
  labelNames: ['model']
});
collectDefaultMetrics({ prefix: 'owui_metering_' });

export const GET: RequestHandler = async () => {
  try {
    const modelMetrics = await getMetricsForModels();
    AI_CALLS.reset();
    COST.reset();
    INPUT_TOKEN.reset();
    OUTPUT_TOKEN.reset();
    for (const metric of modelMetrics) {
      AI_CALLS.inc({ model: metric.model }, metric.count);
      COST.inc({ model: metric.model }, metric.cost);
      INPUT_TOKEN.inc({ model: metric.model }, metric.input_token);
      OUTPUT_TOKEN.inc({ model: metric.model }, metric.output_token);
    }

    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: {
        'Content-Type': register.contentType
      }
    });
  } catch (error) {
    return new Response(`Error generating metrics: ${error}`, {
      status: 500
    });
  }
};
