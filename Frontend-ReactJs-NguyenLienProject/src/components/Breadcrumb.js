import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumb = () => {
   const location = useLocation();
   const pathnames = location.pathname.split('/').filter(x => x);

   return (
      <nav className="breadcrumb">
         <Link to="/">Trang chủ</Link>
         {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            return <span key={index}> / <Link to={routeTo}>{name}</Link></span>;
         })}
      </nav>
   );
};

export default Breadcrumb;
