import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useUser();
    const location = useLocation();

    return user ? children : <Navigate to="/login" state={{ from: location }} />;
};

export default ProtectedRoute;