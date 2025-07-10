const sendResponse = (res, {
   status = 200,
   errCode = 0,
   message = 'Success',
   data = null,
   token = null
}) => {
   const response = { errCode, message };
   if (data !== null) response.data = data;
   if (token) response.token = token;

   return res.status(status).json(response);
};

export default sendResponse;
