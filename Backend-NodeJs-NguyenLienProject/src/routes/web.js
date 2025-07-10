import webRoutes from './webRoutes.js';
import apiRoutes from './apiRoutes.js';

const initRoutes = (app) => {
   app.use('/', webRoutes);              // View-based routing
   app.use('/api', apiRoutes);           // All API under /api/*
};

export default initRoutes;
