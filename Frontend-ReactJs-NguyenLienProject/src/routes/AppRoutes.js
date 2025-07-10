import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from '../hoc/PrivateRoute';
import PublicRoute from '../hoc/PublicRoute';

import Home from '../pages/home/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/user/Profile';

const AppRoutes = () => {
   return (
      <Switch>
         {/* Trang HOME - không cần đăng nhập */}
         <Route
            path="/"
            exact
            render={(props) => (
               <PublicLayout {...props}>
                  <Home {...props} />
               </PublicLayout>
            )}
         />

         <PublicRoute
            path="/login"
            render={(props) => (
               <PublicLayout {...props}>
                  <Login {...props} />
               </PublicLayout>
            )}
         />
         <Route
            path="/logout"
            render={() => {
               localStorage.removeItem('token');
               localStorage.removeItem('roleId');
               return <Redirect to="/login" />;
            }}
         />

         <PublicRoute
            path="/register"
            render={(props) => (
               <PublicLayout {...props}>
                  <Register {...props} />
               </PublicLayout>
            )}
         />

         <PrivateRoute
            path="/profile"
            role="2"
            render={(props) => (
               <PublicLayout {...props}>
                  <Profile {...props} />
               </PublicLayout>
            )}
         />

         <PrivateRoute
            path="/admin"
            role="1"
            render={(props) => (
               <AdminLayout {...props}>
                  <div>Trang admin</div>
               </AdminLayout>
            )}
         />
         {/* Redirect fallback */}
         <Redirect to="/" />
      </Switch>
   );
};

export default AppRoutes;
