import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, role, render, ...rest }) => {
   const token = localStorage.getItem('token');
   const roleId = localStorage.getItem('roleId');

   return (
      <Route
         {...rest}
         render={(props) => {
            if (!token) {
               return <Redirect to={`/login?redirect=${props.location.pathname}`} />;
            }

            if (role && roleId !== role) {
               return <Redirect to="/" />;
            }

            return render ? render(props) : <Component {...props} />;
         }}
      />
   );
};

export default PrivateRoute;
