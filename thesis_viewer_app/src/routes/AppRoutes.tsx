import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AuthProvider } from "../context/AuthContext";
import { PermissionsProvider } from '../context/PermissionsContext';
import { ViewProvider } from '../context/ViewContext';
import { BookmarkProvider } from '../context/BookmarkContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import Login from '../pages/auth/Login';
import Dashboard from "../pages/global/Dashboard";
import NoPage from '../pages/global/NoPage';
import ViewThesis from "../pages/thesis-repository/ViewThesis";
import Bookmarks from "../pages/thesis-repository/Bookmarks";
import ManageThesis from '../pages/thesis-repository/ManageThesis';
import UserManagement from '../pages/admin/UserManagement';
import ThessaAI from '../pages/global/ThessaAI';
import PDFViewerWrapper from '../pages/thesis-repository/PDFViewerWrapper';
import Analytics from '../pages/admin/Analytics';
import HomePage from '../pages/global/HomePage';
import { PublicRoute } from './PubilcRoute';
import PrivacyPolicy from '../components/Global/privacypolicy';
import Terms from '../pages/auth/Terms';

const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <PermissionsProvider>
                <ViewProvider>
                    <BookmarkProvider>
                        <AnalyticsProvider>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={ <PublicRoute redirectIfAuthenticated><HomePage /></PublicRoute> } />
                                <Route path="/login" element={ <PublicRoute redirectIfAuthenticated = {true}><Login /></PublicRoute> } />
                                <Route path="/home" element={ <PublicRoute><HomePage /></PublicRoute> } />
                                <Route path="/*" element={ <PublicRoute><NoPage /></PublicRoute> } />
                                <Route path="/Global/privacypolicy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<Terms />} />


                                {/* Protected Routes - General Access */}
                                <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}><Dashboard /></ProtectedRoute> } />
                                <Route path="/thessaAI" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}><ThessaAI /></ProtectedRoute> } />


                                {/* Protected Routes - Thesis Repository */}         
                                <Route path="/view-thesis" element={ 
                                    <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']} 
                                                    requiredPermissions={['ThesisRepository_view']}>
                                        <ViewThesis />
                                    </ProtectedRoute> } />
                                
                                <Route path="/bookmarks" element={ 
                                    <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']} 
                                                    requiredPermissions={['ThesisRepository_view']}>
                                        <Bookmarks />
                                    </ProtectedRoute> } />
                                
                                <Route path="/manage-thesis" element={ 
                                    <ProtectedRoute allowedRoles={['Librarian', 'Admin', 'SuperAdmin']} 
                                                    requiredPermissions={['ThesisRepository_add', 'ThesisRepository_edit', 'ThesisRepository_delete']}>
                                        <ManageThesis />
                                    </ProtectedRoute> } />

                                <Route path="/pdf-viewer/:title" element={
                                    <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']} requiredPermissions={['ThesisRepository_view']}>
                                        <PDFViewerWrapper />
                                    </ProtectedRoute>
                                } />

                                {/* Protected Routes - Admin Tools */}
                                <Route path="/user-management" element={ 
                                    <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} 
                                                    requiredPermissions={['UserManagement_view', 'UserManagement_add', 'UserManagement_edit', 'UserManagement_delete']}>
                                        <UserManagement />
                                    </ProtectedRoute> } />
                                
                                <Route path="/analytics" element={
                                    <ProtectedRoute allowedRoles={['Librarian', 'Admin', 'SuperAdmin']}>
                                        <Analytics />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </AnalyticsProvider>
                    </BookmarkProvider>
                </ViewProvider>
            </PermissionsProvider>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;
