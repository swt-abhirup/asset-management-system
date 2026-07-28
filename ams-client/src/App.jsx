import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";

import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Employees      from "./pages/Employees";
import Assets         from "./pages/Assets";
import Assignments    from "./pages/Assignments";
import Maintenance    from "./pages/Maintenance";
import Categories     from "./pages/Categories";
import RepairRequests from "./pages/RepairRequests";
import WarrantyExpiry from "./pages/WarrantyExpiry";
import Vendors        from "./pages/Vendors";
import Purchases      from "./pages/Purchases";
import Profile        from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster }         from "./components/Toast";
import { ConfirmHost }    from "./components/ConfirmDialog";

function App() {
    return (
        <BrowserRouter>
            <SidebarProvider>
                <Toaster />
                <ConfirmHost />
                <Routes>

                    <Route path="/" element={<Login />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />

                    <Route path="/employees" element={
                        <ProtectedRoute><Employees /></ProtectedRoute>
                    } />

                    <Route path="/assets" element={
                        <ProtectedRoute><Assets /></ProtectedRoute>
                    } />

                    <Route path="/assignments" element={
                        <ProtectedRoute><Assignments /></ProtectedRoute>
                    } />

                    <Route path="/maintenance" element={
                        <ProtectedRoute><Maintenance /></ProtectedRoute>
                    } />

                    <Route path="/repair-requests" element={
                        <ProtectedRoute><RepairRequests /></ProtectedRoute>
                    } />

                    <Route path="/warranty-expiry" element={
                        <ProtectedRoute><WarrantyExpiry /></ProtectedRoute>
                    } />

                    <Route path="/categories" element={
                        <ProtectedRoute><Categories /></ProtectedRoute>
                    } />

                    <Route path="/vendors" element={
                        <ProtectedRoute><Vendors /></ProtectedRoute>
                    } />

                    <Route path="/purchases" element={
                        <ProtectedRoute><Purchases /></ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />

                </Routes>
            </SidebarProvider>
        </BrowserRouter>
    );
}

export default App;
