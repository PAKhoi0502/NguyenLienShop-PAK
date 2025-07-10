const validateBodyFields = (requiredFields = []) => {
   return (req, res, next) => {
      const missing = requiredFields.filter(field => !req.body[field]);

      if (missing.length > 0) {
         return res.status(400).json({
            errCode: 1,
            message: `Missing fields: ${missing.join(', ')}`,
         });
      }

      next();
   };
};

export default validateBodyFields;
