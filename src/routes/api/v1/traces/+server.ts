import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { opentelemetry } from '$lib/proto/traces';
import { getUser } from '$lib/server/openwebui/getUser';
import { activityTable, usersTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

const uint8ArrayToBase64 = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));

function convertNanosToSecondsTimestamp(timestamp: Long | number | null | undefined): number {
  // Check if it's a Long object (from long.js or similar)
  if (timestamp && typeof timestamp === 'object' && timestamp.divide) {
    // Assuming Long has divide() method
    const secondsLong = timestamp.divide(1000000000);
    return secondsLong.toNumber();
  } else if (typeof timestamp === 'number') {
    return timestamp / 1000000;
  } else {
    new Date().getTime() / 1000;
  }

  // If it's a regular number (or numeric string)
  const numericValue = Number(timestamp);
  if (!isNaN(numericValue)) {
    return Math.floor(numericValue / 1000000000);
  }

  throw new Error('Invalid timestamp format: must be Long object or number');
}

function anyIntToNumber(anyInt: Long | number): number {
  if (typeof anyInt === 'object') {
    return anyInt.toNumber();
  } else {
    return anyInt;
  }
}

async function processMessage(message: opentelemetry.proto.trace.v1.TracesData): Promise<Response> {
  try {
    for (const resourceSpan of message.resourceSpans) {
      for (const scopeSpan of resourceSpan.scopeSpans ?? []) {
        if (scopeSpan?.scope?.name !== 'openrouter') {
          continue;
        }
        for (const span of scopeSpan.spans ?? []) {
          if (span.attributes) {
            const id =
              span.traceId && span.spanId
                ? uint8ArrayToBase64(span.traceId) + uint8ArrayToBase64(span.spanId)
                : crypto.randomUUID();
            const activity: typeof activityTable.$inferInsert = {
              id,
              timestamp: convertNanosToSecondsTimestamp(span.startTimeUnixNano),
              user_id: 'nouserid',
              model: '',
              prompt_token: 0,
              completion_token: 0,
              cost: 0.0,
              reasoning_token: null,
              cached_tokens: null,
              provider: null,
              reason: null,
              chat_id: null,
              source: 'otlp'
            };
            for (const attribute of span.attributes) {
              switch (attribute.key) {
                case 'gen_ai.response.model':
                  activity.model = attribute.value?.stringValue ?? 'invalidmodel';
                  break;
                case 'openrouter.user.id':
                  activity.user_id = attribute.value?.stringValue ?? 'nouserid';
                  break;
                case 'gen_ai.usage.input_tokens':
                  activity.prompt_token = anyIntToNumber(attribute.value?.intValue ?? 0);
                  break;
                case 'gen_ai.usage.output_tokens':
                  activity.completion_token = anyIntToNumber(attribute.value?.intValue ?? 0);
                  break;
                case 'gen_ai.usage.total_cost':
                  activity.cost = attribute.value?.doubleValue ?? 0;
                  break;
                case 'gen_ai.usage.output_tokens.reasoning':
                  activity.reasoning_token = attribute.value?.intValue
                    ? anyIntToNumber(attribute.value?.intValue)
                    : null;
                  break;
                case 'gen_ai.usage.input_tokens.cached':
                  activity.cached_tokens = attribute.value?.intValue
                    ? anyIntToNumber(attribute.value?.intValue)
                    : null;
                  break;
                case 'openrouter.finish_reason':
                  activity.reason = attribute.value?.stringValue ?? null;
                  break;
                case 'openrouter.provider.slug':
                  activity.provider = attribute.value?.stringValue ?? null;
                  break;
                case 'session.id':
                  activity.chat_id = attribute.value?.stringValue ?? null;
                  break;
              }
            }
            console.debug('OTLP Activity recorded: ', activity);
            const user: typeof usersTable.$inferInsert | null =
              activity.user_id != 'nouserid' ? await getUser(activity.user_id) : null;
            console.log(user);
            if (user) {
              await db
                .insert(usersTable)
                .values(user)
                .onConflictDoUpdate({ target: usersTable.id, set: user });
            }
            await db
              .insert(activityTable)
              .values(activity)
              .onConflictDoUpdate({ target: activityTable.id, set: activity });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing message', error);
    return json(
      { error: 'Internal server error', code: 'PARSE_ERROR' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return new Response(null, {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleJsonRequest(request: Request): Promise<Response> {
  try {
    const obj = await request.json();
    const message = opentelemetry.proto.trace.v1.TracesData.fromObject(obj);
    return await processMessage(message);
  } catch (error) {
    console.error('Error processing trace in json format', error);
    return json(
      { error: 'Failed to process trace', code: 'PARSE_ERROR' },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleProtoRequest(request: Request): Promise<Response> {
  try {
    const buffer = await request.arrayBuffer();
    const message = opentelemetry.proto.trace.v1.TracesData.decode(new Uint8Array(buffer));
    return await processMessage(message);
  } catch (error) {
    console.error('Error parsing trace in proto format', error);
    return json(
      { error: 'Failed to process trace', code: 'PARSE_ERROR' },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('Traces point triggered');
  const contentType = request.headers.get('content-type');

  // Accept both content types
  const isProtobuf = contentType?.includes('application/x-protobuf');
  const isJson = contentType?.includes('application/json');

  if (isProtobuf) {
    return await handleProtoRequest(request);
  } else if (isJson) {
    return await handleJsonRequest(request);
  } else {
    console.error('Unsupported content type');
    return json(
      {
        error: 'Unsupported content type',
        supported: ['application/json', 'application/x-protobuf']
      },
      { status: 415, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
