import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const { isTokenBlacklisted } = require('../utils/tokenUtils');

dotenv.config(); // để đọc biến .env

const secret = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
   const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

   if (!token) {
      return res.status(401).json({ message: 'Token not provided!' });
   }

   // ✅ Kiểm tra token có bị blacklist không
   if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Token has been revoked. Please login again.' });
   }

   try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded; // thêm info user vào req
      req.token = token; // thêm token vào req để có thể dùng khi logout
      next();
   } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
   }
};

export const checkOwner = (req, res, next) => {
   const loggedInUserId = req.user?.id;
   const targetUserId = parseInt(req.params.id);

   if (loggedInUserId !== targetUserId) {
      return res.status(403).json({ message: 'Access denied: Not owner' });
   }
   next();
};

export const isRole = (requiredRoleId) => {
   return (req, res, next) => {
      if (req.user?.roleId !== requiredRoleId) {
         return res.status(403).json({ message: 'Access denied' });
      }
      next();
   };
};



