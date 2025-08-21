import React, { useState, useEffect } from 'react';
import { FaRegLightbulb } from 'react-icons/fa';
import './HintBox.scss';

const HintBox = ({ content, theme = 'default' }) => {
   const [show, setShow] = useState(false);

   const handleClickOutside = (e) => {
      if (e.target.classList.contains('hint-overlay')) {
         setShow(false);
      }
   };

   const handleCloseClick = (e) => {
      e.stopPropagation();
      setShow(false);
   };

   // Close on Escape key
   useEffect(() => {
      const handleEscapeKey = (e) => {
         if (e.key === 'Escape' && show) {
            setShow(false);
         }
      };

      if (show) {
         document.addEventListener('keydown', handleEscapeKey);
         document.body.style.overflow = 'hidden'; // Prevent background scroll
      }

      return () => {
         document.removeEventListener('keydown', handleEscapeKey);
         document.body.style.overflow = 'unset';
      };
   }, [show]);

   const getThemeClass = () => {
      switch (theme) {
         case 'product':
            return 'product-theme';
         case 'user':
            return 'user-theme';
         default:
            return '';
      }
   };

   return (
      <>
         <div className="hint-icon-wrapper">
            <FaRegLightbulb
               className="hint-icon"
               onClick={() => setShow(true)}
               title="Xem hướng dẫn"
               aria-label="Hiển thị hướng dẫn"
            />
         </div>

         {show && (
            <div className="hint-overlay" onClick={handleClickOutside}>
               <div className={`hint-box ${getThemeClass()}`} onClick={(e) => e.stopPropagation()}>
                  <div className="hint-close" onClick={handleCloseClick} aria-label="Đóng">
                     ×
                  </div>
                  {content}
               </div>
            </div>
         )}
      </>
   );
};

export default HintBox;
