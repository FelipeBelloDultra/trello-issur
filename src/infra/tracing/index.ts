import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_INSTANCE_ID, ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { env } from "@/config/env";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "trello-issur",
  [ATTR_SERVICE_INSTANCE_ID]: env.INSTANCE_ID,
});

const spanProcessors = env.OTEL_ENDPOINT
  ? [new BatchSpanProcessor(new OTLPTraceExporter({ url: env.OTEL_ENDPOINT }))]
  : [];

const provider = new NodeTracerProvider({ resource, spanProcessors });

provider.register();

export const tracer = provider.getTracer("trello-issur");

export async function shutdownTracing(): Promise<void> {
  await provider.shutdown();
}
