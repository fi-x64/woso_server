const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const moment = require('moment');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.query.userId = req.user._id;
  next();
};

exports.searchUser = catchAsync(async (req, res, next) => {
  const values = req.query.keyWord;

  const filteredData = await NguoiDung.find({
    $or: [
      { hoTen: { $regex: '.*' + values + '.*', $options: 'i' } },
      { email: { $regex: '.*' + values + '.*', $options: 'i' } },
      { sdt: { $regex: '.*' + values + '.*', $options: 'i' } },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: filteredData,
  });
});

exports.countSoLuongNguoiDung = catchAsync(async (req, res, next) => {
  const now = new Date();

  const totalUser = await NguoiDung.find({ trangThai: true }).count();

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthStart = new Date();

  const data = await NguoiDung.aggregate([
    {
      $match: {
        trangThai: true,
        thoiGianTao: { $gte: lastMonthStart, $lte: thisMonthStart },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$thoiGianTao' },
          year: { $year: '$thoiGianTao' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  var percentage = 0;
  if (data) {
    var lastMonthCount = 0;
    var thisMonthCount = 0;
    if (data[0]?.count) {
      lastMonthCount = data[0].count;
    }
    if (data[1]?.count) {
      thisMonthCount = data[1].count;
    }

    if (lastMonthCount != 0)
      percentage = Math.floor(
        ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
      );
    else percentage = Math.floor(((thisMonthCount - lastMonthCount) / 1) * 100);
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalUser,
      percentage,
    },
  });
});

exports.countSoLuongTinDang = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const data = await NguoiDung.findById(userId);

  const soLuongTinDang = data.goiTinDang.soLuongTinDang;

  res.status(200).json({
    status: 'success',
    data: soLuongTinDang,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  // if (req.body.matKhau || req.body.xacNhanMatKhau) {
  //   return next(
  //     new AppError(
  //       'This route is not for password updates. Please use /updateMyPassword.',
  //       400
  //     )
  //   );
  // }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  // const filteredBody = filterObj(req.body, 'sdt', 'email');
  // console.log("Check filteredBody: ", filteredBody);

  // 3) Update user document
  const updatedUser = await NguoiDung.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await NguoiDung.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getAllTinhThanh = catchAsync(async (req, res) => {
  const tinhThanh = await TinhTP.find();
  res.status(200).json({
    status: 'success',
    data: tinhThanh,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let doc = await NguoiDung.findById(req.query.userId);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// exports.getUserProfile = catchAsync(async (req, res, next) => {
//   const userId = mongoose.Types.ObjectId(req.query.userId);

//   const doc = await NguoiDung.aggregate([
//     {
//       $match: {
//         _id: userId,
//       },
//     },
//     {
//       $lookup: {
//         from: 'goidangkys',
//         localField: 'goiTinDang.id',
//         foreignField: '_id',
//         as: 'goiTinDang',
//       },
//     },
//     {
//       $lookup: {
//         from: 'phuongxas',
//         localField: 'diaChi.phuongXaCode',
//         foreignField: '_id',
//         as: 'phuongXa',
//       },
//     },
//   ]);

//   if (!doc) {
//     return next(new AppError('No document found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: doc,
//     },
//   });
// });

exports.getAllUsers = factory.getAll(NguoiDung, 'quyen');

// Do NOT update passwords with this!
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = req.body;
  if (user.quyen?._id) {
    user.quyen = user.quyen._id;
  }
  if (user.matKhau) {
    delete user.matKhau;
  }
  if (user.xacNhanMatKhau) {
    delete user.xacNhanMatKhau;
  }

  var doc = await NguoiDung.findByIdAndUpdate(req.params.id, user, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.statisticsUserInWeek = catchAsync(async (req, res, next) => {
  const currentDate = Date.now();
  const lastWeekDate = moment(currentDate).subtract(7, 'days');

  const data = await NguoiDung.aggregate([
    {
      $match: {
        thoiGianTao: {
          $gte: new Date(lastWeekDate),
          $lte: new Date(currentDate),
        },
      },
    },
    {
      $sort: {
        thoiGianTao: -1,
      },
    },
    {
      $project: {
        day: {
          $dayOfMonth: '$thoiGianTao',
        },
        month: {
          $month: '$thoiGianTao',
        },
        year: {
          $year: '$thoiGianTao',
        },
      },
    },
    {
      $group: {
        _id: {
          day: '$day',
          year: '$year',
          month: '$month',
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: '$_id.day',
        month: '$_id.month',
        year: '$_id.year',
        count: '$count',
      },
    },
  ]);

  if (!data) {
    return next(new AppError('No statistics found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: data,
  });
});

exports.deleteUser = factory.deleteOne(NguoiDung);
