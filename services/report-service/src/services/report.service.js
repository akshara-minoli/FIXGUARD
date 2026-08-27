import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export function createReport(citizenId, data) { return prisma.report.create({ data: { ...data, citizenId } }); }
export function getCitizenReports(citizenId, filters) { return prisma.report.findMany({ where: { citizenId, ...filters }, orderBy: { createdAt: "desc" } }); }
export async function getCitizenReport(citizenId, id) { const report = await prisma.report.findFirst({ where: { id, citizenId } }); if (!report) throw new AppError("Report not found", 404); return report; }
export async function getCitizenSummary(citizenId) {
  const [total, active, inProgress, resolved, recent] = await Promise.all([
    prisma.report.count({ where: { citizenId } }),
    prisma.report.count({ where: { citizenId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.report.count({ where: { citizenId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.report.count({ where: { citizenId, status: "RESOLVED" } }),
    prisma.report.findMany({ where: { citizenId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return { summary: { total, active, inProgress, resolved }, recent };
}
export function getAllReports(filters) { return prisma.report.findMany({ where: filters, orderBy: { createdAt: "desc" }, take: 200 }); }
export async function getReportById(id) { const report = await prisma.report.findUnique({ where: { id } }); if (!report) throw new AppError("Report not found", 404); return report; }
export function updateReport(id, data) { return prisma.report.update({ where: { id }, data }); }
export async function getAdminSummary() {
  const [total, submitted, underReview, inProgress, resolved] = await Promise.all([
    prisma.report.count(), prisma.report.count({ where: { status: "SUBMITTED" } }), prisma.report.count({ where: { status: "UNDER_REVIEW" } }), prisma.report.count({ where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }), prisma.report.count({ where: { status: "RESOLVED" } }),
  ]);
  return { total, submitted, underReview, inProgress, resolved };
}
