import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import './Profile.scss';

const Profile = () => {
   const lang = useSelector((state) => state.app.language);
   const { isLoggedIn, adminInfo } = useSelector((state) => state.admin);
   const navigate = useNavigate();

   if (!isLoggedIn) {
      navigate('/login');
      return null;
   }

   return (
      <div className="profile-page">
         <h1>
            <FormattedMessage id="profile.title" defaultMessage="User Profile" />
         </h1>
         <div className="profile-info">
            <p>
               <strong>
                  <FormattedMessage id="profile.name" defaultMessage="Full Name" />
               </strong>
               : {adminInfo?.fullName || 'N/A'}
            </p>
            <p>
               <strong>
                  <FormattedMessage id="profile.phone" defaultMessage="Phone Number" />
               </strong>
               : {adminInfo?.phoneNumber || 'N/A'}
            </p>
            <p>
               <strong>
                  <FormattedMessage id="profile.role" defaultMessage="Role" />
               </strong>
               : {adminInfo?.roleId === 1 ? 'Admin' : adminInfo?.roleId === 2 ? 'User' : 'N/A'}
            </p>
         </div>
      </div>
   );
};

export default Profile;