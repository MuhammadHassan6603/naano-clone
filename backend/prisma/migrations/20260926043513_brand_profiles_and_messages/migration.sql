CREATE TABLE "brand_profiles" (
    "user_id" UUID NOT NULL,
    "niches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audience" TEXT NOT NULL DEFAULT '',
    "budget_cents" INTEGER,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_reads" (
    "booking_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("booking_id","user_id")
);

CREATE INDEX "messages_booking_id_created_at_idx" ON "messages"("booking_id", "created_at");

ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_budget_positive" CHECK ("budget_cents" IS NULL OR "budget_cents" > 0);
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_audience_length" CHECK (char_length("audience") <= 200);
ALTER TABLE "messages" ADD CONSTRAINT "messages_body_length" CHECK (char_length("body") BETWEEN 1 AND 2000);
