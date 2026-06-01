CREATE TABLE "failed_queue_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"queue" text NOT NULL,
	"exchange" text NOT NULL,
	"routing_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"first_failed_at" timestamp NOT NULL,
	"dead_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
