import { serviceRequest } from "./http-client.js";
const base=()=>process.env.LOCATION_SERVICE_URL;
export async function getServiceZone(id){const {serviceZone}=await serviceRequest(base(),`/api/locations/service-zones/${id}`,{dependency:"Location service"});return serviceZone;}
