import * as locations from "../services/location.service.js";
import { districtIdSchema, idSchema, publicZoneQuerySchema } from "../validators/location.validator.js";
export async function districts(_request, response) { response.json({ success: true, districts: await locations.activeDistricts() }); }
export async function areas(request, response) { const { districtId } = districtIdSchema.parse(request.params); response.json({ success: true, areas: await locations.activeAreas(districtId) }); }
export async function area(request, response) { const { id } = idSchema.parse(request.params); response.json({ success: true, area: await locations.activeArea(id) }); }
export async function zones(request, response) { const filters = publicZoneQuerySchema.parse(request.query); response.json({ success: true, serviceZones: await locations.activeZones(filters) }); }
export async function zone(request, response) { const { id } = idSchema.parse(request.params); response.json({ success: true, serviceZone: await locations.activeZone(id) }); }
export async function validateSelection(request, response) { const { districtId, areaId } = request.query; const parsedDistrict = districtIdSchema.parse({ districtId }); const parsedArea = idSchema.parse({ id: areaId }); response.json({ success: true, valid: true, area: await locations.validateAreaSelection(parsedDistrict.districtId, parsedArea.id) }); }
