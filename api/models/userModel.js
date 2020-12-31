const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a Email!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    photo: {
      type: String,
      trim: true,
      default: 'default.jpg',
      validate: {
        validator: function (el) {
          console.log(this.photo);
          return el !== '';
        },
        message: "Photo can't be null or a empty string!",
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guide', 'lead-guide'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Confirm password don't match",
      },
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: String,
      select: false,
    },
    lastPasswordChangedAt: {
      type: Date,
      select: false,
    },
    // lastLoggedOutAt: {
    //   type: Date,
    //   select: false,
    // },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    collection: 'users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.havePasswordChanged = function (JwtIssuedAtTime) {
  const lastPasswordChangedAt = this.lastPasswordChangedAt.getTime() / 1000;
  return JwtIssuedAtTime < lastPasswordChangedAt;
};

// userSchema.methods.haveUserLoggedOut = function (JwtIssuedAtTime) {
//   const lastLoggedOutAt = this.lastLoggedOutAt.getTime() / 1000;
//   return JwtIssuedAtTime < lastLoggedOutAt;
// };

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
