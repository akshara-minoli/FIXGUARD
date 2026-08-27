import * as reports from "../services/report.service.js";
import { priorityUpdateSchema, reportFiltersSchema, reportIdSchema, reviewReportSchema, statusUpdateSchema } from "../validators/report.validator.js";
import { enrichReports } from "../services/location-client.service.js";

export async function list(request, response) { const filters = reportFiltersSchema.parse(request.query); response.json({ success: true, reports: await enrichReports(await reports.getAllReports(filters)) }); }
export async function detail(request, response) { const { id } = reportIdSchema.parse(request.params); const [report] = await enrichReports([await reports.getReportById(id)]); response.json({ success: true, report }); }
export async function review(request, response) { const { id } = reportIdSchema.parse(request.params); const input = reviewReportSchema.parse(request.body); response.json({ success: true, message: "Report review updated", report: await reports.updateReport(id, input) }); }
export async function status(request, response) { const { id } = reportIdSchema.parse(request.params); const input = statusUpdateSchema.parse(request.body); response.json({ success: true, message: "Report status updated", report: await reports.updateReport(id, input) }); }
export async function priority(request, response) { const { id } = reportIdSchema.parse(request.params); const input = priorityUpdateSchema.parse(request.body); response.json({ success: true, message: "Report priority updated", report: await reports.updateReport(id, input) }); }
export async function summary(_request, response) { response.json({ success: true, summary: await reports.getAdminSummary() }); }
