import backendService from '../services/backendService';
import { checkEmailExists, checkPhoneNumberExists, checkUserNameExists } from '../utils/validators';

let homePage = (req, res) => {
   return res.render('homePage.ejs');
};

let userManager = async (req, res) => {
   try {
      const data = await backendService.getAllUser();
      const message = req.query.message || null;
      return res.render('userManager.ejs', { dataTable: data, message });
   } catch (error) {
      console.error(error);
      return res.status(500).send('Đã xảy ra lỗi khi tải danh sách người dùng.');
   }
};

let createNewUser = (req, res) => {
   return res.render('createNewUser.ejs', {
      errorMessage: null,
      oldInput: null,
      emailError: null,
      phoneError: null,
      passwordError: null
   });
};

let postCreateNewUser = async (req, res) => {
   try {
      const { password, phoneNumber, roleId, email, userName } = req.body;

      // Trim dữ liệu
      req.body.password = password?.trim();
      req.body.phoneNumber = phoneNumber?.trim();
      req.body.email = email?.trim();
      req.body.userName = userName?.trim(); // Không bắt buộc

      const oldInput = req.body;

      if (!password || !roleId || !phoneNumber || !email) {
         return res.render('createNewUser.ejs', {
            errorMessage: 'Please fill in all required fields!',
            oldInput,
            emailError: null,
            phoneError: null,
            passwordError: null
         });
      }

      // Validate độ dài password
      if (password.length < 6) {
         return res.render('createNewUser.ejs', {
            errorMessage: null,
            oldInput,
            passwordError: 'Password must be at least 6 characters!',
            emailError: null,
            phoneError: null
         });
      }

      // Nếu nhập userName → kiểm tra có bị trùng không
      if (userName) {
         const userNameExists = await checkUserNameExists(userName);
         if (userNameExists) {
            return res.render('createNewUser.ejs', {
               errorMessage: 'Username (nickname) already exists!',
               oldInput,
               emailError: null,
               phoneError: null,
               passwordError: null
            });
         }
      }

      // Validate số điện thoại
      const phonePattern = /^0\d{9}$/;
      if (phoneNumber && !phonePattern.test(phoneNumber)) {
         return res.render('createNewUser.ejs', {
            errorMessage: null,
            oldInput,
            phoneError: 'Invalid phone number format (must start with 0 and be 10 digits)',
            emailError: null,
            passwordError: null
         });
      }

      if (phoneNumber) {
         const phoneExists = await checkPhoneNumberExists(phoneNumber);
         if (phoneExists) {
            return res.render('createNewUser.ejs', {
               errorMessage: null,
               oldInput,
               phoneError: 'Phone number already exists!',
               emailError: null,
               passwordError: null
            });
         }
      }

      // Validate email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailPattern.test(email)) {
         return res.render('createNewUser.ejs', {
            errorMessage: null,
            oldInput,
            emailError: 'Invalid email format!',
            phoneError: null,
            passwordError: null
         });
      }

      if (email) {
         const emailExists = await checkEmailExists(email);
         if (emailExists) {
            return res.render('createNewUser.ejs', {
               errorMessage: null,
               oldInput,
               emailError: 'Email already exists!',
               phoneError: null,
               passwordError: null
            });
         }
      }

      // Tạo người dùng
      await backendService.createNewUser(req.body);

      return res.redirect('/user-manager?message=User created successfully');
   } catch (error) {
      console.error('Error creating account: ', error);
      return res.status(500).send("An error occurred while creating the user!");
   }
};

let editUser = async (req, res) => {
   const userId = req.query.id;
   if (!userId) return res.status(404).send("Không tìm thấy người dùng.");

   try {
      const userData = await backendService.getUserInfoById(userId);
      return res.render("updateUser.ejs", {
         user: userData,
         error: null
      });
   } catch (error) {
      console.error(error);
      return res.status(500).send("Lỗi khi tải dữ liệu người dùng.");
   }
};

let updateUser = async (req, res) => {
   try {
      const data = req.body;
      const result = await backendService.updateUserData(data);

      if (result.errCode === 0) {
         return res.redirect('/user-manager');
      }
      else {
         return res.render("updateUser.ejs", {
            user: data,
            error: result.errMessage || 'Update user failed.',
            emailError: result.errCode === 3 ? result.errMessage : null,
            phoneError: result.errCode === 5 ? result.errMessage : null
         });
      }
   } catch (error) {
      console.error("User update error:", error);
      return res.status(500).send("An error occurred while updating the user.");
   }
};

let deleteUser = async (req, res) => {
   const id = req.query.id;
   if (!id) return res.status(404).send("Missing user!");

   try {
      const result = await backendService.deleteUserById(id);
      if (result.errCode === 0) {
         return res.redirect('/user-manager');
      } else {
         return res.status(404).send("User does not exist.");
      }

   } catch (error) {
      console.error("Error deleting user::", error);
      return res.status(500).send("An error occurred while deleting the user.");
   }
};

export default {
   homePage,
   userManager,
   createNewUser,
   postCreateNewUser,
   editUser,
   updateUser,
   deleteUser,
};
