// src/pages/auth/Logout.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as actions from '../../store/actions';

const Logout = () => {
   const dispatch = useDispatch();
   const history = useHistory();

   useEffect(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');
      dispatch(actions.processLogout());
      history.push('/login');
   }, [dispatch, history]);

   return null;
};

export default Logout;
