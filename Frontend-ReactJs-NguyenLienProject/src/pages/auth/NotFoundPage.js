import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.scss';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
   return (
      <div className="notfound-container">
         <motion.div
            className="notfound-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
         >
            <h1>404</h1>
            <h2>Oops! Trang không tồn tại</h2>
            <p>Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
            <Link to="/" className="back-home">Trở về trang chủ</Link>
         </motion.div>
      </div>
   );
};

export default NotFoundPage;
