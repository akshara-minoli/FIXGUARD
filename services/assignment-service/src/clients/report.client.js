import { serviceRequest } from "./http-client.js";
const base=()=>process.env.REPORT_SERVICE_URL;
export async function getAdminReport(reportId,token){const {report}=await serviceRequest(base(),`/api/admin/reports/${reportId}`,{token,dependency:"Report service"});return report;}
export async function getCitizenReport(reportId,token){const {report}=await serviceRequest(base(),`/api/reports/${reportId}`,{token,dependency:"Report service"});return report;}
export async function updateReportStatus(reportId,status,token){return serviceRequest(base(),`/api/admin/reports/${reportId}/status`,{token,method:"PATCH",body:{status},dependency:"Report service"});}
