import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AuthProvider } from "../context/AuthContext";
import { PermissionsProvider } from '../context/PermissionsContext';
import UserDashboard from "../pages/UserDashboard";
import Login from '../pages/Login';
import AdminDashboard from "../pages/AdminDashboard";
import Unauthorized from "../pages/Unauthorized";
import ViewThesis from "../pages/ViewThesis";
import ThesisRepository from '../pages/ThesisRepository';
import ManageThesis from '../pages/ManageThesis';

// Doesn't matter what page we throw in the / path, protected routes throw them back to their page based on their role.
const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <PermissionsProvider>
                <Routes>
                    <Route path="/" element={ <ProtectedRoute allowedRoles={['User']}><UserDashboard /></ProtectedRoute> } />
                    <Route path="/user" element={ <ProtectedRoute allowedRoles={['User']}><UserDashboard /></ProtectedRoute> } />
                    <Route path="/admin" element={ <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute> } />
                    <Route path="/thesis-repository" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}><ThesisRepository /></ProtectedRoute> } />
                    <Route path="/manage-thesis" element={ <ProtectedRoute allowedRoles={['Librarian', 'Admin', 'SuperAdmin']}><ManageThesis /></ProtectedRoute> } />
                    <Route path="/view-thesis" element={ <ProtectedRoute allowedRoles={['User', 'Admin']}><ViewThesis /></ProtectedRoute> } />
                    <Route path="/login" element={ <Login /> } />
                    <Route path="/*" element={ <Unauthorized /> } />
                </Routes>
            </PermissionsProvider>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;