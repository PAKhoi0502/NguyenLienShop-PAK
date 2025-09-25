import db from "../models/index.js"

export const checkEmailExists = async (userEmail) => {
   if (!userEmail || userEmail.trim() === "") return false;
   try {
      let user = await db.User.findOne({
         where: { email: userEmail.trim() }
      });
      return user ? true : false;
   } catch (error) {
      return false;
   }
};
export const checkPhoneNumberExists = async (phoneNumber) => {
   try {
      let user = await db.User.findOne({
         where: { phoneNumber: phoneNumber }
      });
      return user ? true : false;
   } catch (error) {
      return false;
   }
};

// Validate Vietnamese phone number format
export const validateVietnamesePhoneNumber = (phoneNumber) => {
   if (!phoneNumber || typeof phoneNumber !== 'string') {
      return false;
   }

   // Must be exactly digits only (no spaces, dashes, or other characters)
   if (!/^\d+$/.test(phoneNumber)) {
      return false;
   }

   // Must be exactly 10 digits
   if (phoneNumber.length !== 10) {
      return false;
   }

   // Must start with 0
   if (!phoneNumber.startsWith('0')) {
      return false;
   }

   // Valid Vietnamese network prefixes
   const validPrefixes = [
      '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
      '086', '096', '097', '098', // Viettel old
      '081', '082', '083', '084', '085', '088', '091', '094', // VinaPhone
      '070', '076', '077', '078', '079', '089', '090', '093', // MobiFone
      '052', '056', '058', '092', // Vietnamobile
      '059', '099' // Gmobile
   ];

   const prefix = phoneNumber.substring(0, 3);
   return validPrefixes.includes(prefix);
};
export const checkUserNameExists = async (userName) => {
   if (!userName || userName.trim() === "") return false;
   try {
      let user = await db.User.findOne({
         where: { userName: userName.trim() }
      });
      return user ? true : false;
   } catch (error) {
      return false;
   }
};

// Generate random username with format: user + 7 random digits
export const generateRandomUsername = () => {
   const randomNumbers = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
   return `user${randomNumbers}`;
};

// Generate unique random username (check database for duplicates)
export const generateUniqueUsername = async () => {
   let username;
   let exists = true;
   let attempts = 0;
   const maxAttempts = 10; // Prevent infinite loop

   while (exists && attempts < maxAttempts) {
      username = generateRandomUsername();
      exists = await checkUserNameExists(username);
      attempts++;
   }

   return username;
};
export const formatDateString = (input) => {
   const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
   const match = input.match(regex);

   if (!match) {
      return null;
   }

   const day = parseInt(match[1]);
   const month = parseInt(match[2]);
   const year = parseInt(match[3]);

   const isValidDate = (d, m, y) => {
      const date = new Date(`${y}-${m}-${d}`);
      return (
         date &&
         date.getFullYear() === y &&
         date.getMonth() + 1 === m &&
         date.getDate() === d
      );
   };

   if (!isValidDate(day, month, year)) {
      return null;
   }

   // Format lại chuỗi
   const pad = (n) => (n < 10 ? '0' + n : n);
   return `${year}-${pad(month)}-${pad(day)}`;
};