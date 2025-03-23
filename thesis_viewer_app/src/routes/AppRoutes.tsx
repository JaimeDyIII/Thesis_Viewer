import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AuthProvider } from "../context/AuthContext";
import { PermissionsProvider } from '../context/PermissionsContext';
import Login from '../pages/Login';
import Dashboard from "../pages/Dashboard";
import Unauthorized from "../pages/Unauthorized";
import ViewThesis from "../pages/ViewThesis";
import ThesisRepository from '../pages/ThesisRepository';
import ManageThesis from '../pages/ManageThesis';
import UserManagement from '../pages/UserManagement';
import JaimeGPT from '../pages/JaimeGPT';

// Doesn't matter what page we throw in the / path, protected routes throw them back to their page based on their role.
const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <PermissionsProvider>
                <Routes>
                <Route path="/" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}><Dashboard /></ProtectedRoute> } />
                <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}><Dashboard /></ProtectedRoute> } />
                    <Route path="/thesis-repository" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']} 
                                                                               requiredPermissions={['ThesisRepository_view', 
                                                                                                     'ThesisRepository_add',
                                                                                                     'ThesisRepository_edit', 
                                                                                                     'ThesisRepository_delete']}
                                                                            >
                                                                    <ThesisRepository />
                                                                </ProtectedRoute> }>
                    </Route>

                    <Route path="/view-thesis" element={ <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']} requiredPermissions={['ThesisRepository_view']}><ViewThesis /></ProtectedRoute> } />
                    <Route path="/manage-thesis" element={ <ProtectedRoute allowedRoles={['Librarian', 'Admin', 'SuperAdmin']} 
                                                                           requiredPermissions={['ThesisRepository_add',
                                                                                                 'ThesisRepository_edit', 
                                                                                                 'ThesisRepository_delete']}>
                                                                <ManageThesis />
                                                            </ProtectedRoute> }>
                    </Route>
                                        
                    <Route path="/user-management" element={ <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} 
                                    requiredPermissions={['UserManagement_view',
                                                          'UserManagement_add',
                                                          'UserManagement_edit', 
                                                          'UserManagement_delete']}>
                                                            <UserManagement />
                                                        </ProtectedRoute> }>
                    </Route>
                    
                    <Route path="/jaimeGPT" element={ 
                        <ProtectedRoute allowedRoles={['User', 'Librarian', 'Admin', 'SuperAdmin']}>
                            <JaimeGPT />
                        </ProtectedRoute> 
                    } />

                    <Route path="/login" element={ <Login /> } />
                    <Route path="/*" element={ <Unauthorized /> } />
                </Routes>
            </PermissionsProvider>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;