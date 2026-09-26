ALTER TABLE "creator_profiles" ADD COLUMN "linkedin_url" TEXT,
ADD COLUMN "linkedin_name" TEXT,
ADD COLUMN "followers_verified_at" TIMESTAMPTZ(3);

CREATE UNIQUE INDEX "creator_profiles_linkedin_url_key" ON "creator_profiles"("linkedin_url");
