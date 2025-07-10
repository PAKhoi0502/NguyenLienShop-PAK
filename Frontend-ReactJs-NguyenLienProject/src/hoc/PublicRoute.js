import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PublicRoute = ({ component: Component, render, ...rest }) => {
   const token = localStorage.getItem('token');
   const roleId = localStorage.getItem('roleId');

   return (
      <Route
         {...rest}
         render={(props) => {
            if (token) {
               // ✅ Nếu đã đăng nhập → redirect về role tương ứng
               if (roleId === '1') return <Redirect to="/admin" />;
               if (roleId === '2') return <Redirect to="/profile" />;
               return <Redirect to="/" />;
            }

            return render ? render(props) : <Component {...props} />;
         }}
      />
   );
};

export default PublicRoute;
