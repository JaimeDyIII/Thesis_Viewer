import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import UserDashboard from "../pages/UserDashboard";
import { ProtectedRoute } from "./ProtectedRoutes";

const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <ProtectedRoute><UserDashboard /></ProtectedRoute> } />
            <Route path="/login" element={ <Login /> } />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;