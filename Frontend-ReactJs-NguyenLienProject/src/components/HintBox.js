import React, { useState } from 'react';
import { FaRegLightbulb } from 'react-icons/fa';
import './HintBox.scss';

const HintBox = ({ content }) => {
   const [show, setShow] = useState(false);

   const handleClickOutside = (e) => {
      if (e.target.classList.contains('hint-overlay')) {
         setShow(false);
      }
   };

   return (
      <>
         <div className="hint-icon-wrapper">
            <FaRegLightbulb
               className="hint-icon"
               onClick={() => setShow(true)}
               title="Hint"
            />
         </div>

         {show && (
            <div className="hint-overlay" onClick={handleClickOutside}>
               <div className="hint-box">
                  {content}
               </div>
            </div>
         )}
      </>
   );
};

export default HintBox;
