import db from '../models';

let getUserInfoById = async (userId) => {
   try {
      const user = await db.User.findOne({
         where: { id: userId },
         attributes: { exclude: ['password'] },
         include: [
            {
               model: db.Role,
               attributes: ['name']
            }
         ]
      });

      return user || null;
   } catch (error) {
      throw new Error('Database error when fetching user info');
   }
};

export default {
   getUserInfoById: getUserInfoById,
};