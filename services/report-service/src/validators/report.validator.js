import { z } from "zod";

export const categories = ["POTHOLE", "STREETLIGHT", "WATER_LEAK", "GARBAGE", "DRAINAGE", "TRAFFIC_SIGNAL", "FALLEN_TREE", "ROAD_DAMAGE", "OTHER"];
export const statuses = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
export const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const createReportSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(5000),
  category: z.enum(categories),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().trim().min(5).max(255),
  districtId: z.number().int().positive(),
  areaId: z.number().int().positive(),
  serviceZoneId: z.number().int().positive().optional(),
  imageUrl: z.string().trim().url().max(2048).optional(),
}).strict().refine((value) => (value.latitude == null) === (value.longitude == null), { message: "Latitude and longitude must be provided together", path: ["latitude"] });

export const reportIdSchema = z.object({ id: z.uuid("Report ID must be a valid UUID") });
export const reportFiltersSchema = z.object({ status: z.enum(statuses).optional(), category: z.enum(categories).optional() });
export const reviewReportSchema = z.object({ status: z.enum(statuses).optional(), priority: z.enum(priorities).optional(), adminNote: z.string().trim().max(5000).nullable().optional() }).refine((value) => Object.keys(value).length > 0, { message: "Provide at least one review field" }).strict();
export const statusUpdateSchema = z.object({ status: z.enum(statuses) }).strict();
export const priorityUpdateSchema = z.object({ priority: z.enum(priorities) }).strict();
