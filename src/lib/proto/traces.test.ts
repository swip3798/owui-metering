import { expect, test } from 'vitest';
import { opentelemetry } from './traces';
import obj from './openrouter-example-trace.json';

test('Json parsing of proto', () => {
  const message = opentelemetry.proto.trace.v1.TracesData.fromObject(obj);
  expect(message?.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.spanId).toBeDefined();
  expect(message?.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.spanId).toBeTruthy();
  expect(message?.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.traceId).toBeDefined();
  expect(message?.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.traceId).toBeTruthy();
});
