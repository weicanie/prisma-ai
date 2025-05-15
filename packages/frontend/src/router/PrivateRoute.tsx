import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
	children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	const isLogin = Boolean(localStorage.getItem('token'));
	const location = useLocation();
	if (!isLogin) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	return children;
};

export default PrivateRoute;
