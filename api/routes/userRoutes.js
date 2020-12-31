const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.post('/forget-password', authController.forgotPassword);
router.patch('/reset-password/:resetToken', authController.resetPassword);

router.use(authController.protect);

router.post('/logout', authController.logOut);

router
  .route('/currentUser')
  .get(userController.getCurrentUserInfo, userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateCurrentUser
  )
  .delete(userController.deleteCurrentUser);

router.patch('/updateUserPassword', authController.updateUserPassword);
router.patch('/deactivateAccount', userController.deactivateAccount);
router.patch('/reactivateAccount', authController.reactivateAccount);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updataUser)
  .delete(userController.deleteUser);

module.exports = router;
