import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import UserDashboard from "../pages/UserDashboard";
import { ProtectedRoute } from "./ProtectedRoutes";
import AdminDashboard from "../pages/AdminDashboard";
import { AuthProvider } from "../services/AuthContext";

// Doesn't matter what page we throw in the / path, protected routes throw them back to their page based on their role.
const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/" element={ <ProtectedRoute><UserDashboard /></ProtectedRoute> } />
                <Route path="/user" element={ <ProtectedRoute><UserDashboard /></ProtectedRoute> } />
                <Route path="/login" element={ <Login /> } />
                <Route path="/admin" element={ <ProtectedRoute><AdminDashboard /></ProtectedRoute> } />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;