import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import UserDashboard from "../pages/UserDashboard";

/* 
use props to check for user role
interface user {
   role: String;
}

Use the protected routes to block access other pages before logging in
Block login after logging in 
*/

const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <UserDashboard /> } />
            <Route path="/login" element={ <Login /> } />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;