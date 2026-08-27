import { AppError } from "../utils/app-error.js";

const cache = new Map();
const baseUrl = () => process.env.LOCATION_SERVICE_URL;
async function request(path, { required = false } = {}) {
  if (!baseUrl()) { if (required) throw new AppError("Location service configuration is unavailable", 503); return null; }
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${baseUrl()}${path}`, { signal: controller.signal });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new AppError(body.message || "Invalid location selection", response.status === 404 ? 400 : response.status);
    return body;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (required) throw new AppError("Location service temporarily unavailable", 503);
    return null;
  } finally { clearTimeout(timeout); }
}
export async function validateLocation(districtId, areaId) { return request(`/api/locations/validate?districtId=${districtId}&areaId=${areaId}`, { required: true }); }
export async function resolveArea(areaId) {
  if (!areaId) return null;
  const cached = cache.get(areaId); if (cached && cached.expires > Date.now()) return cached.value;
  const body = await request(`/api/locations/areas/${areaId}`); const value = body?.area ?? null;
  if (value) cache.set(areaId, { value, expires: Date.now() + 300000 }); return value;
}
export async function enrichReports(reports) {
  const ids = [...new Set(reports.map((report) => report.areaId).filter(Boolean))];
  const entries = await Promise.all(ids.map(async (id) => [id, await resolveArea(id)])); const areas = new Map(entries);
  return reports.map((report) => ({ ...report, location: areas.get(report.areaId) ? { district: areas.get(report.areaId).district, area: { id: areas.get(report.areaId).id, name: areas.get(report.areaId).name, postalCode: areas.get(report.areaId).postalCode } } : null }));
}
