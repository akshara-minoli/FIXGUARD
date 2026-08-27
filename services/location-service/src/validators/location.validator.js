import { z } from "zod";

const id = z.coerce.number().int().positive();
const coordinate = (min, max) => z.number().min(min).max(max).nullable().optional();
const active = z.boolean().optional();
export const idSchema = z.object({ id });
export const districtIdSchema = z.object({ districtId: id });
export const publicZoneQuerySchema = z.object({ districtId: id.optional(), areaId: id.optional() });
export const adminListSchema = z.object({ districtId: id.optional(), isActive: z.enum(["true", "false"]).transform((value) => value === "true").optional() });
export const createDistrictSchema = z.object({ name: z.string().trim().min(2).max(100), code: z.string().trim().min(2).max(10).regex(/^[A-Za-z0-9-]+$/).transform((value) => value.toUpperCase()), isActive: active }).strict();
export const updateDistrictSchema = createDistrictSchema.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
const areaFields = z.object({ districtId: id, name: z.string().trim().min(2).max(120), postalCode: z.string().trim().regex(/^\d{3,10}$/, "Postal code must contain 3 to 10 digits").nullable().optional(), latitude: coordinate(-90, 90), longitude: coordinate(-180, 180), isActive: active }).strict();
export const createAreaSchema = areaFields.refine((value) => (value.latitude == null) === (value.longitude == null), { message: "Latitude and longitude must be provided together", path: ["latitude"] });
export const updateAreaSchema = areaFields.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field").refine((value) => !(Object.hasOwn(value, "latitude") !== Object.hasOwn(value, "longitude")), { message: "Update latitude and longitude together", path: ["latitude"] });
export const createZoneSchema = z.object({ name: z.string().trim().min(2).max(140), districtId: id, areaId: id.nullable().optional(), description: z.string().trim().max(2000).nullable().optional(), isActive: active }).strict();
export const updateZoneSchema = createZoneSchema.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
