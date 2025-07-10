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

