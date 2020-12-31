const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createJwtToken = id => {
  const payload = {
    user: {
      id,
    },
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  const { authorization } = req.headers;
  const xAuth = req.header('x-auth-token');

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (xAuth) {
    token = xAuth;
  }

  if (!token)
    return next(
      new AppError('Your are not logged in! Please login to  get access!', 401)
    );

  const verify = promisify(jwt.verify);
  const { user, iat, exp } = await verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(user.id).select(
    '+lastPasswordChangedAt +active'
  );

  if (!currentUser)
    return next(
      new AppError('User belonging to this token does not exist anymore!', 401)
    );

  if (!currentUser.active)
    return next(
      new AppError(
        'You have deactivated your account. Reactivate it to get access!',
        401
      )
    );

  if (currentUser.lastPasswordChangedAt && currentUser.havePasswordChanged(iat))
    return next(
      new AppError(
        'User have recently changes password! Please login again!',
        401
      )
    );

  /* 
  if (currentUser.lastLoggedOutAt && currentUser.haveUserLoggedOut(decoded.iat))
    return next(new AppError('User have logged out! Please login again!', 401));
  currentUser.lastLoggedOutAt = undefined;
 */

  currentUser.lastPasswordChangedAt = undefined;
  currentUser.active = undefined;
  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permision to perform this action!', 403)
      );
    }
    next();
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  console.log(newUser.id);
  const token = createJwtToken(newUser.id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password)))
    return next(
      new AppError('Authentication failed!! Incorrect email or password!!', 401)
    );

  let token = createJwtToken(user.id);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});

exports.logOut = catchAsync(async (req, res, next) => {});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Please provide a email!', 400));

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError('There is no user with this email addess!', 403));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  /* send email */

  res.status(200).json({
    status: 'success',
    message: 'Successfully sent the email for passward reset!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide password and confirm password', 400)
    );

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired!', 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  user.password = undefined;
  user.passwordConfirm = undefined;

  let token = createJwtToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// user and admin can update his own password (user password required)
// admin can also update others password with thier emils (admin password required)
exports.updateUserPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm, email } = req.body;

  const isAdmin = req.user.role.includes('admin');
  let user;

  if (isAdmin && email) {
    user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user with this email is present!', 400));
    }

    let admin = User.findById(adminId);

    if (!(await admin.correctPassword(currentPassword)))
      return next(new AppError('Your password is worng!', 401));
  } else {
    user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword)))
      return next(new AppError('Your current password is worng!', 401));

    if (currentPassword === newPassword)
      return next(
        new AppError(
          "New password can't be equal to the current password!",
          400
        )
      );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.save();

  user.password = undefined;
  user.passwordConfirm = undefined;

  if (isAdmin && email) {
    res.status(200).json({
      status: 'success',
      message: 'Successfully updated the password of the user!',
    });
  } else {
    let token = createJwtToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }
});

exports.reactivateAccount = catchAsync(async (req, res, next) => {});
