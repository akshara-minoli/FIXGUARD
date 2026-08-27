import * as teams from "../services/team.service.js"; import { createTeamSchema,numericIdSchema,teamFiltersSchema,updateTeamSchema } from "../validators/assignment.validator.js";
export async function list(request,response){response.json({success:true,teams:await teams.listTeams(teamFiltersSchema.parse(request.query))});}
export async function detail(request,response){const {id}=numericIdSchema.parse(request.params);response.json({success:true,team:await teams.getTeam(id)});}
export async function create(request,response){response.status(201).json({success:true,team:await teams.createTeam(createTeamSchema.parse(request.body))});}
export async function update(request,response){const {id}=numericIdSchema.parse(request.params);response.json({success:true,team:await teams.updateTeam(id,updateTeamSchema.parse(request.body))});}
