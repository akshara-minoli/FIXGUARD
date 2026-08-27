CREATE TYPE "ReportCategory" AS ENUM ('POTHOLE', 'STREETLIGHT', 'WATER_LEAK', 'GARBAGE', 'DRAINAGE', 'TRAFFIC_SIGNAL', 'FALLEN_TREE', 'ROAD_DAMAGE', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
CREATE TYPE "ReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "reports" (
  "id" UUID NOT NULL,
  "citizen_id" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "description" TEXT NOT NULL,
  "category" "ReportCategory" NOT NULL,
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "image_url" VARCHAR(2048),
  "admin_note" TEXT,
  "priority" "ReportPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "ReportStatus" NOT NULL DEFAULT 'SUBMITTED',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_citizen_id_created_at_idx" ON "reports"("citizen_id", "created_at");
CREATE INDEX "reports_status_category_idx" ON "reports"("status", "category");
