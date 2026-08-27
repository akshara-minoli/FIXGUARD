import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminReportDetailsPage from "./pages/AdminReportDetailsPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminLocationsPage from "./pages/AdminLocationsPage.jsx";
import AdminAssignmentsPage from "./pages/AdminAssignmentsPage.jsx";
import AdminTeamsPage from "./pages/AdminTeamsPage.jsx";
import CitizenDashboard from "./pages/CitizenDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyReportsPage from "./pages/MyReportsPage.jsx";
import NewReportPage from "./pages/NewReportPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReportDetailsPage from "./pages/ReportDetailsPage.jsx";

export default function App() { return <Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute roles={["CITIZEN"]}/> }><Route element={<AppLayout/>}><Route path="/citizen/dashboard" element={<CitizenDashboard/>}/><Route path="/citizen/profile" element={<ProfilePage/>}/><Route path="/citizen/reports/new" element={<NewReportPage/>}/><Route path="/citizen/reports" element={<MyReportsPage/>}/><Route path="/citizen/reports/:id" element={<ReportDetailsPage/>}/></Route></Route><Route element={<ProtectedRoute roles={["ADMIN"]}/> }><Route element={<AppLayout/>}><Route path="/admin/dashboard" element={<AdminDashboard/>}/><Route path="/admin/reports" element={<AdminReportsPage/>}/><Route path="/admin/reports/:id" element={<AdminReportDetailsPage/>}/><Route path="/admin/locations" element={<AdminLocationsPage/>}/><Route path="/admin/teams" element={<AdminTeamsPage/>}/><Route path="/admin/assignments" element={<AdminAssignmentsPage/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
