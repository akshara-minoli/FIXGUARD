CREATE TYPE "NotificationType" AS ENUM ('REPORT_SUBMITTED','REPORT_UNDER_REVIEW','REPORT_VERIFIED','REPORT_REJECTED','REPORT_PRIORITY_CHANGED','TEAM_ASSIGNED','WORK_STARTED','WORK_COMPLETED','REPORT_RESOLVED','GENERAL');
CREATE TABLE "notifications" ("id" UUID NOT NULL,"user_id" UUID NOT NULL,"type" "NotificationType" NOT NULL,"title" VARCHAR(160) NOT NULL,"message" VARCHAR(1000) NOT NULL,"report_id" UUID,"assignment_id" UUID,"event_key" VARCHAR(255) NOT NULL,"metadata" JSONB,"is_read" BOOLEAN NOT NULL DEFAULT false,"created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,"read_at" TIMESTAMPTZ(6),CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "notifications_event_key_key" ON "notifications"("event_key");
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id","is_read","created_at");
CREATE INDEX "notifications_report_id_idx" ON "notifications"("report_id");
CREATE INDEX "notifications_assignment_id_idx" ON "notifications"("assignment_id");
