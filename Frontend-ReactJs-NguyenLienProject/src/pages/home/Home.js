import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './Home.scss';

import Banner from '../../components/containerPublic/Banner';

const Home = () => {

   return (
      <div className="home-page">
         <Banner />
      </div>
   );
};

export default Home;