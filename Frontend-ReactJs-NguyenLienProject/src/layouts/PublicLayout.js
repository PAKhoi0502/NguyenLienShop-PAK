import React, { useRef, useEffect, useState } from 'react';
import Header from '../components/header/HeaderPublic';
import Footer from '../components/footer/FooterPublic';
import Breadcrumb from '../components/Breadcrumb';
import './PublicLayout.scss';

const PublicLayout = ({ children }) => {
   const headerRef = useRef(null);
   const footerRef = useRef(null);
   const [headerHeight, setHeaderHeight] = useState(0);

   const updateHeaderHeight = () => {
      if (headerRef.current) {
         const height = headerRef.current.getBoundingClientRect().height;
         setHeaderHeight(height);
      }
   };

   useEffect(() => {
      updateHeaderHeight(); // lần đầu

      window.addEventListener('resize', updateHeaderHeight);
      window.addEventListener('scroll', updateHeaderHeight);
      return () => {
         window.removeEventListener('resize', updateHeaderHeight);
         window.removeEventListener('scroll', updateHeaderHeight);
      };
   }, []);

   useEffect(() => {
      const observer = new MutationObserver(() => updateHeaderHeight());
      if (headerRef.current) {
         observer.observe(headerRef.current, {
            attributes: true,
            childList: true,
            subtree: true,
         });
      }
      return () => observer.disconnect();
   }, []);

   return (
      <div className="public-layout">
         <Header ref={headerRef} />
         <Breadcrumb topOffset={headerHeight} />
         <main className="main-content">{children}</main>
         <Footer ref={footerRef} />
      </div>
   );
};

export default PublicLayout;
