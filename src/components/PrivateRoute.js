import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ requiredRole }) => {
    const { user, token } = useContext(AuthContext);
    const isAdmin = user && user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole === 'ROLE_ADMIN' && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute; 