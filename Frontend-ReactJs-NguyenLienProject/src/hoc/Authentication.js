import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const userIsAuthenticated = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
        const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
        if (!isLoggedIn) {
            return <Navigate to="/login" replace />;
        }
        return <WrappedComponent {...props} />;
    };
    AuthenticatedComponent.displayName = `UserIsAuthenticated(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return AuthenticatedComponent;
};

const userIsNotAuthenticated = (WrappedComponent) => {
    const NotAuthenticatedComponent = (props) => {
        const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);
        if (isLoggedIn) {
            return <Navigate to="/" replace />;
        }
        return <WrappedComponent {...props} />;
    };
    NotAuthenticatedComponent.displayName = `UserIsNotAuthenticated(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return NotAuthenticatedComponent;
};

export { userIsAuthenticated, userIsNotAuthenticated };