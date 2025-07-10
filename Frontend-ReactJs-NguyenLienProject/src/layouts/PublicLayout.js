import React from 'react';
import Header from '../components/header/HeaderPublic';
import Footer from '../components/footer/FooterPublic';
import './PublicLayout.scss';

const PublicLayout = (props) => {
   return (
      <div className="public-layout">
         <Header />
         <main className="main-content">
            {props.children}
         </main>
         <Footer />
      </div>
   );
};

export default PublicLayout;
