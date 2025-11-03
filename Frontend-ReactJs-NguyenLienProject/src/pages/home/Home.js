import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './Home.scss';

import Banner from '../../components/containerPublic/Banner/Banner';
import VoucherList from '../../components/containerPublic/Voucher/VoucherList';
import BasicInfo from '../../components/containerPublic/BasicInfo/BasicInfo';

const Home = () => {

   return (
      <div className="home-page">
         <main className="main-content no-padding">
            <Banner />
            <VoucherList />
            <BasicInfo />
         </main>
      </div>
   );
};

export default Home;