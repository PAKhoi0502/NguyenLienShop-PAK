import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './Home.scss';

import Banner from '../../components/containerPublic/Banner/Banner';
import BasicInfo from '../../components/containerPublic/BasicInfo/BasicInfo';

const Home = () => {

   return (
      <div className="home-page">
         <main className="main-content no-padding">
            <Banner />
            <BasicInfo />
         </main>
      </div>
   );
};

export default Home;