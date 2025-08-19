// src/utils/authContext.js
// Global auth context to sync authentication state

let authListeners = [];

export const addAuthListener = (callback) => {
   authListeners.push(callback);
   return () => {
      authListeners = authListeners.filter(listener => listener !== callback);
   };
};

export const notifyAuthChange = () => {
   authListeners.forEach(callback => callback());
};

export const clearAuthListeners = () => {
   authListeners = [];
};
