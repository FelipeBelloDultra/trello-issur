CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"routing_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
