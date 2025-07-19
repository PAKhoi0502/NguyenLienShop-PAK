import webRoutesBackend from './webRoutesBackend.js';
import apiRoutes from './apiRoutes.js';

const initRoutes = (app) => {
   app.use('/', webRoutesBackend);              // View-based routing
   app.use('/api', apiRoutes);                // API-based routing

};

export default initRoutes; 