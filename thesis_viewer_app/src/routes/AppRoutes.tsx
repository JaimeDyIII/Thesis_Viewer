import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import UserDashboard from "../pages/UserDashboard";
import { ProtectedRoute } from "./ProtectedRoutes";
import AdminDashboard from "../pages/AdminDashboard";
import Unauthorized from "../pages/Unauthorized";
import ViewThesis from "../pages/ViewThesis";
import ManageThesis from "../pages/ManageThesis";
import { AuthProvider } from "../services/AuthContext";

// Doesn't matter what page we throw in the / path, protected routes throw them back to their page based on their role.
const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/user" element={ <ProtectedRoute allowedRoles={['User']}><UserDashboard /></ProtectedRoute> } />
                <Route path="/admin" element={ <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute> } />
                <Route path="/view-thesis" element={ <ProtectedRoute allowedRoles={['User', 'Admin']}><ViewThesis /></ProtectedRoute> } />
                <Route path="/manage-thesis" element={ <ProtectedRoute allowedRoles={['Admin']}><ManageThesis /></ProtectedRoute> } />
                <Route path="/login" element={ <Login /> } />
                <Route path="/*" element={ <Unauthorized /> } />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;