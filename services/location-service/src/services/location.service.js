import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const districtSelect = { id: true, name: true, code: true, isActive: true };
const areaInclude = { district: { select: districtSelect } };
const zoneInclude = { district: { select: districtSelect }, area: { select: { id: true, name: true, isActive: true } } };

export function activeDistricts() { return prisma.district.findMany({ where: { isActive: true }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }); }
export async function activeAreas(districtId) {
  const district = await prisma.district.findUnique({ where: { id: districtId } });
  if (!district) throw new AppError("District not found", 404);
  if (!district.isActive) throw new AppError("District is inactive", 404);
  return prisma.area.findMany({ where: { districtId, isActive: true }, select: { id: true, name: true, postalCode: true, latitude: true, longitude: true }, orderBy: { name: "asc" } });
}
export async function activeArea(id) { const area = await prisma.area.findFirst({ where: { id, isActive: true, district: { isActive: true } }, include: areaInclude }); if (!area) throw new AppError("Area not found or inactive", 404); return area; }
export function activeZones(filters) { return prisma.serviceZone.findMany({ where: { isActive: true, district: { isActive: true }, ...(filters.districtId ? { districtId: filters.districtId } : {}), ...(filters.areaId ? { areaId: filters.areaId } : {}) }, include: zoneInclude, orderBy: { name: "asc" } }); }
export async function activeZone(id) { const zone = await prisma.serviceZone.findFirst({ where: { id, isActive: true, district: { isActive: true } }, include: zoneInclude }); if (!zone) throw new AppError("Service zone not found or inactive", 404); return zone; }
export async function validateAreaSelection(districtId, areaId) { const area = await prisma.area.findFirst({ where: { id: areaId, districtId, isActive: true, district: { isActive: true } }, include: areaInclude }); if (!area) throw new AppError("District and area selection is invalid or inactive", 404); return area; }

export function listDistricts(filters) { return prisma.district.findMany({ where: filters, orderBy: { name: "asc" } }); }
export function createDistrict(data) { return prisma.district.create({ data }); }
export function updateDistrict(id, data) { return prisma.district.update({ where: { id }, data }); }
export function listAreas(filters) { return prisma.area.findMany({ where: filters, include: areaInclude, orderBy: [{ district: { name: "asc" } }, { name: "asc" }] }); }
export async function createArea(data) { await requireActiveDistrict(data.districtId); return prisma.area.create({ data, include: areaInclude }); }
export async function updateArea(id, data) { if (data.districtId) await requireActiveDistrict(data.districtId); return prisma.area.update({ where: { id }, data, include: areaInclude }); }
export function listZones(filters) { return prisma.serviceZone.findMany({ where: filters, include: zoneInclude, orderBy: { name: "asc" } }); }
export async function createZone(data) { await validateZoneParents(data); return prisma.serviceZone.create({ data, include: zoneInclude }); }
export async function updateZone(id, data) { const existing = await prisma.serviceZone.findUnique({ where: { id } }); if (!existing) throw new AppError("Service zone not found", 404); await validateZoneParents({ districtId: data.districtId ?? existing.districtId, areaId: Object.hasOwn(data, "areaId") ? data.areaId : existing.areaId }); return prisma.serviceZone.update({ where: { id }, data, include: zoneInclude }); }
async function requireActiveDistrict(id) { const district = await prisma.district.findUnique({ where: { id } }); if (!district || !district.isActive) throw new AppError("District not found or inactive", 400); }
async function validateZoneParents({ districtId, areaId }) { await requireActiveDistrict(districtId); if (areaId != null) { const area = await prisma.area.findFirst({ where: { id: areaId, districtId, isActive: true } }); if (!area) throw new AppError("Area must be active and belong to the selected district", 400); } }
