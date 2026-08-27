import prisma from "../config/prisma.js"; import { getServiceZone } from "../clients/location.client.js"; import { AppError } from "../utils/app-error.js";
export function listTeams(filters){return prisma.maintenanceTeam.findMany({where:filters,orderBy:{name:"asc"}});}
export async function getTeam(id){const team=await prisma.maintenanceTeam.findUnique({where:{id}});if(!team)throw new AppError("Maintenance team not found",404);return team;}
export async function createTeam(data){await getServiceZone(data.serviceZoneId);return prisma.maintenanceTeam.create({data});}
export async function updateTeam(id,data){await getTeam(id);if(data.serviceZoneId)await getServiceZone(data.serviceZoneId);return prisma.maintenanceTeam.update({where:{id},data});}
