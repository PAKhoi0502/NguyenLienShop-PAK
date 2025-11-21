import React, { useState, useEffect } from 'react';
import { FaRegLightbulb } from 'react-icons/fa';
import './HintBox.scss';

const useEscape = (active, onClose) => {
   useEffect(() => {
      if (!active) return;

      const handleKey = (e) => {
         if (e.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
   }, [active, onClose]);
};

const HintBox = ({ content }) => {
   const [show, setShow] = useState(false);

   const open = () => setShow(true);
   const close = () => setShow(false);

   useEscape(show, close);

   useEffect(() => {
      if (show) {
         document.body.classList.add('no-scroll');
      } else {
         document.body.classList.remove('no-scroll');
      }

      return () => document.body.classList.remove('no-scroll');
   }, [show]);

   return (
      <>
         <div className="hint-icon-wrapper">
            <FaRegLightbulb
               className="hint-icon"
               onClick={open}
               aria-label="Hiển thị hướng dẫn"
            />
         </div>

         {show && (
            <div className="hint-overlay" onClick={close}>
               <div
                  className="hint-box"
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="hint-box-header">
                     <div className="hint-close" onClick={close} aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                           viewBox="0 0 24 24" strokeWidth="1.5"
                           stroke="currentColor" className="hint-close-icon">
                           <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                        </svg>
                     </div>
                  </div>
                  <div className="hint-box-content">
                     {content}
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default HintBox;
