npx pbjs -p opentelemetry-proto -t static-module -w es6 -o src/lib/proto/traces.js opentelemetry-proto/opentelemetry/proto/trace/v1/trace.proto
npx pbts -o src/lib/proto/traces.d.ts src/lib/proto/traces.js
