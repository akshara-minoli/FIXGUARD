ALTER TABLE "reports" ADD COLUMN "district_id" INTEGER, ADD COLUMN "area_id" INTEGER, ADD COLUMN "service_zone_id" INTEGER;
ALTER TABLE "reports" ALTER COLUMN "latitude" DROP NOT NULL, ALTER COLUMN "longitude" DROP NOT NULL;
CREATE INDEX "reports_district_id_area_id_idx" ON "reports"("district_id", "area_id");
