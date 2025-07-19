import db from "../models/index"

export const checkEmailExists = async (userEmail) => {
   if (!userEmail || userEmail.trim() === "") return false;
   try {
      let user = await db.User.findOne({
         where: { email: userEmail.trim() }
      });
      return user ? true : false;
   } catch (error) {
      console.log("Error checking email:", error);
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
      console.log("Error checking phoneNumber:", error);
      return false;
   }
};
export const checkUserNameExists = async (userName) => {
   if (!userName || userName.trim() === "") return false; // Không kiểm tra nếu không có
   try {
      let user = await db.User.findOne({
         where: { userName: userName.trim() }
      });
      return user ? true : false;
   } catch (error) {
      console.log("Error checking userName:", error);
      return false;
   }
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