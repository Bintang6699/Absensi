import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        if (allowedRoles?.includes('admin')) {
            return <Navigate to="/login/admin" replace />;
        }
        if (allowedRoles?.includes('student')) {
            return <Navigate to="/login/student" replace />;
        }
        return <Navigate to="/" replace />;
    }

    // Check if user is banned
    if (user.isBanned) {
        return <Navigate to="/banned" replace />;
    }

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
        // Redirect to appropriate dashboard based on role normalization
        const role = user.role?.toLowerCase();
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'student') return <Navigate to="/student" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
