-- CreateEnum
CREATE TYPE "Role" AS ENUM ('brand', 'creator');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('requested', 'accepted', 'submitted', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "VerifiedVia" AS ENUM ('brand', 'click', 'timeout');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('declined', 'expired');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('topup', 'hold', 'release', 'payout', 'refund');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "user_id" UUID NOT NULL,
    "niche" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "price_cents" INTEGER,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "user_id" UUID NOT NULL,
    "available_cents" INTEGER NOT NULL DEFAULT 0,
    "held_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "booking_id" UUID,
    "type" "TransactionType" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "brief" TEXT NOT NULL,
    "destination_url" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'requested',
    "deadline" TIMESTAMPTZ(3) NOT NULL,
    "post_url" TEXT,
    "tracking_code" TEXT NOT NULL,
    "verified_via" "VerifiedVia",
    "refund_reason" "RefundReason",
    "submit_ip_hash" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ(3),
    "submitted_at" TIMESTAMPTZ(3),
    "closed_at" TIMESTAMPTZ(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "clicked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "transactions_user_id_created_at_idx" ON "transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_booking_id_idx" ON "transactions"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tracking_code_key" ON "bookings"("tracking_code");

-- CreateIndex
CREATE INDEX "bookings_status_deadline_idx" ON "bookings"("status", "deadline");

-- CreateIndex
CREATE INDEX "bookings_status_submitted_at_idx" ON "bookings"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "bookings_brand_id_idx" ON "bookings"("brand_id");

-- CreateIndex
CREATE INDEX "bookings_creator_id_idx" ON "bookings"("creator_id");

-- CreateIndex
CREATE INDEX "clicks_booking_id_clicked_at_idx" ON "clicks"("booking_id", "clicked_at");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invariants Prisma's schema language cannot express. These are the last line
-- of defence if application code ever has a bug.

ALTER TABLE "wallets"
  ADD CONSTRAINT "wallets_available_non_negative" CHECK ("available_cents" >= 0),
  ADD CONSTRAINT "wallets_held_non_negative" CHECK ("held_cents" >= 0);

ALTER TABLE "creator_profiles"
  ADD CONSTRAINT "creator_profiles_price_positive" CHECK ("price_cents" IS NULL OR "price_cents" > 0),
  ADD CONSTRAINT "creator_profiles_followers_non_negative" CHECK ("followers" >= 0);

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_amount_positive" CHECK ("amount_cents" > 0);

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_price_positive" CHECK ("price_cents" > 0),
  ADD CONSTRAINT "bookings_not_self" CHECK ("brand_id" <> "creator_id"),
  ADD CONSTRAINT "bookings_paid_has_verification" CHECK (("status" = 'paid') = ("verified_via" IS NOT NULL)),
  ADD CONSTRAINT "bookings_refunded_has_reason" CHECK (("status" = 'refunded') = ("refund_reason" IS NOT NULL)),
  ADD CONSTRAINT "bookings_submitted_has_post" CHECK ("status" NOT IN ('submitted', 'paid') OR "post_url" IS NOT NULL);

CREATE FUNCTION "transactions_append_only"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'transactions is append-only: % is not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "transactions_no_update_or_delete"
  BEFORE UPDATE OR DELETE ON "transactions"
  FOR EACH ROW EXECUTE FUNCTION "transactions_append_only"();
