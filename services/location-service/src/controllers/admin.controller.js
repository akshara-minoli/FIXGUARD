import * as locations from "../services/location.service.js";
import { adminListSchema, createAreaSchema, createDistrictSchema, createZoneSchema, idSchema, updateAreaSchema, updateDistrictSchema, updateZoneSchema } from "../validators/location.validator.js";
export async function listDistricts(request, response) { const filters = adminListSchema.parse(request.query); delete filters.districtId; response.json({ success: true, districts: await locations.listDistricts(filters) }); }
export async function createDistrict(request, response) { const data = createDistrictSchema.parse(request.body); response.status(201).json({ success: true, district: await locations.createDistrict(data) }); }
export async function updateDistrict(request, response) { const { id } = idSchema.parse(request.params); const data = updateDistrictSchema.parse(request.body); response.json({ success: true, district: await locations.updateDistrict(id, data) }); }
export async function listAreas(request, response) { const filters = adminListSchema.parse(request.query); response.json({ success: true, areas: await locations.listAreas(filters) }); }
export async function createArea(request, response) { response.status(201).json({ success: true, area: await locations.createArea(createAreaSchema.parse(request.body)) }); }
export async function updateArea(request, response) { const { id } = idSchema.parse(request.params); response.json({ success: true, area: await locations.updateArea(id, updateAreaSchema.parse(request.body)) }); }
export async function listZones(request, response) { const filters = adminListSchema.parse(request.query); response.json({ success: true, serviceZones: await locations.listZones(filters) }); }
export async function createZone(request, response) { response.status(201).json({ success: true, serviceZone: await locations.createZone(createZoneSchema.parse(request.body)) }); }
export async function updateZone(request, response) { const { id } = idSchema.parse(request.params); response.json({ success: true, serviceZone: await locations.updateZone(id, updateZoneSchema.parse(request.body)) }); }
