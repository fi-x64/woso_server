const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const db = require("../models");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");

const User = db.userModel;
const Role = db.roleModel;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

const correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

exports.signup = catchAsync(async (req, res, next) => {
  const check = await User.findOne({
    where: {
      [Sequelize.Op.or]: [{ email: req.body.email }],
    },
  });

  if (check) {
    res.status(200).json({
      status: "fail",
      message: "Email has existed",
    });
  } else {
    const passwordHash = await bcrypt.hash(req.body.password, 12);

    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: passwordHash,
    });
    if (newUser) {
      res.status(200).json({
        status: "success",
        message: "Account created successfully",
      });
    }
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    res.status(200).json({
      status: "error",
      message: "Email not exists",
    });
  }
  // 2) Check if user exists && password is correct
  // const user = await User.findOne({ email }).select('+password');
  const user = await User.findOne({
    where: { email },
    include: {
      // attributes: ['id', 'name'],
      model: Role,
      raw: true,
    },
  });

  if (!user || !(await correctPassword(password, user.password))) {
    return next(new AppError("Email or password is incorrect", 401));
    // return res.status(200).json({
    //   status: "error",
    //   error: "Email or password is incorrect",
    // });
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access.", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("Token is expired. Please login again", 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.quyen.ten)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.createOTP = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        "Không tìm thấy người dùng với email này trên hệ thống.",
        404
      )
    );
  }

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("OTP không đúng hoặc đã hết hạn", 400));
  }
  user.otp = undefined;
  user.hanDatLaiOTP = undefined;
  user.trangThai = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Đã kích hoạt tài khoản thành công!",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  var user = await User.findById(req.user.id).select("+matKhau");

  if (!user) {
    var user = await User.findById(req.user.id);
  }

  // 2) Check if POSTed current password is correct
  if (user.matKhau) {
    if (!(await correctPassword(req.body.passwordCurrent, user.matKhau))) {
      return res.status(200).json({
        status: "error",
        message: "Mật khẩu hiện tại không đúng!",
      });
    }
  }

  // 3) If so, update password
  user.matKhau = req.body.password;
  user.xacNhanMatKhau = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on POSTed email
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return res.status(200).json({
//       status: 'error',
//       message: 'Không tìm thấy người dùng với email này trên hệ thống.',
//     });
//   }

//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it to user's email
//   const resetURL = `http://localhost:5173/resetPassword?resetToken=${resetToken}`;

//   const message = `Có phải bạn đã quên mật khẩu? Nếu bạn thực hiện điều này, vui lòng nhấn vào đường link sau để tiến hành xác nhận đổi mật khẩu: ${resetURL}.\nNếu bạn không thực hiện điều này, hãy bỏ qua email này!`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject:
//         'Token xác nhận đặt lại mật khẩu (có hiệu lực trong vòng 10 phút)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token đã được gửi đến email!',
//     });
//   } catch (err) {
//     user.tokenDatLaiMatKhau = undefined;
//     user.hanDatLaiMatKhau = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError('Có lỗi trong khi gửi email. Xin vui lòng hãy thử lại!'),
//       500
//     );
//   }
// });

exports.validateToken = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex");

  const user = await User.findOne({
    tokenDatLaiMatKhau: hashedToken,
    hanDatLaiMatKhau: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(200).json({
      status: "error",
      message: "Token không đúng hoặc đã hết hạn!",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Token hợp lệ!",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    tokenDatLaiMatKhau: hashedToken,
    hanDatLaiMatKhau: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(200).json({
      status: "error",
      message: "Token không đúng hoặc đã hết hạn!",
    });
  }
  user.matKhau = req.body.password;
  user.xacNhanMatKhau = req.body.confirmPassword;
  user.tokenDatLaiMatKhau = undefined;
  user.hanDatLaiMatKhau = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  return res.status(200).json({
    status: "success",
    message: "Đã đặt lại mật khẩu thành công!",
  });
});
